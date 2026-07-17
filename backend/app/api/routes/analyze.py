"""POST /api/v1/analyze — analyze stego image with theoretical explanations."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.exceptions import StegonetError
from app.services.analyze_service import analyze_image

router = APIRouter()


class AnalyzeRequest(BaseModel):
    """Request payload for analyzing a stego image."""

    stego_image: str = Field(..., description="Base64-encoded stego image")
    metadata: dict = Field(
        ...,
        description="Extraction metadata containing threshold_percent",
    )


class AnalyzeResponse(BaseModel):
    """Response for a successful analysis operation."""

    success: bool = True
    data: dict


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_stego(request: AnalyzeRequest):
    """Analyze a stego image and provide theoretical explanations.

    Returns coefficient distribution stats, pixel analysis,
    theoretical explanations, and threshold sweep data.
    """
    try:
        result = analyze_image(
            stego_image_b64=request.stego_image,
            metadata=request.metadata,
        )

        return AnalyzeResponse(success=True, data=result)

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
