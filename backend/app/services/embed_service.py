"""Business logic for embedding secret messages into cover images."""

import base64
from io import BytesIO
from typing import Any

import numpy as np
from PIL import Image

from app.core.exceptions import (
    CapacityExceededError,
    ImageProcessingError,
)
from app.core.model import extract_features
from app.modules.threshold import Threshold
from app.modules.lsb_embedder import LSBEmbedder
from app.modules.metrics import Metrics
from app.services.history_service import save_process


def _decode_base64_image(b64: str) -> np.ndarray:
    """Decode a base64 string to a numpy RGB array."""
    try:
        if "," in b64:
            b64 = b64.split(",", 1)[1]
        img_bytes = base64.b64decode(b64)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        return np.array(img, dtype=np.uint8)
    except Exception as e:
        raise ImageProcessingError(f"Invalid base64 image: {e}")


def _encode_image_to_base64(image: np.ndarray) -> str:
    """Encode a numpy RGB array to a base64 PNG data URL."""
    img = Image.fromarray(image)
    buf = BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def process_embed(
    cover_image_b64: str,
    message: str,
    threshold_percent: int,
) -> dict[str, Any]:
    """Embed a secret message into a cover image using CNN-guided LSB.

    Pipeline:
        1. Decode base64 cover image.
        2. Resize to 224x224 (CNN input size).
        3. Extract CNN coefficient map.
        4. Generate binary embedding map from threshold.
        5. Embed message via LSB.
        6. Compute quality metrics.
        7. Persist to database.
        8. Return stego image + metadata.

    Args:
        cover_image_b64: Base64-encoded cover image.
        message: Secret message string to embed.
        threshold_percent: Threshold percentage for pixel selection (5-95).

    Returns:
        Dict with stego_image, metadata, metrics.

    Raises:
        ImageProcessingError: If image decoding or processing fails.
        CapacityExceededError: If message exceeds embedding capacity.
    """
    cover_image = _decode_base64_image(cover_image_b64)

    # Resize to standard CNN input size
    pil_img = Image.fromarray(cover_image)
    pil_img = pil_img.resize((224, 224), Image.BILINEAR)
    cover_image = np.array(pil_img, dtype=np.uint8)

    coefficient_map = extract_features(cover_image)

    threshold = Threshold(coefficient_map=coefficient_map)
    binary_map = threshold.generate_binary_map(threshold_percent)
    threshold_info = threshold.calculate_threshold(threshold_percent)

    embedder = LSBEmbedder(
        cover_image=cover_image,
        binary_map=binary_map,
        coefficient_map=coefficient_map,
    )
    stego_image = embedder.embed(message)

    metrics_calculator = Metrics(original=cover_image, stego=stego_image)
    metrics = metrics_calculator.get_all_metrics()

    total_pixels = int(cover_image.shape[0] * cover_image.shape[1])
    selected_pixels = threshold_info["selected_pixels"]
    message_bits = len(message) * 8
    capacity_bits = threshold_info["bit_capacity"]
    usage_percent = (message_bits / capacity_bits * 100) if capacity_bits > 0 else 0.0

    if message_bits > capacity_bits:
        raise CapacityExceededError(
            f"Message requires {message_bits} bits but capacity is only {capacity_bits} bits"
        )

    metadata = {
        "threshold_percent": threshold_percent,
        "threshold_value": threshold_info["threshold_value"],
        "selected_pixels": selected_pixels,
        "total_pixels": total_pixels,
        "capacity_bits": capacity_bits,
        "message_length_bits": message_bits,
    }

    history_data = {
        "process_type": "embed",
        "image_name": "cover_image",
        "message_length_chars": len(message),
        "message_length_bits": message_bits,
        "threshold_percent": threshold_percent,
        "selected_pixels": selected_pixels,
        "total_pixels": total_pixels,
        "capacity_bits": capacity_bits,
        "usage_percent": round(usage_percent, 2),
        "psnr_db": metrics.get("psnr_db"),
        "ssim": metrics.get("ssim"),
        "mse": metrics.get("mse"),
    }
    process_id = save_process(history_data)

    metadata["process_id"] = process_id

    stego_b64 = _encode_image_to_base64(stego_image)

    visualization_data = {
        "coefficient_map": coefficient_map.tolist(),
        "binary_map": binary_map.tolist(),
    }

    return {
        "stego_image": stego_b64,
        "metadata": metadata,
        "metrics": metrics,
        "visualization_data": visualization_data,
    }
