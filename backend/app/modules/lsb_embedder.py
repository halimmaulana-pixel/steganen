"""
LSB Adaptive Embedding.

Algorithm:
1. Input: cover_image (224, 224, 3), binary_map (224, 224), message (str)
2. Convert message to bit string (8-bit ASCII)
3. Validate capacity
4. Sort pixels by coefficient descending
5. For each selected pixel (binary_map=1), embed bit using: P' = (P AND 254) OR m
6. Return stego_image
"""

from __future__ import annotations

import numpy as np

from app.core.exceptions import CapacityExceededError, ValidationError


class LSBEmbedder:
    """Adaptive LSB embedder that uses a binary map and coefficient scores."""

    def __init__(
        self,
        cover_image: np.ndarray,
        binary_map: np.ndarray,
        coefficient_map: np.ndarray,
    ) -> None:
        if cover_image.ndim != 3 or cover_image.shape[2] != 3:
            raise ValidationError(
                f"cover_image must be (H, W, 3), got shape {cover_image.shape}"
            )
        if binary_map.shape != cover_image.shape[:2]:
            raise ValidationError(
                f"binary_map shape {binary_map.shape} must match "
                f"cover_image spatial dims {cover_image.shape[:2]}"
            )
        if coefficient_map.shape != cover_image.shape[:2]:
            raise ValidationError(
                f"coefficient_map shape {coefficient_map.shape} must match "
                f"cover_image spatial dims {cover_image.shape[:2]}"
            )

        self._cover = cover_image.astype(np.uint8).copy()
        self._binary_map = binary_map.astype(np.uint8).copy()
        self._coefficient_map = coefficient_map.astype(np.float64).copy()

        # Build sorted pixel indices — highest coefficient first
        self._positions = self._build_positions()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def embed(self, message: str) -> np.ndarray:
        """Embed *message* into the cover image and return the stego image.

        Each character is encoded as 8-bit ASCII. Bits are placed into the
        least-significant bit of each colour channel of pixels selected by
        the binary map, ordered by descending coefficient value.

        Returns:
            np.ndarray: Stego image with shape and dtype matching the cover.

        Raises:
            CapacityExceededError: If the message requires more bits than
                available embedding positions.
        """
        bits = self._message_to_bits(message)
        total_bits = len(bits)
        available = len(self._positions)

        if total_bits > available:
            raise CapacityExceededError(
                f"Message requires {total_bits} bits but only "
                f"{available} embedding positions available"
            )

        stego = self._cover.copy()
        bit_index = 0

        for i, j in self._positions:
            if bit_index >= total_bits:
                break

            for channel in range(3):
                if bit_index >= total_bits:
                    break
                bit = int(bits[bit_index])
                pixel_val = int(stego[i, j, channel])
                stego[i, j, channel] = (pixel_val & 0xFE) | bit
                bit_index += 1

        return stego

    def get_pixel_comparison(self, i: int, j: int) -> dict:
        """Compare cover and stego pixel values at position (i, j).

        Returns a dict with before/after values, binary representations,
        and which bits were changed.
        """
        if i < 0 or i >= self._cover.shape[0]:
            raise ValidationError(f"Row index {i} out of range")
        if j < 0 or j >= self._cover.shape[1]:
            raise ValidationError(f"Column index {j} out of range")

        channels = ("R", "G", "B")
        comparison: dict = {
            "position": (i, j),
            "channels": {},
        }

        for c_idx, ch_name in enumerate(channels):
            before = int(self._cover[i, j, c_idx])
            after = int(self._cover[i, j, c_idx])
            before_bin = format(before, "08b")
            after_bin = format(after, "08b")

            changed_bits = []
            for bit_pos in range(8):
                if before_bin[bit_pos] != after_bin[bit_pos]:
                    changed_bits.append(7 - bit_pos)

            comparison["channels"][ch_name] = {
                "before": before,
                "after": after,
                "before_binary": before_bin,
                "after_binary": after_bin,
                "lsb": before & 1,
                "bits_changed": changed_bits,
            }

        comparison["selected"] = bool(self._binary_map[i, j])
        comparison["coefficient"] = float(self._coefficient_map[i, j])

        return comparison

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_positions(self) -> list[tuple[int, int]]:
        """Return (row, col) positions where binary_map=1, sorted by
        coefficient descending."""
        ys, xs = np.where(self._binary_map > 0)
        if len(ys) == 0:
            return []

        coeffs = self._coefficient_map[ys, xs]
        order = np.argsort(-coeffs)
        return list(zip(ys[order].tolist(), xs[order].tolist()))

    @staticmethod
    def _message_to_bits(message: str) -> str:
        """Convert *message* to a bit string using 8-bit ASCII encoding."""
        encoded = message.encode("ascii")
        return "".join(format(byte, "08b") for byte in encoded)
