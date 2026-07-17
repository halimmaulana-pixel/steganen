"""POST /api/v1/embed — embed a secret message into a cover image."""

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from app.core.config import settings
from app.core.exceptions import StegonetError
from app.models.schemas import EmbedRequest, EmbedResponse, EmbedData
from app.services.embed_service import process_embed

router = APIRouter()


@router.post("/embed", response_model=EmbedResponse)
async def embed_message(request: EmbedRequest):
    """Embed a secret message into a cover image using CNN-guided LSB.

    Accepts a base64-encoded cover image, a secret message, and an optional
    threshold percentage. Returns the stego image, extraction metadata, and
    quality metrics.
    """
    try:
        result = process_embed(
            cover_image_b64=request.cover_image,
            message=request.secret_message,
            threshold_percent=request.threshold_percent,
        )

        return EmbedResponse(
            success=True,
            data=EmbedData(
                stego_image=result["stego_image"],
                metadata=result["metadata"],
                metrics=result["metrics"],
            ),
        )

    except StegonetError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"success": False, "error": {"code": e.code, "message": e.message}},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {"code": "INTERNAL_ERROR", "message": str(e)},
            },
        )
