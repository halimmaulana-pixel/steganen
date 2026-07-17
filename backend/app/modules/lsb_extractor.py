"""
LSB Extraction.

Algorithm:
1. Input: stego_image (224, 224, 3), binary_map (224, 224), message_length_bits (int)
2. Sort pixels by coefficient (same order as embed)
3. For each selected pixel, read bit: bit = pixel AND 1
4. Collect bit string
5. Convert bits to text (8-bit ASCII)
"""

from __future__ import annotations

import numpy as np

from app.core.exceptions import ValidationError


class LSBExtractor:
    """Extract a secret message from a stego image using adaptive LSB."""

    def __init__(
        self,
        stego_image: np.ndarray,
        binary_map: np.ndarray,
        coefficient_map: np.ndarray,
    ) -> None:
        if stego_image.ndim != 3 or stego_image.shape[2] != 3:
            raise ValidationError(
                f"stego_image must be (H, W, 3), got shape {stego_image.shape}"
            )
        if binary_map.shape != stego_image.shape[:2]:
            raise ValidationError(
                f"binary_map shape {binary_map.shape} must match "
                f"stego_image spatial dims {stego_image.shape[:2]}"
            )
        if coefficient_map.shape != stego_image.shape[:2]:
            raise ValidationError(
                f"coefficient_map shape {coefficient_map.shape} must match "
                f"stego_image spatial dims {stego_image.shape[:2]}"
            )

        self._stego = stego_image.astype(np.uint8).copy()
        self._binary_map = binary_map.astype(np.uint8).copy()
        self._coefficient_map = coefficient_map.astype(np.float64).copy()

        self._positions = self._build_positions()
        self._extracted_bits: list[tuple[int, int, int, int]] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def extract(self, message_length_bits: int) -> str:
        """Extract *message_length_bits* bits from the stego image.

        Bits are read from the least-significant bit of each colour channel
        of pixels selected by the binary map, ordered by descending
        coefficient (matching the embedder's order).

        Returns:
            str: The decoded ASCII message.

        Raises:
            ValidationError: If the requested length exceeds available bits.
        """
        available = len(self._positions) * 3  # 3 channels per pixel

        if message_length_bits <= 0:
            raise ValidationError(
                f"message_length_bits must be positive, got {message_length_bits}"
            )
        if message_length_bits > available:
            raise ValidationError(
                f"Requested {message_length_bits} bits but only "
                f"{available} available from the binary map"
            )

        self._extracted_bits = []
        raw_bits: list[str] = []
        bits_collected = 0

        for i, j in self._positions:
            if bits_collected >= message_length_bits:
                break
            for channel in range(3):
                if bits_collected >= message_length_bits:
                    break
                bit = int(self._stego[i, j, channel]) & 1
                self._extracted_bits.append((i, j, channel, bit))
                raw_bits.append(str(bit))
                bits_collected += 1

        return self._bits_to_text("".join(raw_bits))

    def get_extracted_bits(self) -> list[tuple[int, int, int]]:
        """Return list of (row, col, bit_value) for each extracted bit."""
        return [(i, j, b) for i, j, _, b in self._extracted_bits]

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_positions(self) -> list[tuple[int, int]]:
        """Return (row, col) positions where binary_map=1, sorted by
        coefficient descending — must match the embedder's order."""
        ys, xs = np.where(self._binary_map > 0)
        if len(ys) == 0:
            return []

        coeffs = self._coefficient_map[ys, xs]
        order = np.argsort(-coeffs)
        return list(zip(ys[order].tolist(), xs[order].tolist()))

    @staticmethod
    def _bits_to_text(bits: str) -> str:
        """Convert a bit string to ASCII text, grouping 8 bits per char."""
        chars: list[str] = []
        for idx in range(0, len(bits) - 7, 8):
            byte_val = int(bits[idx : idx + 8], 2)
            chars.append(chr(byte_val))
        return "".join(chars)
