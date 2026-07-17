'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ThresholdHistogramProps {
  values: number[] | null;
  threshold: number;
  selectedCount?: number;
  totalCount?: number;
}

export default function ThresholdHistogram({
  values,
  threshold,
  selectedCount = 0,
  totalCount = 0,
}: ThresholdHistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!values || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 500;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    // Create histogram bins
    const numBins = 50;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins || 1;
    const bins = new Array(numBins).fill(0);

    values.forEach((v) => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
      bins[binIndex]++;
    });

    const maxBin = Math.max(...bins);
    const barW = plotW / numBins;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Threshold position
    const thresholdNorm = (threshold / 100) * (max - min) + min;
    const thresholdBin = Math.floor((thresholdNorm - min) / binWidth);
    const thresholdX = padding.left + (thresholdBin / numBins) * plotW;

    // Draw bars
    bins.forEach((count, i) => {
      const barH = (count / maxBin) * plotH;
      const x = padding.left + i * barW;
      const y = padding.top + plotH - barH;

      // Selected (below threshold) = cyan, Rejected = dark
      if (i < thresholdBin) {
        ctx.fillStyle = 'rgba(6, 214, 160, 0.7)';
      } else {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      }
      ctx.fillRect(x, y, barW - 1, barH);
    });

    // Threshold line
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(thresholdX, padding.top);
    ctx.lineTo(thresholdX, padding.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Threshold label
    ctx.fillStyle = '#ff006e';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`θ = ${threshold}%`, thresholdX, padding.top - 6);

    // Axes labels
    ctx.fillStyle = '#737373';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Coefficient Value', width / 2, height - 6);
    ctx.save();
    ctx.translate(14, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Count', 0, 0);
    ctx.restore();

    // Axis ticks
    ctx.fillStyle = '#737373';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const val = min + ((max - min) / 5) * i;
      const x = padding.left + (plotW / 5) * i;
      ctx.fillText(val.toFixed(0), x, height - padding.bottom + 14);
    }
  }, [values, threshold]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-dark-200">Threshold Histogram</h3>
        {totalCount > 0 && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-accent-cyan">Selected: {selectedCount}</span>
            <span className="text-dark-400">Rejected: {totalCount - selectedCount}</span>
          </div>
        )}
      </div>
      {values ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <canvas ref={canvasRef} className="rounded-lg border border-dark-700" />
        </motion.div>
      ) : (
        <div className="flex items-center justify-center h-52 bg-dark-900 rounded-xl border border-dark-700">
          <p className="text-dark-500 text-sm">Histogram will appear after processing</p>
        </div>
      )}
    </div>
  );
}
