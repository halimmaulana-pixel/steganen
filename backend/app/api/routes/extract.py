"""POST /api/v1/extract — extract a secret message from a stego image."""

from fastapi import APIRouter, HTTPException

from app.core.exceptions import StegonetError
from app.models.schemas import ExtractRequest, ExtractResponse, ExtractData
from app.services.extract_service import process_extract

router = APIRouter()


@router.post("/extract", response_model=ExtractResponse)
async def extract_message(request: ExtractRequest):
    """Extract a secret message from a stego image.

    Accepts a base64-encoded stego image and extraction metadata (threshold_percent,
    message_length_bits). Returns the extracted message.
    """
    try:
        result = process_extract(
            stego_image_b64=request.stego_image,
            metadata=request.metadata,
        )

        return ExtractResponse(
            success=True,
            data=ExtractData(
                message=result["message"],
                message_length_chars=result["message_length_chars"],
                extraction_method=result["extraction_method"],
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
