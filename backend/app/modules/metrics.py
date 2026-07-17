"""
Quality Metrics: PSNR, SSIM, MSE, per-channel PSNR, pixel change stats.
"""

from __future__ import annotations

import numpy as np
from skimage.metrics import structural_similarity as ssim

from app.core.exceptions import ValidationError


class Metrics:
    """Compute quality metrics between an original and a stego image."""

    def __init__(self, original: np.ndarray, stego: np.ndarray) -> None:
        if original.shape != stego.shape:
            raise ValidationError(
                f"Shape mismatch: original {original.shape} vs stego {stego.shape}"
            )
        if original.ndim < 2:
            raise ValidationError(
                f"Images must be at least 2-D, got {original.ndim}-D"
            )

        self._original = original.astype(np.float64)
        self._stego = stego.astype(np.float64)

    def calculate_mse(self) -> float:
        return float(np.mean((self._original - self._stego) ** 2))

    def calculate_psnr(self) -> float:
        mse = self.calculate_mse()
        if mse == 0.0:
            return None  # Perfect match — no noise
        return float(10.0 * np.log10((255.0**2) / mse))

    def calculate_ssim(self) -> float:
        if self._original.ndim == 2:
            return float(ssim(self._original, self._stego, data_range=255))
        return float(
            ssim(
                self._original.astype(np.uint8),
                self._stego.astype(np.uint8),
                channel_axis=-1,
                data_range=255,
            )
        )

    def calculate_psnr_per_channel(self) -> dict[str, float]:
        """PSNR for each RGB channel separately."""
        channels = {"r": 0, "g": 1, "b": 2}
        result = {}
        for name, idx in channels.items():
            if self._original.ndim == 3 and idx < self._original.shape[2]:
                orig_ch = self._original[:, :, idx]
                stego_ch = self._stego[:, :, idx]
                mse_ch = float(np.mean((orig_ch - stego_ch) ** 2))
                if mse_ch == 0.0:
                    result[f"psnr_{name}_db"] = None  # Perfect match
                else:
                    result[f"psnr_{name}_db"] = float(10.0 * np.log10((255.0**2) / mse_ch))
            else:
                result[f"psnr_{name}_db"] = 0.0
        return result

    def calculate_pixel_change_stats(self) -> dict[str, Any]:
        """Statistics about pixel changes between original and stego."""
        diff = np.abs(self._original - self._stego)
        changed_mask = np.any(diff > 0, axis=-1) if self._original.ndim == 3 else diff > 0

        total_pixels = changed_mask.size
        changed_pixels = int(np.sum(changed_mask))
        change_ratio = changed_pixels / total_pixels if total_pixels > 0 else 0.0

        max_diff = float(np.max(diff))
        mean_diff = float(np.mean(diff))

        # Histogram of absolute differences
        diff_gray = np.mean(diff, axis=-1) if self._original.ndim == 3 else diff
        hist_bins = [0, 1, 2, 5, 10, 20, 50, 128, 255]
        hist_counts = []
        for i in range(len(hist_bins) - 1):
            count = int(np.sum((diff_gray >= hist_bins[i]) & (diff_gray < hist_bins[i + 1])))
            hist_counts.append(count)
        # Last bin includes 255
        hist_counts[-1] += int(np.sum(diff_gray >= hist_bins[-1]))

        return {
            "changed_pixels": changed_pixels,
            "total_pixels": total_pixels,
            "change_ratio": round(change_ratio, 6),
            "max_pixel_difference": round(max_diff, 2),
            "mean_pixel_difference": round(mean_diff, 4),
            "difference_histogram": {
                "bins": [f"{hist_bins[i]}-{hist_bins[i+1]-1}" for i in range(len(hist_bins) - 1)],
                "counts": hist_counts,
            },
        }

    def calculate_histogram_distance(self) -> float:
        """Chi-squared distance between original and stego histograms (lower = better)."""
        if self._original.ndim == 3:
            # Average across channels
            total_dist = 0.0
            for ch in range(3):
                orig_hist, _ = np.histogram(self._original[:, :, ch], bins=256, range=(0, 256))
                stego_hist, _ = np.histogram(self._stego[:, :, ch], bins=256, range=(0, 256))
                orig_hist = orig_hist.astype(np.float64) + 1e-10
                stego_hist = stego_hist.astype(np.float64) + 1e-10
                total_dist += float(np.sum((orig_hist - stego_hist) ** 2 / orig_hist))
            return round(total_dist / 3.0, 2)
        else:
            orig_hist, _ = np.histogram(self._original, bins=256, range=(0, 256))
            stego_hist, _ = np.histogram(self._stego, bins=256, range=(0, 256))
            orig_hist = orig_hist.astype(np.float64) + 1e-10
            stego_hist = stego_hist.astype(np.float64) + 1e-10
            return round(float(np.sum((orig_hist - stego_hist) ** 2 / orig_hist)), 2)

    def get_all_metrics(self) -> dict[str, float]:
        return {
            "mse": self.calculate_mse(),
            "psnr_db": self.calculate_psnr(),
            "ssim": self.calculate_ssim(),
        }

    def get_detailed_metrics(self) -> dict[str, Any]:
        """Return all metrics including per-channel and pixel change stats."""
        base = self.get_all_metrics()
        per_channel = self.calculate_psnr_per_channel()
        pixel_stats = self.calculate_pixel_change_stats()
        hist_distance = self.calculate_histogram_distance()

        return {
            **base,
            **per_channel,
            **pixel_stats,
            "histogram_distance": hist_distance,
        }

    def get_pixel_difference_map(self) -> np.ndarray:
        diff = np.abs(self._original - self._stego)
        amplified = np.clip(diff * 20, 0, 255).astype(np.uint8)
        return amplified
