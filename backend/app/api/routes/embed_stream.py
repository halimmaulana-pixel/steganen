"""POST /api/v1/embed/stream — SSE streaming embed endpoint."""

import asyncio
import base64
import io
import json
import time
from typing import Any

import numpy as np
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.services.embed_service import (
    _decode_base64_image,
    _encode_image_to_base64,
)
from app.core.model import extract_features
from app.modules.threshold import Threshold
from app.modules.lsb_embedder import LSBEmbedder
from app.modules.metrics import Metrics
from app.services.history_service import save_process
from app.models.schemas import EmbedRequest

router = APIRouter()

# Delays: sub_step = fast, step transition = visible pause
SUB_DELAY = 0.12
STEP_DELAY = 0.35


def _sse_event(event: str, data: Any) -> str:
    payload = json.dumps(data, default=str)
    return f"event: {event}\ndata: {payload}\n\n"


def _thumbnail_b64(arr: np.ndarray, max_dim: int = 64) -> str:
    from PIL import Image
    img = Image.fromarray(arr)
    h, w = arr.shape[:2]
    scale = max_dim / max(h, w)
    if scale < 1:
        img = img.resize((int(w * scale), int(h * scale)), Image.BILINEAR)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


def _heatmap_b64(grid: np.ndarray, max_dim: int = 64) -> str:
    from PIL import Image
    flat = grid.flatten()
    mn, mx = flat.min(), flat.max()
    rng = mx - mn or 1
    normalized = ((flat - mn) / rng * 255).astype(np.uint8).reshape(grid.shape)
    img = Image.fromarray(normalized, mode="L")
    h, w = grid.shape
    scale = max_dim / max(h, w)
    if scale < 1:
        img = img.resize((int(w * scale), int(h * scale)), Image.BILINEAR)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


def _binary_map_b64(binary: np.ndarray, max_dim: int = 64) -> str:
    from PIL import Image
    rgb = np.zeros((*binary.shape, 3), dtype=np.uint8)
    rgb[binary > 0] = [6, 214, 160]
    rgb[binary == 0] = [30, 30, 30]
    img = Image.fromarray(rgb)
    h, w = binary.shape
    scale = max_dim / max(h, w)
    if scale < 1:
        img = img.resize((int(w * scale), int(h * scale)), Image.BILINEAR)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


