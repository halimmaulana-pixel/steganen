"""CNN model singleton for feature extraction."""

from functools import lru_cache
from typing import Optional

import numpy as np
from PIL import Image

from app.core.config import settings
from app.core.exceptions import ModelNotLoadedError

_tf_available = None


def _check_tf() -> bool:
    """Check if TensorFlow is properly installed."""
    global _tf_available
    if _tf_available is not None:
        return _tf_available
    try:
        import tensorflow as tf
        _tf_available = hasattr(tf, "__version__") and hasattr(tf.keras, "applications")
    except Exception:
        _tf_available = False
    return _tf_available


@lru_cache(maxsize=1)
def get_cnn_model():
    """Load and cache the MobileNetV2 feature extraction model.

    Returns the loaded Keras model, or None if TensorFlow is unavailable
    (fallback mode uses edge detection instead).

    Raises:
        ModelNotLoadedError: If TensorFlow is available but model fails to load.
    """
    if not _check_tf():
        return None

    try:
        import tensorflow as tf
        from tensorflow.keras.applications import MobileNetV2

        base_model = MobileNetV2(
            weights="imagenet",
            include_top=False,
            input_shape=settings.MODEL_INPUT_SHAPE,
        )
        feature_layer = base_model.get_layer(settings.CNN_LAYER_NAME)
        model = tf.keras.Model(
            inputs=base_model.input,
            outputs=feature_layer.output,
        )
        model.trainable = False
        return model
    except Exception as e:
        raise ModelNotLoadedError(f"Failed to load MobileNetV2: {e}")


def _fallback_extract(image_array: np.ndarray) -> np.ndarray:
    """Fallback feature extraction using multi-scale averaging (no CNN required).

    Uses downsampling + upsampling to create a robust coefficient map
    that is resilient to small LSB modifications.

    Args:
        image_array: Input image as numpy array (H, W, 3) with uint8 dtype.

    Returns:
        Coefficient map of shape (224, 224) as float32, values in [0, 1].
    """
    # Convert to grayscale
    if image_array.ndim == 3:
        gray = np.mean(image_array, axis=2).astype(np.float64)
    else:
        gray = image_array.astype(np.float64)

    # Resize to 224x224
    pil_img = Image.fromarray(gray.astype(np.uint8))
    pil_img = pil_img.resize((224, 224), Image.BILINEAR)
    gray = np.array(pil_img, dtype=np.float64)

    # Compute local variance as texture measure (robust to LSB changes)
    # Use block-based variance: divide into 8x8 blocks, compute variance per block
    h, w = gray.shape
    block_size = 8
    coeff_map = np.zeros((h, w), dtype=np.float64)

    for i in range(0, h, block_size):
        for j in range(0, w, block_size):
            block = gray[i:i+block_size, j:j+block_size]
            if block.size > 0:
                variance = np.var(block)
                coeff_map[i:i+block_size, j:j+block_size] = variance

    # Min-max normalize to [0, 1]
    min_val = np.min(coeff_map)
    max_val = np.max(coeff_map)
    if max_val - min_val > 0:
        normalized = (coeff_map - min_val) / (max_val - min_val)
    else:
        normalized = np.zeros_like(coeff_map)

    return normalized.astype(np.float32)


def extract_features(image_array: np.ndarray) -> np.ndarray:
    """Extract a spatial coefficient map from an image.

    Uses MobileNetV2 CNN if TensorFlow is available, otherwise falls back
    to Sobel edge detection for coefficient estimation.

    Pipeline (CNN):
        1. Receive uint8 image (H, W, 3).
        2. Resize to 224x224.
        3. Normalize to [-1, 1].
        4. Forward pass through block_13_expand_relu layer.
        5. Select 16 channels via linspace(0, 959, 16).
        6. Average across channels → 7x7.
        7. Upscale to 224x224 via bilinear interpolation.
        8. Normalize to [0, 1].

    Args:
        image_array: Input image as numpy array (H, W, 3) with uint8 dtype.

    Returns:
        Coefficient map of shape (224, 224) as float32, values in [0, 1].

    Raises:
        ImageProcessingError: If image is invalid.
    """
    from app.core.exceptions import ImageProcessingError

    if image_array is None or image_array.size == 0:
        raise ImageProcessingError("Input image is empty")

    model = get_cnn_model()

    if model is None:
        # Fallback: edge detection
        return _fallback_extract(image_array)

    try:
        import tensorflow as tf

        # Resize to model input shape
        img = tf.image.resize(image_array, settings.MODEL_INPUT_SHAPE[:2])

        # Normalize to [-1, 1]
        img = (tf.cast(img, tf.float32) / 127.5) - 1.0

        # Add batch dimension
        img = tf.expand_dims(img, axis=0)

        # Build intermediate model targeting the specified layer
        intermediate_model = tf.keras.Model(
            inputs=model.input,
            outputs=model.get_layer(settings.CNN_LAYER_NAME).output,
        )

        # Extract features
        features = intermediate_model(img, training=False)

        # Select specific channels via linspace indices
        num_total_channels = features.shape[-1]
        channel_indices = np.linspace(0, num_total_channels - 1, settings.NUM_CHANNELS, dtype=int)
        selected = tf.gather(features, channel_indices, axis=-1)

        # Average across channels
        averaged = tf.reduce_mean(selected, axis=-1)
        averaged = tf.squeeze(averaged, axis=0)

        # Upscale to 224x224
        upscaled = tf.image.resize(
            tf.expand_dims(averaged, axis=-1),
            settings.MODEL_INPUT_SHAPE[:2],
            method="bilinear",
        )
        upscaled = tf.squeeze(upscaled, axis=-1)

        # Min-max normalize to [0, 1]
        min_val = tf.reduce_min(upscaled)
        max_val = tf.reduce_max(upscaled)
        range_val = max_val - min_val
        coefficient_map = tf.where(
            range_val > 0,
            (upscaled - min_val) / range_val,
            tf.zeros_like(upscaled),
        )

        return coefficient_map.numpy().astype(np.float32)

    except Exception as e:
        raise ImageProcessingError(f"Feature extraction failed: {e}")
