"""POST /api/v1/evaluate — compare LSB standard vs LSB-CNN."""

from fastapi import APIRouter, HTTPException

from app.core.exceptions import StegonetError
from app.models.schemas import EvaluateRequest, EvaluateResponse, CompareData, EvaluationResult
from app.services.evaluate_service import process_evaluate

router = APIRouter()


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_embedding(request: EvaluateRequest):
    """Compare LSB standard and LSB-CNN embedding quality.

    Accepts a base64-encoded cover image, a secret message, and threshold.
    Returns PSNR, SSIM, MSE for both methods and a comparison summary.
    """
    try:
        result = process_evaluate(
            cover_image_b64=request.cover_image,
            message=request.secret_message,
            threshold_percent=request.threshold_percent,
        )

        lsb_standar = result["lsb_standar"]
        lsb_cnn = result["lsb_cnn"]

        return EvaluateResponse(
            success=True,
            data=CompareData(
                lsb_standar=EvaluationResult(
                    stego_image=lsb_standar.get("stego_image", ""),
                    metrics=lsb_standar["metrics"],
                ),
                lsb_cnn=EvaluationResult(
                    stego_image=lsb_cnn.get("stego_image", ""),
                    metrics=lsb_cnn["metrics"],
                ),
                comparison=result["comparison"],
                original_image=result.get("original_image", ""),
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