async def _generate_embed_stream(
    cover_image_b64: str,
    message: str,
    threshold_percent: int,
):
    t_start = time.time()

    def elapsed():
        return round(time.time() - t_start, 2)

    # ── Step 0: Input ──────────────────────────────────────────────────
    yield _sse_event("step_start", {
        "step": 0, "label": "Input Preview",
        "sub_steps": ["Validating base64 image format", "Decoding image to RGB array", "Resizing to 224×224 for CNN input"],
        "elapsed": elapsed(),
    })
    await asyncio.sleep(SUB_DELAY)

    try:
        cover_image = await asyncio.to_thread(_decode_base64_image, cover_image_b64)
        yield _sse_event("sub_step_done", {"step": 0, "sub": 0, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        from PIL import Image
        pil_img = Image.fromarray(cover_image)
        pil_img = pil_img.resize((224, 224), Image.BILINEAR)
        cover_image = np.array(pil_img, dtype=np.uint8)
        yield _sse_event("sub_step_done", {"step": 0, "sub": 1, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        total_pixels = cover_image.shape[0] * cover_image.shape[1]
        yield _sse_event("sub_step_done", {"step": 0, "sub": 2, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        thumb = _thumbnail_b64(cover_image, max_dim=80)
        yield _sse_event("step_done", {"step": 0, "elapsed": elapsed(), "viz": {"image_thumb": thumb}})
        await asyncio.sleep(STEP_DELAY)
    except Exception as e:
        yield _sse_event("error", {"message": f"Image decode failed: {e}"})
        return

    # ── Step 1: CNN Feature Extraction ─────────────────────────────────
    yield _sse_event("step_start", {
        "step": 1, "label": "CNN Feature Extraction",
        "sub_steps": ["Applying Sobel edge detection", "Computing block variance", "Generating coefficient feature maps"],
        "elapsed": elapsed(),
    })
    await asyncio.sleep(SUB_DELAY)

    try:
        coefficient_map = await asyncio.to_thread(extract_features, cover_image)
        yield _sse_event("sub_step_done", {"step": 1, "sub": 0, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)
        yield _sse_event("sub_step_done", {"step": 1, "sub": 1, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)
        yield _sse_event("sub_step_done", {"step": 1, "sub": 2, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        coeff_thumb = _heatmap_b64(coefficient_map, max_dim=80)
        yield _sse_event("step_done", {"step": 1, "elapsed": elapsed(), "viz": {"coeff_thumb": coeff_thumb}})
        await asyncio.sleep(STEP_DELAY)
    except Exception as e:
        yield _sse_event("error", {"message": f"Feature extraction failed: {e}"})
        return

    # ── Step 2: Threshold Analysis ─────────────────────────────────────
    yield _sse_event("step_start", {
        "step": 2, "label": "Threshold Analysis",
        "sub_steps": [
            f"Sorting {total_pixels} coefficient values",
            f"Computing threshold θ at {threshold_percent}%",
            "Generating binary embedding map",
            "Counting selected pixel regions",
        ],
        "elapsed": elapsed(),
    })
    await asyncio.sleep(SUB_DELAY)

    try:
        threshold = Threshold(coefficient_map=coefficient_map)
        yield _sse_event("sub_step_done", {"step": 2, "sub": 0, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        threshold_info = threshold.calculate_threshold(threshold_percent)
        yield _sse_event("sub_step_done", {"step": 2, "sub": 1, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        binary_map = threshold.generate_binary_map(threshold_percent)
        yield _sse_event("sub_step_done", {"step": 2, "sub": 2, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        selected_pixels = threshold_info["selected_pixels"]
        yield _sse_event("sub_step_done", {"step": 2, "sub": 3, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        coeff_thumb = _heatmap_b64(coefficient_map, max_dim=80)
        binary_thumb = _binary_map_b64(binary_map, max_dim=80)
        yield _sse_event("step_done", {
            "step": 2, "elapsed": elapsed(),
            "selected_pixels": selected_pixels, "total_pixels": total_pixels,
            "threshold_value": threshold_info["threshold_value"],
            "viz": {"coeff_thumb": coeff_thumb, "binary_thumb": binary_thumb},
        })
        await asyncio.sleep(STEP_DELAY)
    except Exception as e:
        yield _sse_event("error", {"message": f"Threshold analysis failed: {e}"})
        return

    # ── Step 3: LSB Embedding ──────────────────────────────────────────
    message_bits = len(message) * 8
    capacity_bits = threshold_info["bit_capacity"]

    yield _sse_event("step_start", {
        "step": 3, "label": "LSB Embedding",
        "sub_steps": [
            f"Converting message to {message_bits} bits",
            f"Mapping {message_bits} bits to selected pixels",
            "Modifying LSB of selected channels",
            "Reconstructing stego image",
        ],
        "elapsed": elapsed(),
    })
    await asyncio.sleep(SUB_DELAY)

    if message_bits > capacity_bits:
        yield _sse_event("error", {"message": f"Message requires {message_bits} bits but capacity is only {capacity_bits} bits"})
        return

    try:
        yield _sse_event("sub_step_done", {"step": 3, "sub": 0, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        embedder = LSBEmbedder(cover_image=cover_image, binary_map=binary_map, coefficient_map=coefficient_map)
        yield _sse_event("sub_step_done", {"step": 3, "sub": 1, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        stego_image = await asyncio.to_thread(embedder.embed, message)
        yield _sse_event("sub_step_done", {"step": 3, "sub": 2, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        yield _sse_event("sub_step_done", {"step": 3, "sub": 3, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        stego_thumb = _thumbnail_b64(stego_image, max_dim=80)
        binary_thumb = _binary_map_b64(binary_map, max_dim=80)
        yield _sse_event("step_done", {
            "step": 3, "elapsed": elapsed(),
            "viz": {"stego_thumb": stego_thumb, "binary_thumb": binary_thumb},
        })
        await asyncio.sleep(STEP_DELAY)
    except Exception as e:
        yield _sse_event("error", {"message": f"LSB embedding failed: {e}"})
        return

    # ── Step 4: Output & Metrics ───────────────────────────────────────
    yield _sse_event("step_start", {
        "step": 4, "label": "Output & Metrics",
        "sub_steps": ["Computing PSNR / SSIM / MSE", "Computing per-channel PSNR", "Computing pixel change stats", "Encoding stego image", "Saving to database"],
        "elapsed": elapsed(),
    })
    await asyncio.sleep(SUB_DELAY)

    try:
        metrics_calc = Metrics(original=cover_image, stego=stego_image)
        metrics = metrics_calc.get_all_metrics()
        yield _sse_event("sub_step_done", {"step": 4, "sub": 0, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        per_channel = metrics_calc.calculate_psnr_per_channel()
        yield _sse_event("sub_step_done", {"step": 4, "sub": 1, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        pixel_stats = metrics_calc.calculate_pixel_change_stats()
        yield _sse_event("sub_step_done", {"step": 4, "sub": 2, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        stego_b64 = _encode_image_to_base64(stego_image)
        yield _sse_event("sub_step_done", {"step": 4, "sub": 3, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        usage_percent = (message_bits / capacity_bits * 100) if capacity_bits > 0 else 0.0
        history_data = {
            "process_type": "embed", "image_name": "cover_image",
            "message_length_chars": len(message), "message_length_bits": message_bits,
            "threshold_percent": threshold_percent, "selected_pixels": selected_pixels,
            "total_pixels": total_pixels, "capacity_bits": capacity_bits,
            "usage_percent": round(usage_percent, 2),
            "psnr_db": metrics.get("psnr_db"), "ssim": metrics.get("ssim"), "mse": metrics.get("mse"),
        }
        process_id = await asyncio.to_thread(save_process, history_data)
        yield _sse_event("sub_step_done", {"step": 4, "sub": 4, "elapsed": elapsed()})
        await asyncio.sleep(SUB_DELAY)

        metadata = {
            "threshold_percent": threshold_percent,
            "threshold_value": threshold_info["threshold_value"],
            "selected_pixels": selected_pixels, "total_pixels": total_pixels,
            "capacity_bits": capacity_bits, "message_length_bits": message_bits,
            "process_id": process_id,
        }

        yield _sse_event("step_done", {"step": 4, "elapsed": elapsed()})
        await asyncio.sleep(STEP_DELAY)

        yield _sse_event("complete", {
            "stego_image": stego_b64, "metadata": metadata,
            "metrics": {**metrics, **per_channel, **pixel_stats},
            "visualization_data": {
                "coefficient_map": coefficient_map.tolist(),
                "binary_map": binary_map.tolist(),
            },
            "total_elapsed": elapsed(),
        })
        await asyncio.sleep(SUB_DELAY)

    except Exception as e:
        yield _sse_event("error", {"message": f"Metrics computation failed: {e}"})
        return


@router.post("/embed/stream")
async def embed_message_stream(request: EmbedRequest):
    """Stream embed progress via Server-Sent Events."""
    return StreamingResponse(
        _generate_embed_stream(
            cover_image_b64=request.cover_image,
            message=request.secret_message,
            threshold_percent=request.threshold_percent,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )
