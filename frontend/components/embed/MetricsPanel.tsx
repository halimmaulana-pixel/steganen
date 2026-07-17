'use client';

import { motion } from 'framer-motion';

interface MetricsPanelProps {
  psnr: number | null;
  ssim: number | null;
  mse: number | null;
}

function getQualityLabel(psnr: number): { label: string; color: string } {
  if (psnr >= 50) return { label: 'Excellent', color: 'text-accent-cyan' };
  if (psnr >= 40) return { label: 'Good', color: 'text-accent-blue' };
  if (psnr >= 30) return { label: 'Fair', color: 'text-accent-orange' };
  return { label: 'Poor', color: 'text-accent-pink' };
}

function Gauge({ value, max, label, unit, color }: {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-12 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="#262626"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <motion.path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-sm font-bold text-dark-100">{value.toFixed(1)}</span>
          <span className="text-[10px] text-dark-400 ml-0.5">{unit}</span>
        </div>
      </div>
      <span className="text-xs text-dark-400">{label}</span>
    </div>
  );
}

export default function MetricsPanel({ psnr, ssim, mse }: MetricsPanelProps) {
  if (psnr === null || ssim === null || mse === null) {
    return (
      <div className="flex items-center justify-center h-40 bg-dark-900 rounded-xl border border-dark-700">
        <p className="text-dark-500 text-sm">Metrics will appear after processing</p>
      </div>
    );
  }

  const quality = getQualityLabel(psnr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-900 rounded-xl border border-dark-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-dark-200">Quality Metrics</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          quality.color === 'text-accent-cyan'
            ? 'bg-accent-cyan/10 text-accent-cyan'
            : quality.color === 'text-accent-blue'
            ? 'bg-accent-blue/10 text-accent-blue'
            : quality.color === 'text-accent-orange'
            ? 'bg-accent-orange/10 text-accent-orange'
            : 'bg-accent-pink/10 text-accent-pink'
        }`}>
          {quality.label}
        </span>
      </div>

      <div className="flex justify-around">
        <Gauge value={psnr} max={60} label="PSNR" unit="dB" color="#06d6a0" />
        <Gauge value={ssim} max={1} label="SSIM" unit="" color="#3a86ff" />
        <Gauge value={mse} max={100} label="MSE" unit="" color="#8338ec" />
      </div>

      <div className="mt-4 p-3 bg-dark-950 rounded-lg text-xs text-dark-400 space-y-1">
        <p><span className="text-dark-200">PSNR &gt; 50dB:</span> Excellent imperceptibility</p>
        <p><span className="text-dark-200">SSIM ≈ 1:</span> Structurally similar to original</p>
        <p><span className="text-dark-200">MSE ≈ 0:</span> Minimal pixel difference</p>
      </div>
    </motion.div>
  );
}
