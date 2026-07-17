'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BinaryMapDisplayProps {
  originalImageUrl: string | null;
  coefficients: number[][] | null;
  threshold: number;
}

export default function BinaryMapDisplay({
  originalImageUrl,
  coefficients,
  threshold,
}: BinaryMapDisplayProps) {
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [selectionMapUrl, setSelectionMapUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate selection map from coefficients and threshold
  useEffect(() => {
    if (!coefficients) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = coefficients.length;
    canvas.width = size;
    canvas.height = size;

    const flatValues = coefficients.flat();
    const min = Math.min(...flatValues);
    const max = Math.max(...flatValues);
    const range = max - min || 1;

    // Threshold determines which coefficients are selected
    // Higher threshold = fewer coefficients selected
    const thresholdNorm = threshold / 100;
    const thresholdValue = min + range * thresholdNorm;

    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const val = coefficients[y][x];
        // Selected = coefficient value > threshold (green)
        if (val > thresholdValue) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    setSelectionMapUrl(canvas.toDataURL());
  }, [coefficients, threshold]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-dark-200">Coefficient Selection Map</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-dark-400">Opacity:</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="w-20 h-1 accent-accent-cyan"
          />
          <span className="text-xs text-dark-400 w-8">{Math.round(overlayOpacity * 100)}%</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {originalImageUrl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-xl overflow-hidden border border-dark-700"
        >
          <img
            src={originalImageUrl}
            alt="Original"
            className="w-full h-auto"
          />

          {selectionMapUrl && (
            <img
              src={selectionMapUrl}
              alt="Selection Map"
              className="absolute inset-0 w-full h-auto mix-blend-screen"
              style={{ opacity: overlayOpacity }}
            />
          )}

          <div className="absolute bottom-2 left-2 flex items-center gap-3 text-xs bg-dark-950/80 px-3 py-1.5 rounded-lg">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 255, 0, 0.6)' }} />
              Selected ({coefficients ? Math.floor(coefficients.length * coefficients.length * (100 - threshold) / 100) : 0})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(128, 128, 128, 0.6)' }} />
              Not Selected
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-dark-900 rounded-xl border border-dark-700">
          <p className="text-dark-500 text-sm">Coefficient map will appear after processing</p>
        </div>
      )}
    </div>
  );
}
