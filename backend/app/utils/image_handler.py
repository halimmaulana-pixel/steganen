"""Image encoding, decoding, and validation utilities."""

import base64
import io
from typing import Optional, Tuple

import numpy as np
from PIL import Image

from app.core.config import settings
from app.core.exceptions import ImageProcessingError, ValidationError


def decode_base64_image(base64_str: str) -> Image.Image:
    """Decode a base64 string into a PIL Image.

    Args:
        base64_str: Base64-encoded image data, optionally prefixed with a data URI.

    Returns:
        Decoded PIL Image in RGB mode.

    Raises:
        ImageProcessingError: If decoding fails or the data is invalid.
    """
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]

        image_bytes = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(image_bytes))
        return image.convert("RGB")
    except Exception as e:
        raise ImageProcessingError(f"Failed to decode base64 image: {e}")


def encode_image_base64(image: Image.Image, format: str = "PNG") -> str:
    """Encode a PIL Image to a base64 string.

    Args:
        image: PIL Image to encode.
        format: Output image format (PNG, JPEG, etc.).

    Returns:
        Base64-encoded string of the image.
    """
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def validate_image(image: Image.Image) -> bool:
    """Validate that an image meets processing requirements.

    Checks:
        - Image format is supported (JPEG, PNG).
        - Image file size is within the configured limit.
        - Image mode is RGB or can be converted to RGB.

    Args:
        image: PIL Image to validate.

    Returns:
        True if valid.

    Raises:
        ValidationError: If any validation check fails.
    """
    supported_formats = {"JPEG", "PNG", "JPG"}
    if image.format and image.format.upper() not in supported_formats:
        raise ValidationError(
            f"Unsupported image format '{image.format}'. Use JPEG or PNG."
        )

    buffer = io.BytesIO()
    image.save(buffer, format=image.format or "PNG")
    size_bytes = buffer.tell()
    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise ValidationError(
            f"Image size ({size_bytes / (1024 * 1024):.1f} MB) exceeds "
            f"limit ({settings.MAX_IMAGE_SIZE_MB} MB)"
        )

    if image.mode not in ("RGB", "RGBA", "L"):
        raise ValidationError(f"Unsupported image mode '{image.mode}'")

    return True


def resize_image(image: Image.Image, size: Tuple[int, int] = (224, 224)) -> Image.Image:
    """Resize an image using high-quality resampling.

    Args:
        image: PIL Image to resize.
        size: Target (width, height).

    Returns:
        Resized PIL Image.
    """
    return image.resize(size, Image.Resampling.LANCZOS)


def numpy_to_image(array: np.ndarray) -> Image.Image:
    """Convert a numpy array to a PIL Image.

    Args:
        array: Numpy array of shape (H, W, 3) with uint8 values.

    Returns:
        PIL Image in RGB mode.

    Raises:
        ImageProcessingError: If the array shape or dtype is invalid.
    """
    if array.ndim != 3 or array.shape[2] != 3:
        raise ImageProcessingError(
            f"Expected array shape (H, W, 3), got {array.shape}"
        )
    return Image.fromarray(array.astype(np.uint8), "RGB")


def image_to_numpy(image: Image.Image) -> np.ndarray:
    """Convert a PIL Image to a numpy array.

    Args:
        image: PIL Image to convert.

    Returns:
        Numpy array of shape (H, W, 3) with uint8 values.
    """
    return np.array(image.convert("RGB"), dtype=np.uint8)
