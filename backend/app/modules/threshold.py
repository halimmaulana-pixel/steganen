"""
Thresholding & Binary Map Generation.

Algorithm:
1. Input: coefficient_map (224, 224), threshold_percent (int)
2. Flatten and sort coefficients descending
3. Calculate threshold value at Top-X%
4. Generate binary map: 1 if coefficient >= threshold, 0 otherwise
5. Calculate capacity: selected_pixels × 3 × 1 bit
"""

import numpy as np

from app.core.config import settings
from app.core.exceptions import ValidationError


class Threshold:
    """Generate binary maps from coefficient maps using percentile-based thresholding."""

    def __init__(self, coefficient_map: np.ndarray) -> None:
        """Initialize with coefficient map.

        Args:
            coefficient_map: (H, W) float32 array of coefficients in [0, 1].

        Raises:
            ValidationError: If coefficient_map is empty or invalid.
        """
        if coefficient_map is None or coefficient_map.size == 0:
            raise ValidationError("Coefficient map is empty")

        self._coefficient_map = coefficient_map.astype(np.float32)
        self._sorted_indices = None

    @property
    def coefficient_map(self) -> np.ndarray:
        """Return the coefficient map."""
        return self._coefficient_map

    def calculate_threshold(self, threshold_percent: int) -> dict:
        """Calculate threshold value and capacity metrics.

        Args:
            threshold_percent: Top percentage of pixels to select (0-100).

        Returns:
            Dictionary with threshold_value, selected_pixels, bit_capacity, byte_capacity.

        Raises:
            ValidationError: If threshold_percent is out of range.
        """
        if not 0 <= threshold_percent <= 100:
            raise ValidationError(
                f"Threshold percent must be 0-100, got {threshold_percent}"
            )

        flat = self._coefficient_map.flatten()
        flat_sorted = np.sort(flat)[::-1]

        if threshold_percent == 0:
            threshold_value = float(flat_sorted[0]) + 1.0
            selected_pixels = 0
        elif threshold_percent == 100:
            threshold_value = float(flat_sorted[-1]) - 1.0
            selected_pixels = len(flat)
        else:
            idx = max(0, int(len(flat_sorted) * threshold_percent / 100) - 1)
            threshold_value = float(flat_sorted[idx])
            selected_pixels = int(np.sum(self._coefficient_map >= threshold_value))

        bit_capacity = selected_pixels * 3
        byte_capacity = bit_capacity // 8

        return {
            "threshold_value": threshold_value,
            "selected_pixels": selected_pixels,
            "bit_capacity": bit_capacity,
            "byte_capacity": byte_capacity,
        }

    def generate_binary_map(self, threshold_percent: int) -> np.ndarray:
        """Generate binary map from coefficient map.

        Args:
            threshold_percent: Top percentage of pixels to select (0-100).

        Returns:
            Binary map (H, W) uint8 with values 0 or 1.
        """
        metrics = self.calculate_threshold(threshold_percent)
        binary_map = (
            self._coefficient_map >= metrics["threshold_value"]
        ).astype(np.uint8)
        return binary_map

    def get_statistics(self) -> dict:
        """Get statistical summary of the coefficient map.

        Returns:
            Dictionary with min, max, mean, std of coefficients.
        """
        return {
            "min": float(np.min(self._coefficient_map)),
            "max": float(np.max(self._coefficient_map)),
            "mean": float(np.mean(self._coefficient_map)),
            "std": float(np.std(self._coefficient_map)),
        }

    def get_sorted_indices(self) -> np.ndarray:
        """Get indices sorted by coefficient value descending.

        Returns:
            (N, 2) array of (row, col) indices sorted by coefficient descending.
        """
        if self._sorted_indices is None:
            flat_indices = np.argsort(self._coefficient_map.flatten())[::-1]
            rows, cols = np.unravel_index(flat_indices, self._coefficient_map.shape)
            self._sorted_indices = np.column_stack((rows, cols))
        return self._sorted_indices
