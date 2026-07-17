"""
CNN Feature Extractor using MobileNetV2.

Algorithm:
1. Load MobileNetV2 (pre-trained ImageNet, without classification head)
2. Input: image (H, W, 3) uint8 → resize 224x224 → normalize [-1, 1]
3. Forward pass → output block_13_expand_relu (7x7x960)
4. Select 16 channels via linspace(0, 959, 16)
5. Average across channels → 7x7
6. Upscale to 224x224 via bilinear interpolation
7. Min-Max normalize to [0, 1]
8. Output: coefficient_map (224, 224)
"""

import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from app.core.config import settings
from app.core.exceptions import ImageProcessingError, ModelNotLoadedError


class CNNExtractor:
    """Extract CNN feature maps from images using MobileNetV2."""

    def __init__(self) -> None:
        """Load MobileNetV2 model once at initialization."""
        self._model = None
        self._feature_layer = None
        self._load_model()

    def _load_model(self) -> None:
        """Load MobileNetV2 pretrained on ImageNet and get intermediate layer output."""
        try:
            base_model = MobileNetV2(
                weights="imagenet",
                include_top=False,
                input_shape=settings.MODEL_INPUT_SHAPE,
            )
            self._feature_layer = base_model.get_layer(settings.CNN_LAYER_NAME)
            self._model = tf.keras.Model(
                inputs=base_model.input,
                outputs=self._feature_layer.output,
            )
            self._model.trainable = False
        except Exception as e:
            raise ModelNotLoadedError(f"Failed to load MobileNetV2: {e}")

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Resize and normalize image for MobileNetV2 input.

        Args:
            image: Input image as (H, W, 3) uint8.

        Returns:
            Preprocessed image as (1, 224, 224, 3) float32 normalized to [-1, 1].
        """
        img = tf.image.resize(image, settings.MODEL_INPUT_SHAPE[:2])
        img = tf.expand_dims(img, axis=0)
        img = preprocess_input(img.numpy())
        return img

    def extract_features(self, image: np.ndarray) -> np.ndarray:
        """Extract coefficient map from image.

        Args:
            image: Input image as (H, W, 3) uint8.

        Returns:
            Coefficient map (224, 224) float32 in [0, 1].

        Raises:
            ImageProcessingError: If image is invalid.
            ModelNotLoadedError: If CNN model is not loaded.
        """
        if self._model is None:
            raise ModelNotLoadedError()

        if image is None or image.size == 0:
            raise ImageProcessingError("Input image is empty")

        try:
            processed = self._preprocess_image(image)
            feature_maps = self._model.predict(processed, verbose=0)
            raw_features = feature_maps[0]

            channel_indices = np.linspace(
                0, raw_features.shape[-1] - 1, settings.NUM_CHANNELS, dtype=int
            )
            selected = raw_features[:, :, channel_indices]
            averaged = np.mean(selected, axis=-1)

            averaged_tensor = tf.expand_dims(tf.expand_dims(averaged, axis=0), axis=-1)
            upscaled = tf.image.resize(
                averaged_tensor,
                settings.MODEL_INPUT_SHAPE[:2],
                method="bilinear",
            ).numpy()[0, :, :, 0]

            min_val = np.min(upscaled)
            max_val = np.max(upscaled)
            if max_val - min_val > 0:
                normalized = (upscaled - min_val) / (max_val - min_val)
            else:
                normalized = np.zeros_like(upscaled)

            return normalized.astype(np.float32)

        except (ImageProcessingError, ModelNotLoadedError):
            raise
        except Exception as e:
            raise ImageProcessingError(f"Feature extraction failed: {e}")

    def get_feature_maps_16ch(self, image: np.ndarray) -> np.ndarray:
        """Get 16-channel feature maps for visualization.

        Args:
            image: Input image as (H, W, 3) uint8.

        Returns:
            Feature maps (7, 7, 16) float32.
        """
        if self._model is None:
            raise ModelNotLoadedError()

        if image is None or image.size == 0:
            raise ImageProcessingError("Input image is empty")

        try:
            processed = self._preprocess_image(image)
            feature_maps = self._model.predict(processed, verbose=0)
            raw_features = feature_maps[0]

            channel_indices = np.linspace(
                0, raw_features.shape[-1] - 1, settings.NUM_CHANNELS, dtype=int
            )
            return raw_features[:, :, channel_indices].astype(np.float32)

        except Exception as e:
            raise ImageProcessingError(f"Feature map extraction failed: {e}")

    def get_raw_features(self, image: np.ndarray) -> np.ndarray:
        """Get raw CNN output without channel selection.

        Args:
            image: Input image as (H, W, 3) uint8.

        Returns:
            Raw features (7, 7, 960) float32.
        """
        if self._model is None:
            raise ModelNotLoadedError()

        if image is None or image.size == 0:
            raise ImageProcessingError("Input image is empty")

        try:
            processed = self._preprocess_image(image)
            feature_maps = self._model.predict(processed, verbose=0)
            return feature_maps[0].astype(np.float32)

        except Exception as e:
            raise ImageProcessingError(f"Raw feature extraction failed: {e}")
