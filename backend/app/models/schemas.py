"""Pydantic request/response schemas for the Stegonet API."""

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.config import settings


class EmbedRequest(BaseModel):
    """Request payload for embedding a secret message into a cover image."""

    cover_image: str = Field(..., description="Base64-encoded cover image")
    secret_message: str = Field(..., description="Secret message to embed")
    threshold_percent: int = Field(
        default=settings.DEFAULT_THRESHOLD,
        ge=settings.MIN_THRESHOLD,
        le=settings.MAX_THRESHOLD,
        description="Embedding threshold percentage",
    )


class EmbedData(BaseModel):
    """Data returned after a successful embed operation."""

    stego_image: str = Field(..., description="Base64-encoded stego image")
    metadata: dict[str, Any] = Field(..., description="Extraction metadata")
    metrics: dict[str, Any] = Field(..., description="Quality metrics (PSNR, SSIM, MSE)")


class EmbedResponse(BaseModel):
    """Response for a successful embed operation."""

    success: bool = True
    data: EmbedData


class ExtractRequest(BaseModel):
    """Request payload for extracting a secret message from a stego image."""

    stego_image: str = Field(..., description="Base64-encoded stego image")
    metadata: dict[str, Any] = Field(
        ...,
        description="Extraction metadata containing message_length_bits and threshold_percent",
    )


class ExtractData(BaseModel):
    """Data returned after a successful extract operation."""

    message: str = Field(..., description="Extracted secret message")
    message_length_chars: int = Field(..., description="Length of extracted message in characters")
    extraction_method: str = Field(..., description="Method used for extraction")


class ExtractResponse(BaseModel):
    """Response for a successful extract operation."""

    success: bool = True
    data: ExtractData


class EvaluateRequest(BaseModel):
    """Request payload for LSB evaluation comparison."""

    cover_image: str = Field(..., description="Base64-encoded cover image")
    secret_message: str = Field(..., description="Secret message for evaluation")
    threshold_percent: int = Field(
        default=settings.DEFAULT_THRESHOLD,
        ge=settings.MIN_THRESHOLD,
        le=settings.MAX_THRESHOLD,
        description="Embedding threshold percentage",
    )


class EvaluationResult(BaseModel):
    """Single method evaluation result."""

    stego_image: str = ""
    metrics: dict[str, Any] = {}


class CompareData(BaseModel):
    """Comparison data between LSB standard and LSB-CNN."""

    lsb_standar: EvaluationResult
    lsb_cnn: EvaluationResult
    comparison: dict[str, Any]
    original_image: Optional[str] = None


class EvaluateResponse(BaseModel):
    """Response for a successful evaluation operation."""

    success: bool = True
    data: CompareData


class HistoryItem(BaseModel):
    """A single process history record."""

    model_config = ConfigDict(extra="ignore")

    id: int
    process_type: str
    image_name: str
    message_length_chars: int
    message_length_bits: int
    threshold_percent: int
    selected_pixels: int
    total_pixels: int
    capacity_bits: int
    usage_percent: float
    psnr_db: Optional[float] = None
    ssim: Optional[float] = None
    mse: Optional[float] = None
    created_at: str


class HistoryResponse(BaseModel):
    """Response containing process history records."""

    success: bool = True
    data: list[HistoryItem]
    total: int = 0


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    checks: dict[str, str]
