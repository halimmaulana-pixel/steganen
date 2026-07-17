"""Custom exception hierarchy for Stegonet."""


class StegonetError(Exception):
    """Base exception for all Stegonet errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        code: str = "UNKNOWN_ERROR",
        status_code: int = 500,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class ImageProcessingError(StegonetError):
    """Raised when image processing fails."""

    def __init__(self, message: str = "Image processing failed"):
        super().__init__(message=message, code="IMAGE_PROCESSING_ERROR", status_code=422)


class ModelNotLoadedError(StegonetError):
    """Raised when the CNN model is not loaded or unavailable."""

    def __init__(self, message: str = "CNN model is not loaded"):
        super().__init__(message=message, code="MODEL_NOT_LOADED", status_code=503)


class CapacityExceededError(StegonetError):
    """Raised when the secret message exceeds embedding capacity."""

    def __init__(self, message: str = "Secret message exceeds embedding capacity"):
        super().__init__(message=message, code="CAPACITY_EXCEEDED", status_code=400)


class InvalidMetadataError(StegonetError):
    """Raised when extraction metadata is invalid or missing."""

    def __init__(self, message: str = "Invalid or missing metadata"):
        super().__init__(message=message, code="INVALID_METADATA", status_code=400)


class ImageNotFoundError(StegonetError):
    """Raised when the requested image file is not found."""

    def __init__(self, message: str = "Image file not found"):
        super().__init__(message=message, code="IMAGE_NOT_FOUND", status_code=404)


class ValidationError(StegonetError):
    """Raised when input validation fails."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message=message, code="VALIDATION_ERROR", status_code=422)
