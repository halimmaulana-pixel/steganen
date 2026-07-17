'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FeatureMapGridProps {
  featureMaps: number[][][] | null;
}

function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  data: number[][],
  width: number,
  height: number
) {
  const cellW = width / data[0].length;
  const cellH = height / data.length;

  const min = Math.min(...data.flat());
  const max = Math.max(...data.flat());
  const range = max - min || 1;

  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      const normalized = (data[y][x] - min) / range;
      const r = Math.round(normalized * 255);
      const b = Math.round((1 - normalized) * 255);
      ctx.fillStyle = `rgb(${r}, 50, ${b})`;
      ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
    }
  }
}

export default function FeatureMapGrid({ featureMaps }: FeatureMapGridProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (!featureMaps) return;

    featureMaps.slice(0, 16).forEach((map, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 80;
      canvas.height = 80;
      drawHeatmap(ctx, map, 80, 80);
    });
  }, [featureMaps]);

  if (!featureMaps) {
    return (
      <div className="flex items-center justify-center h-80 bg-dark-900 rounded-xl border border-dark-700">
        <p className="text-dark-500 text-sm">Feature maps will appear here after processing</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-dark-200">CNN Feature Maps (16 Channels)</h3>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative group"
          >
            <canvas
              ref={(el) => {
                canvasRefs.current[i] = el;
              }}
              width={80}
              height={80}
              className="w-full rounded-lg border border-dark-700"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark-950/70 rounded-lg">
              <span className="text-xs text-dark-200 font-mono">CH {i}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
