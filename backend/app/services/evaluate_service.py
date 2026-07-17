"""Business logic for comparing LSB standard vs LSB-CNN evaluation."""

import base64
from io import BytesIO
from typing import Any

import numpy as np
from PIL import Image

from app.core.exceptions import ImageProcessingError
from app.core.model import extract_features
from app.modules.threshold import Threshold
from app.modules.lsb_embedder import LSBEmbedder
from app.modules.metrics import Metrics
from app.services.embed_service import _decode_base64_image
from app.core.database import save_process, save_evaluation


def _encode_image_to_base64(image: np.ndarray) -> str:
    """Encode a numpy RGB array to a base64 PNG data URL."""
    img = Image.fromarray(image)
    buf = BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def _lsb_standard_embed(
    cover: np.ndarray, message: str, threshold_percent: int
) -> tuple[np.ndarray, dict[str, Any]]:
    """Standard LSB embedding with uniform random pixel selection."""
    h, w = cover.shape[:2]
    total_pixels = h * w
    message_bits = len(message) * 8
    ratio = threshold_percent / 100.0
    selected_pixels = int(total_pixels * ratio)

    if message_bits > selected_pixels:
        raise ValueError(
            f"Message requires {message_bits} bits, capacity {selected_pixels} bits"
        )

    flat = cover.flatten().copy()
    indices = np.random.choice(total_pixels, size=selected_pixels, replace=False)
    indices = np.sort(indices)

    msg_bits = []
    for char in message:
        byte = format(ord(char), "08b")
        msg_bits.extend([int(b) for b in byte])

    for i, bit in enumerate(msg_bits):
        if i >= selected_pixels:
            break
        pixel_idx = indices[i]
        flat[pixel_idx] = (flat[pixel_idx] & 0xFE) | bit

    stego = flat.reshape(cover.shape)

    metadata = {
        "method": "lsb_standard",
        "selected_pixels": int(selected_pixels),
        "total_pixels": int(total_pixels),
        "threshold_percent": threshold_percent,
        "message_length_bits": message_bits,
    }
    return stego, metadata


def process_evaluate(
    cover_image_b64: str,
    message: str,
    threshold_percent: int,
) -> dict[str, Any]:
    """Evaluate and compare LSB standard vs LSB-CNN embedding quality.

    Args:
        cover_image_b64: Base64-encoded cover image.
        message: Secret message for evaluation.
        threshold_percent: Threshold percentage for pixel selection.

    Returns:
        Dict with lsb_standar, lsb_cnn, and comparison data.
    """
    cover = _decode_base64_image(cover_image_b64)

    # Resize to standard CNN input size
    pil_img = Image.fromarray(cover)
    pil_img = pil_img.resize((224, 224), Image.BILINEAR)
    cover = np.array(pil_img, dtype=np.uint8)

    stego_standard, meta_standard = _lsb_standard_embed(cover, message, threshold_percent)
    metrics_standard = Metrics(original=cover, stego=stego_standard).get_detailed_metrics()

    coefficient_map = extract_features(cover)
    threshold = Threshold(coefficient_map=coefficient_map)
    binary_map = threshold.generate_binary_map(threshold_percent)
    threshold_info = threshold.calculate_threshold(threshold_percent)

    embedder = LSBEmbedder(
        cover_image=cover,
        binary_map=binary_map,
        coefficient_map=coefficient_map,
    )
    stego_cnn = embedder.embed(message)
    metrics_cnn = Metrics(original=cover, stego=stego_cnn).get_detailed_metrics()

    psnr_diff = metrics_cnn.get("psnr_db", 0) - metrics_standard.get("psnr_db", 0)
    ssim_diff = metrics_cnn.get("ssim", 0) - metrics_standard.get("ssim", 0)
    mse_diff = metrics_standard.get("mse", 0) - metrics_cnn.get("mse", 0)

    comparison = {
        "psnr_diff_db": round(psnr_diff, 4),
        "ssim_diff": round(ssim_diff, 6),
        "mse_diff": round(mse_diff, 6),
        "better_method": "lsb_cnn" if psnr_diff > 0 else "lsb_standard",
    }

    history_data = {
        "process_type": "evaluate",
        "image_name": "evaluate_cover",
        "message_length_chars": len(message),
        "message_length_bits": len(message) * 8,
        "threshold_percent": threshold_percent,
        "selected_pixels": threshold_info.get("selected_pixels", 0),
        "total_pixels": cover.shape[0] * cover.shape[1],
        "capacity_bits": threshold_info.get("bit_capacity", 0),
        "usage_percent": round(
            (len(message) * 8 / threshold_info.get("bit_capacity", 1)) * 100, 2
        ),
        "psnr_db": metrics_cnn.get("psnr_db"),
        "ssim": metrics_cnn.get("ssim"),
        "mse": metrics_cnn.get("mse"),
    }
    process_id = save_process(history_data)

    save_evaluation(
        {
            "process_id": process_id,
            "method": "lsb_standard",
            "psnr_db": metrics_standard["psnr_db"],
            "ssim": metrics_standard["ssim"],
            "mse": metrics_standard["mse"],
        }
    )
    save_evaluation(
        {
            "process_id": process_id,
            "method": "lsb_cnn",
            "psnr_db": metrics_cnn["psnr_db"],
            "ssim": metrics_cnn["ssim"],
            "mse": metrics_cnn["mse"],
        }
    )

    return {
        "lsb_standar": {
            "metrics": metrics_standard,
            "stego_image": _encode_image_to_base64(stego_standard),
        },
        "lsb_cnn": {
            "metrics": metrics_cnn,
            "stego_image": _encode_image_to_base64(stego_cnn),
        },
        "comparison": comparison,
        "original_image": _encode_image_to_base64(cover),
    }
