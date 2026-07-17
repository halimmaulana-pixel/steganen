"""
Comparative Evaluation: LSB Standar vs LSB+CNN.

Algorithm:
1. Take cover image + message
2. Run LSB Standar (sequential embedding without CNN selection)
3. Run LSB+CNN (with CNN-based selection)
4. Calculate metrics for both
5. Compare results
"""

from __future__ import annotations

import numpy as np

from app.core.config import settings
from app.core.exceptions import CapacityExceededError, ValidationError
from app.modules.metrics import Metrics


class Evaluation:
    """Compare standard sequential LSB against CNN-guided adaptive LSB."""

    def __init__(
        self,
        cover_image: np.ndarray,
        message: str,
        threshold_percent: int = settings.DEFAULT_THRESHOLD,
    ) -> None:
        if cover_image.ndim != 3 or cover_image.shape[2] != 3:
            raise ValidationError(
                f"cover_image must be (H, W, 3), got shape {cover_image.shape}"
            )
        if not (settings.MIN_THRESHOLD <= threshold_percent <= settings.MAX_THRESHOLD):
            raise ValidationError(
                f"threshold_percent must be in "
                f"[{settings.MIN_THRESHOLD}, {settings.MAX_THRESHOLD}], "
                f"got {threshold_percent}"
            )
        if not message:
            raise ValidationError("message must not be empty")

        self._cover = cover_image.astype(np.uint8).copy()
        self._message = message
        self._threshold_percent = threshold_percent

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run_lsb_standar(self) -> dict:
        """Embed sequentially from pixel (0,0) without CNN selection.

        Returns:
            dict: ``{stego_image, metrics}`` where metrics contains
            ``mse``, ``psnr_db``, and ``ssim``.
        """
        bits = self._message_to_bits(self._message)
        total_bits = len(bits)
        h, w = self._cover.shape[:2]
        total_pixels = h * w * 3  # 3 channels per pixel

        if total_bits > total_pixels:
            raise CapacityExceededError(
                f"Message needs {total_bits} bits, standard LSB "
                f"has only {total_pixels}"
            )

        stego = self._cover.copy()
        bit_index = 0

        for row in range(h):
            if bit_index >= total_bits:
                break
            for col in range(w):
                if bit_index >= total_bits:
                    break
                for channel in range(3):
                    if bit_index >= total_bits:
                        break
                    bit = int(bits[bit_index])
                    pixel_val = int(stego[row, col, channel])
                    stego[row, col, channel] = (pixel_val & 0xFE) | bit
                    bit_index += 1

        metrics = Metrics(self._cover, stego)
        return {
            "stego_image": stego,
            "metrics": metrics.get_all_metrics(),
        }

    def run_lsb_cnn(self) -> dict:
        """Embed using CNN-based coefficient selection + adaptive LSB.

        Returns:
            dict: ``{stego_image, metrics, binary_map}`` where binary_map
            marks which pixels were selected for embedding.
        """
        coefficient_map = self._compute_texture_complexity()
        binary_map = self._threshold_coefficients(
            coefficient_map, self._threshold_percent
        )

        from app.modules.lsb_embedder import LSBEmbedder

        embedder = LSBEmbedder(self._cover, binary_map, coefficient_map)
        stego = embedder.embed(self._message)

        metrics = Metrics(self._cover, stego)
        return {
            "stego_image": stego,
            "metrics": metrics.get_all_metrics(),
            "binary_map": binary_map,
        }

    def compare(self) -> dict:
        """Run both methods and return a side-by-side comparison.

        Returns:
            dict with keys ``lsb_standar``, ``lsb_cnn``, and
            ``comparison`` (psnr_diff, ssim_diff, winner).
        """
        std_result = self.run_lsb_standar()
        cnn_result = self.run_lsb_cnn()

        std_metrics = std_result["metrics"]
        cnn_metrics = cnn_result["metrics"]

        psnr_diff = cnn_metrics["psnr_db"] - std_metrics["psnr_db"]
        ssim_diff = cnn_metrics["ssim"] - std_metrics["ssim"]

        # Higher PSNR + higher SSIM = better
        if psnr_diff > 0 and ssim_diff >= 0:
            winner = "lsb_cnn"
        elif psnr_diff < 0 and ssim_diff <= 0:
            winner = "lsb_standar"
        elif psnr_diff >= 0:
            winner = "lsb_cnn"
        else:
            winner = "lsb_standar"

        return {
            "lsb_standar": {
                "stego_image": std_result["stego_image"],
                "metrics": std_metrics,
            },
            "lsb_cnn": {
                "stego_image": cnn_result["stego_image"],
                "metrics": cnn_metrics,
                "binary_map": cnn_result["binary_map"],
            },
            "comparison": {
                "psnr_diff": psnr_diff,
                "ssim_diff": ssim_diff,
                "winner": winner,
            },
        }

    # ------------------------------------------------------------------
    # Private helpers — texture complexity as CNN proxy
    # ------------------------------------------------------------------

    def _compute_texture_complexity(self) -> np.ndarray:
        """Compute per-pixel texture complexity using gradient magnitude.

        Uses a simple Sobel-like approach: the sum of absolute gradients
        across channels, normalised to [0, 1].  This acts as a lightweight
        proxy for the CNN feature-map coefficients in the full pipeline.
        """
        gray = np.mean(self._cover.astype(np.float64), axis=-1)

        # Horizontal and vertical gradients via simple finite differences
        grad_x = np.zeros_like(gray)
        grad_y = np.zeros_like(gray)
        grad_x[:, 1:] = np.abs(np.diff(gray, axis=1))
        grad_y[1:, :] = np.abs(np.diff(gray, axis=0))

        magnitude = np.sqrt(grad_x**2 + grad_y**2)

        max_val = magnitude.max()
        if max_val > 0:
            magnitude = magnitude / max_val
        return magnitude

    @staticmethod
    def _threshold_coefficients(
        coefficient_map: np.ndarray, threshold_percent: int
    ) -> np.ndarray:
        """Create a binary map where pixels above the *threshold_percent*
        percentile are marked as 1."""
        cutoff = np.percentile(coefficient_map, 100 - threshold_percent)
        return (coefficient_map >= cutoff).astype(np.uint8)

    @staticmethod
    def _message_to_bits(message: str) -> str:
        """Convert *message* to a bit string using 8-bit ASCII encoding."""
        encoded = message.encode("ascii")
        return "".join(format(byte, "08b") for byte in encoded)
