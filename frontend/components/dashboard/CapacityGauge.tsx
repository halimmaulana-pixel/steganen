'use client';

interface CapacityGaugeProps {
  avgUsagePercent: number;
  totalCapacityBits: number;
  totalUsedBits: number;
}

export default function CapacityGauge({ avgUsagePercent, totalCapacityBits, totalUsedBits }: CapacityGaugeProps) {
  const percent = Math.min(avgUsagePercent, 100);
  const radius = 70;
  const circumference = Math.PI * radius;
  const filled = (percent / 100) * circumference;

  const getColor = (p: number) => {
    if (p < 50) return { stroke: '#06d6a0', text: 'text-accent-cyan' };
    if (p < 80) return { stroke: '#fb5607', text: 'text-accent-orange' };
    return { stroke: '#ff006e', text: 'text-accent-pink' };
  };
  const color = getColor(percent);

  if (totalCapacityBits === 0) {
    return (
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6 flex flex-col items-center">
        <h3 className="text-sm font-medium text-dark-400 mb-4">Kapasitas</h3>
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-dark-500">Belum ada data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6 flex flex-col items-center">
      <h3 className="text-sm font-medium text-dark-400 mb-4">Kapasitas</h3>
      <div className="relative w-44 h-28">
        <svg viewBox="0 0 160 90" className="w-full h-full">
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="#262626"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke={color.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={`text-2xl font-bold tabular-nums ${color.text}`}>
            {percent.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-xs text-dark-400 mt-2">
        {totalUsedBits.toLocaleString()} / {totalCapacityBits.toLocaleString()} bits
      </p>
    </div>
  );
}
