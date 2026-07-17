"""Business logic for extracting secret messages from stego images."""

import base64
from io import BytesIO
from typing import Any

import numpy as np
from PIL import Image

from app.core.exceptions import ImageProcessingError, InvalidMetadataError
from app.core.model import extract_features
from app.modules.threshold import Threshold
from app.modules.lsb_extractor import LSBExtractor


def _decode_base64_image(b64: str) -> np.ndarray:
    """Decode a base64 string to a numpy RGB array."""
    try:
        if "," in b64:
            b64 = b64.split(",", 1)[1]
        img_bytes = base64.b64decode(b64)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        return np.array(img, dtype=np.uint8)
    except Exception as e:
        raise ImageProcessingError(f"Invalid base64 stego image: {e}")


def process_extract(stego_image_b64: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """Extract a secret message from a stego image.

    Pipeline:
        1. Decode base64 stego image.
        2. Re-extract CNN coefficient map from stego.
        3. Re-generate binary map with same threshold.
        4. Extract message via LSB.

    Args:
        stego_image_b64: Base64-encoded stego image.
        metadata: Extraction metadata (message_length_bits, threshold_percent, etc.).

    Returns:
        Dict with message, message_length_chars, extraction_method.

    Raises:
        InvalidMetadataError: If required metadata fields are missing.
        ImageProcessingError: If image decoding fails.
    """
    required_fields = ["message_length_bits", "threshold_percent"]
    missing = [f for f in required_fields if f not in metadata]
    if missing:
        raise InvalidMetadataError(f"Missing required metadata fields: {', '.join(missing)}")

    stego_image = _decode_base64_image(stego_image_b64)

    # Resize to standard CNN input size
    pil_img = Image.fromarray(stego_image)
    pil_img = pil_img.resize((224, 224), Image.BILINEAR)
    stego_image = np.array(pil_img, dtype=np.uint8)

    coefficient_map = extract_features(stego_image)

    threshold_percent = metadata["threshold_percent"]
    message_length_bits = metadata["message_length_bits"]

    threshold = Threshold(coefficient_map=coefficient_map)
    binary_map = threshold.generate_binary_map(threshold_percent)

    extractor = LSBExtractor(
        stego_image=stego_image,
        binary_map=binary_map,
        coefficient_map=coefficient_map,
    )
    extracted_message = extractor.extract(message_length_bits)

    return {
        "message": extracted_message,
        "message_length_chars": len(extracted_message),
        "extraction_method": "cnn_guided_lsb",
    }
