"""Text-to-bit conversion and capacity utilities."""

from app.core.exceptions import CapacityExceededError, ValidationError


def text_to_bits(text: str) -> str:
    """Convert a text string to a binary bit string.

    Each character is encoded as 8 bits (zero-padded).

    Args:
        text: Input text string.

    Returns:
        Bit string representation, e.g. "0100100001100101".

    Raises:
        ValidationError: If the input is empty.
    """
    if not text:
        raise ValidationError("Cannot convert empty text to bits")

    bits = "".join(format(ord(char), "08b") for char in text)
    return bits


def bits_to_text(bits: str) -> str:
    """Convert a binary bit string back to text.

    Args:
        bits: Bit string with length divisible by 8.

    Returns:
        Decoded text string.

    Raises:
        ValidationError: If the bit string length is not a multiple of 8.
    """
    if not bits:
        raise ValidationError("Cannot convert empty bits to text")

    if len(bits) % 8 != 0:
        raise ValidationError(
            f"Bit string length ({len(bits)}) is not a multiple of 8"
        )

    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i : i + 8]
        chars.append(chr(int(byte, 2)))

    return "".join(chars)


def get_bit_capacity(selected_pixels: int) -> int:
    """Calculate the maximum bit capacity for embedding.

    Each selected pixel stores 1 bit per channel (RGB),
    yielding 3 bits per pixel.

    Args:
        selected_pixels: Number of pixels selected for embedding.

    Returns:
        Total embedding capacity in bits.
    """
    return selected_pixels * 3


def validate_message_capacity(message: str, max_capacity: int) -> bool:
    """Validate that a message fits within the embedding capacity.

    Args:
        message: The secret message to validate.
        max_capacity: Maximum allowed bit capacity.

    Returns:
        True if the message fits.

    Raises:
        CapacityExceededError: If the message exceeds the capacity.
    """
    message_bits = len(text_to_bits(message))
    if message_bits > max_capacity:
        raise CapacityExceededError(
            f"Message requires {message_bits} bits but capacity is {max_capacity} bits "
            f"({max_capacity // 8} bytes)"
        )
    return True
