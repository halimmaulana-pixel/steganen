'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CoefficientHeatmapProps {
  coefficients: number[][] | null;
  threshold: number;
}

function interpolateColor(value: number, min: number, max: number): string {
  const t = (value - min) / (max - min || 1);
  // RdBu_r: red (high) -> white (mid) -> blue (low)
  const r = t < 0.5 ? 255 : Math.round(255 * (1 - 2 * (t - 0.5)));
  const g = t < 0.5 ? Math.round(255 * 2 * t) : Math.round(255 * (2 * (1 - t)));
  const b = t < 0.5 ? Math.round(255 * (1 - 2 * t)) : 255;
  return `rgb(${r}, ${g}, ${b})`;
}

export default function CoefficientHeatmap({ coefficients, threshold }: CoefficientHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!coefficients || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = coefficients.length;
    const displaySize = Math.min(container.clientWidth, 400);
    canvas.width = displaySize;
    canvas.height = displaySize;

    const cellSize = displaySize / size;
    const flatValues = coefficients.flat();
    const min = Math.min(...flatValues);
    const max = Math.max(...flatValues);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = interpolateColor(coefficients[y][x], min, max);
        ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
      }
    }

    // Draw threshold line indicator
    const thresholdY = displaySize * (1 - (threshold / 100));
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(displaySize, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = '#ff006e';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Threshold: ${threshold}%`, 8, thresholdY - 6);
  }, [coefficients, threshold]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-dark-200">Coefficient Distribution Heatmap</h3>
        <div className="flex items-center gap-3 text-xs text-dark-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-white" /> Mid
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-500" /> Low
          </span>
        </div>
      </div>
      <div ref={containerRef} className="flex justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <canvas ref={canvasRef} className="rounded-lg border border-dark-700" />
          <div className="absolute bottom-2 right-2 text-xs text-dark-400 bg-dark-950/70 px-2 py-0.5 rounded">
            {coefficients?.length}x{coefficients?.length}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
