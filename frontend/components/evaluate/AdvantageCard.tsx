'use client';

import { motion } from 'framer-motion';

interface AdvantageCardProps {
  title: string;
  standar: number;
  cnn: number;
  unit?: string;
  higherBetter?: boolean;
  lowerBetter?: boolean;
}

export default function AdvantageCard({
  title,
  standar,
  cnn,
  unit = '',
  higherBetter = true,
  lowerBetter = false,
}: AdvantageCardProps) {
  const diff = cnn - standar;
  const isBetter = higherBetter ? diff > 0 : lowerBetter ? diff < 0 : false;
  const pct = standar !== 0 ? Math.abs(diff / standar) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${
        isBetter
          ? 'bg-accent-cyan/5 border-accent-cyan/20'
          : 'bg-dark-800/50 border-dark-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-dark-400">{title}</span>
        {isBetter && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-medium">
            CNN unggul
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-lg font-bold font-mono ${isBetter ? 'text-accent-cnn' : 'text-dark-300'}`}>
          {cnn.toFixed(4)}
        </span>
        <span className="text-[10px] text-dark-500">vs</span>
        <span className="text-sm text-dark-400 font-mono">
          {standar.toFixed(4)}
        </span>
        {unit && <span className="text-[10px] text-dark-500">{unit}</span>}
      </div>
      <p className="text-[10px] text-dark-500 mt-1">
        {isBetter ? `+${pct.toFixed(1)}% lebih baik` : pct > 0 ? `-${pct.toFixed(1)}% lebih rendah` : 'Setara'}
      </p>
    </motion.div>
  );
}
