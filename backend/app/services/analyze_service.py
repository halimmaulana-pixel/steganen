"""Business logic for analyzing stego images with theoretical explanations."""

import base64
from io import BytesIO
from typing import Any

import numpy as np
from PIL import Image

from app.core.exceptions import ImageProcessingError, InvalidMetadataError
from app.core.model import extract_features
from app.modules.threshold import Threshold


def _decode_base64_image(b64: str) -> np.ndarray:
    """Decode a base64 string to a numpy RGB array."""
    try:
        if "," in b64:
            b64 = b64.split(",", 1)[1]
        img_bytes = base64.b64decode(b64)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        return np.array(img, dtype=np.uint8)
    except Exception as e:
        raise ImageProcessingError(f"Invalid base64 image: {e}")


def analyze_image(stego_image_b64: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """Analyze a stego image and provide theoretical explanations.

    Provides:
        - Coefficient distribution statistics
        - Pixel analysis (texture vs smooth selection ratio)
        - Theoretical explanations for each finding
        - Optional threshold sweep data

    Args:
        stego_image_b64: Base64-encoded stego image.
        metadata: Extraction metadata with threshold_percent.

    Returns:
        Dict with analysis results and theoretical explanations.
    """
    if "threshold_percent" not in metadata:
        raise InvalidMetadataError("Missing 'threshold_percent' in metadata")

    stego_image = _decode_base64_image(stego_image_b64)
    threshold_percent = metadata["threshold_percent"]

    # Resize to standard CNN input size
    pil_img = Image.fromarray(stego_image)
    pil_img = pil_img.resize((224, 224), Image.BILINEAR)
    stego_image = np.array(pil_img, dtype=np.uint8)

    coefficient_map = extract_features(stego_image)

    coeff_stats = _compute_coefficient_stats(coefficient_map)

    texture_mask = coefficient_map > 0.5
    smooth_mask = coefficient_map <= 0.5
    texture_ratio = float(np.mean(texture_mask))
    smooth_ratio = float(np.mean(smooth_mask))

    threshold_gen = Threshold(coefficient_map=coefficient_map)
    binary_map = threshold_gen.generate_binary_map(threshold_percent)

    selected_in_texture = int(np.sum(binary_map & texture_mask))
    selected_in_smooth = int(np.sum(binary_map & smooth_mask))
    total_selected = int(np.sum(binary_map))

    pixel_analysis = {
        "texture_ratio": round(texture_ratio, 4),
        "smooth_ratio": round(smooth_ratio, 4),
        "selected_pixels_texture": selected_in_texture,
        "selected_pixels_smooth": selected_in_smooth,
        "total_selected": total_selected,
        "texture_selection_percent": round(
            (selected_in_texture / total_selected * 100) if total_selected > 0 else 0, 2
        ),
    }

    explanations = _generate_explanations(
        coeff_stats, pixel_analysis, threshold_percent
    )

    threshold_sweep = _threshold_sweep(coefficient_map, threshold_percent)

    return {
        "coefficient_stats": coeff_stats,
        "pixel_analysis": pixel_analysis,
        "explanations": explanations,
        "threshold_sweep": threshold_sweep,
    }


def _compute_coefficient_stats(coefficient_map: np.ndarray) -> dict[str, Any]:
    """Compute statistics on the CNN coefficient map."""
    return {
        "mean": round(float(np.mean(coefficient_map)), 6),
        "std": round(float(np.std(coefficient_map)), 6),
        "min": round(float(np.min(coefficient_map)), 6),
        "max": round(float(np.max(coefficient_map)), 6),
        "median": round(float(np.median(coefficient_map)), 6),
        "skewness": round(float(_skewness(coefficient_map)), 6),
        "kurtosis": round(float(_kurtosis(coefficient_map)), 6),
        "entropy": round(float(_entropy(coefficient_map)), 6),
    }


def _skewness(data: np.ndarray) -> float:
    """Compute skewness of a 1D array."""
    n = data.size
    if n < 3:
        return 0.0
    mean = np.mean(data)
    std = np.std(data, ddof=1)
    if std == 0:
        return 0.0
    return float(np.mean(((data - mean) / std) ** 3))


def _kurtosis(data: np.ndarray) -> float:
    """Compute excess kurtosis of a 1D array."""
    n = data.size
    if n < 4:
        return 0.0
    mean = np.mean(data)
    std = np.std(data, ddof=1)
    if std == 0:
        return 0.0
    return float(np.mean(((data - mean) / std) ** 4) - 3.0)


def _entropy(data: np.ndarray) -> float:
    """Compute Shannon entropy of a discretized coefficient map."""
    hist, _ = np.histogram(data, bins=256, range=(0, 1))
    probs = hist / hist.sum()
    probs = probs[probs > 0]
    return float(-np.sum(probs * np.log2(probs)))


def _generate_explanations(
    coeff_stats: dict[str, Any],
    pixel_analysis: dict[str, Any],
    threshold_percent: int,
) -> dict[str, str]:
    """Generate theoretical explanations for analysis findings."""
    mean_val = coeff_stats["mean"]
    texture_pct = pixel_analysis["texture_selection_percent"]

    if mean_val > 0.6:
        coeff_explanation = (
            "Koefisien rata-rata tinggi (>0.6), menunjukkan fitur CNN terdeteksi kuat "
            "pada area tekstur. Area tekstur memiliki variasi pixel tinggi sehingga "
            "modifikasi LSB lebih sulit dideteksi secara visual karena tertutup "
            " oleh noise alami tekstur."
        )
    elif mean_val > 0.3:
        coeff_explanation = (
            "Koefisien rata-rata moderat (0.3-0.6), menunjukkan distribusi fitur "
            "relatif seimbang antara area tekstur dan halus. Threshold ini memberikan "
            "keseimbangan antara kapasitas embedding dan imperceptibility."
        )
    else:
        coeff_explanation = (
            "Koefisien rata-rata rendah (<0.3), menunjukkan sebagian besar area "
            "dianggap halus oleh CNN. Threshold ini menghasilkan seleksi pixel "
            "konservatif — hanya area dengan fitur sangat kuat yang dipilih, "
            "memaksimalkan imperceptibility namun membatasi kapasitas."
        )

    if texture_pct > 70:
        selection_explanation = (
            f"Sebanyak {texture_pct:.1f}% pixel dipilih dari area tekstur. "
            "Ini konsisten dengan teori steganografi bahwa area tekstur "
            "(dengan entropi tinggi) lebih toleran terhadap modifikasi LSB "
            "karena mata manusia lebih sulit mendeteksi perubahan pada "
            "area dengan variasi intensitas tinggi."
        )
    elif texture_pct > 50:
        selection_explanation = (
            f"Sebanyak {texture_pct:.1f}% pixel dipilih dari area tekstur. "
            "Distribusi ini menunjukkan pendekatan seimbang — memanfaatkan "
            "area tekstur untuk imperceptibility sambil tetap memanfaatkan "
            "area halus untuk meningkatkan kapasitas."
        )
    else:
        selection_explanation = (
            f"Sebanyak {texture_pct:.1f}% pixel dipilih dari area halus. "
            "Ini tidak ideal untuk imperceptibility karena modifikasi LSB "
            "pada area halus lebih mudah terdeteksi secara visual. "
            "Disarankan untuk menurunkan threshold."
        )

    threshold_explanation = (
        f"Threshold {threshold_percent}% menghasilkan pembedaan antara "
        "area tekstur (koefisien tinggi) dan area halus (koefisien rendah). "
        "CNN MobileNetV2 mengekstrak fitur deep learning yang menangkap "
        "polaa tekstur multi-scale, sehingga seleksi pixel lebih tepat "
        "sasaran dibandingkan pendekatan statistik tradisional (variance, entropy)."
    )

    return {
        "coefficient_distribution": coeff_explanation,
        "pixel_selection": selection_explanation,
        "threshold_methodology": threshold_explanation,
    }


def _threshold_sweep(
    coefficient_map: np.ndarray,
    current_threshold: int,
) -> list[dict[str, Any]]:
    """Sweep thresholds and compute selection statistics at each level."""
    sweep_points = list(range(5, 100, 5))
    if current_threshold not in sweep_points:
        sweep_points.append(current_threshold)
        sweep_points.sort()

    results = []
    total_pixels = coefficient_map.size
    for t in sweep_points:
        gen = Threshold(coefficient_map=coefficient_map)
        bmap = gen.generate_binary_map(t)
        selected = int(np.sum(bmap))
        texture_mask = coefficient_map > 0.5
        in_texture = int(np.sum(bmap & texture_mask))
        results.append({
            "threshold": t,
            "selected_pixels": selected,
            "selection_ratio": round(selected / total_pixels, 4),
            "texture_percent": round(
                (in_texture / selected * 100) if selected > 0 else 0, 2
            ),
        })
    return results
