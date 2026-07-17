from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Model
    CNN_MODEL_PATH: str = "models/cnn_extractor.h5"
    MODEL_INPUT_SHAPE: tuple = (224, 224, 3)
    CNN_LAYER_NAME: str = "block_13_expand_relu"
    NUM_CHANNELS: int = 16  # Channel selection from 960

    # Limits
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_SECRET_SIZE_KB: int = 64
    REQUEST_TIMEOUT_SECONDS: int = 30

    # Threshold
    MIN_THRESHOLD: int = 5
    MAX_THRESHOLD: int = 95
    DEFAULT_THRESHOLD: int = 30

    # Storage
    DATABASE_URL: str = "sqlite:///data/stegonet.db"
    TEMP_DIR: str = "./tmp"

    # Server
    WORKERS: int = 4
    LOG_LEVEL: str = "info"
    DEBUG: bool = False

    class Config:
        env_file = ".env"


settings = Settings()

# Ensure required directories exist
import os
for d in [os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", "")), settings.TEMP_DIR]:
    if d:
        os.makedirs(d, exist_ok=True)
