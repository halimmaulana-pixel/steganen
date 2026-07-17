'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface BitPlaneViewProps {
  originalImageUrl: string | null;
}

function extractBitPlane(imageData: ImageData, bit: number): boolean[][] {
  const { width, height, data } = imageData;
  const plane: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    plane[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = Math.round(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      plane[y][x] = ((gray >> bit) & 1) === 1;
    }
  }
  return plane;
}

function drawBitPlane(
  ctx: CanvasRenderingContext2D,
  plane: boolean[][],
  width: number,
  height: number
) {
  const cellW = width / plane[0].length;
  const cellH = height / plane.length;

  for (let y = 0; y < plane.length; y++) {
    for (let x = 0; x < plane[y].length; x++) {
      ctx.fillStyle = plane[y][x] ? '#e5e5e5' : '#1a1a1a';
      ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
    }
  }
}

export default function BitPlaneView({ originalImageUrl }: BitPlaneViewProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [planes, setPlanes] = useState<boolean[][][]>([]);
  const [highlightedBit, setHighlightedBit] = useState<number>(0);

  useEffect(() => {
    if (!originalImageUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const extracted = Array.from({ length: 8 }, (_, i) =>
        extractBitPlane(imageData, i)
      );
      setPlanes(extracted);
    };
    img.src = originalImageUrl;
  }, [originalImageUrl]);

  useEffect(() => {
    if (planes.length === 0) return;

    const displaySize = 80;
    planes.forEach((plane, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = displaySize;
      canvas.height = displaySize;
      drawBitPlane(ctx, plane, displaySize, displaySize);
    });
  }, [planes]);

  if (!originalImageUrl || planes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-dark-900 rounded-xl border border-dark-700">
        <p className="text-dark-500 text-sm">Bit planes will appear after processing</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-dark-200">Bit Plane Decomposition</h3>
        <span className="text-xs text-accent-cyan">
          Highlighting: Bit {highlightedBit} {highlightedBit === 0 ? '(LSB - Message Hidden)' : highlightedBit === 7 ? '(MSB)' : ''}
        </span>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: 8 }).map((_, i) => {
          const bit = 7 - i;
          return (
            <motion.div
              key={bit}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                highlightedBit === bit
                  ? 'border-accent-cyan shadow-lg shadow-accent-cyan/20'
                  : 'border-dark-700 hover:border-dark-500'
              }`}
              onClick={() => setHighlightedBit(bit)}
            >
              <canvas
                ref={(el) => {
                  canvasRefs.current[i] = el;
                }}
                width={80}
                height={80}
                className="w-full rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5 bg-dark-950/80 rounded-b-lg">
                <span className={bit === 0 ? 'text-accent-cyan font-bold' : 'text-dark-400'}>
                  Bit {bit}
                </span>
              </div>
              {bit === 0 && (
                <div className="absolute top-1 right-1">
                  <span className="text-[10px] px-1 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                    MSG
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
