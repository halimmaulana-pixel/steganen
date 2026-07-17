'use client';

import { motion } from 'framer-motion';

interface HeroStatsProps {
  totalProcesses: number;
  avgPsnr: number;
  avgSsim: number;
  totalPayload: string;
  embedRatio: number;
  avgUsagePercent: number;
}

const stats = (props: HeroStatsProps) => [
  {
    label: 'Total Proses',
    value: props.totalProcesses || '—',
    subtitle: props.totalProcesses ? 'proses selesai' : 'Belum ada data',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: 'accent-cyan',
    gradient: 'from-accent-cyan/20 to-accent-blue/20',
  },
  {
    label: 'Rata-rata PSNR',
    value: props.totalProcesses ? `${props.avgPsnr.toFixed(1)} dB` : '—',
    subtitle: props.avgPsnr >= 40 ? 'Excellent' : props.avgPsnr >= 30 ? 'Good' : 'Poor',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'accent-cyan',
    gradient: 'from-accent-cyan/20 to-accent-green/20',
  },
  {
    label: 'Rata-rata SSIM',
    value: props.totalProcesses ? props.avgSsim.toFixed(4) : '—',
    subtitle: props.avgSsim >= 0.95 ? 'Excellent' : props.avgSsim >= 0.90 ? 'Good' : 'Poor',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: 'accent-purple',
    gradient: 'from-accent-purple/20 to-accent-pink/20',
  },
  {
    label: 'Payload Total',
    value: props.totalPayload,
    subtitle: 'data tersembunyi',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    color: 'accent-orange',
    gradient: 'from-accent-orange/20 to-accent-yellow/20',
  },
  {
    label: 'Rasio Embed',
    value: props.totalProcesses ? `${(props.embedRatio * 100).toFixed(0)}%` : '—',
    subtitle: 'dari total operasi',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    color: 'accent-blue',
    gradient: 'from-accent-blue/20 to-accent-purple/20',
  },
  {
    label: 'Kapasitas Terpakai',
    value: props.totalProcesses ? `${props.avgUsagePercent.toFixed(1)}%` : '—',
    subtitle: 'rata-rata utilization',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 3.5 4 8 4s8-2 8-4V7M4 7c0 2 3.5 4 8 4s8-2 8-4M4 7c0-2 3.5-4 8-4s8 2 8 4m0 5c0 2-3.5 4-8 4s-8-2-8-4" />
      </svg>
    ),
    color: 'accent-pink',
    gradient: 'from-accent-pink/20 to-accent-red/20',
  },
];

export default function HeroStats(props: HeroStatsProps) {
  const items = stats(props);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-dark-800 bg-dark-900 p-5 group hover:border-dark-700 transition-colors"
        >
          {/* Accent glow */}
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${item.gradient}`} />

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-white/5 text-${item.color}`}>
                {item.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight tabular-nums">
              {item.value}
            </p>
            <p className="text-sm font-medium text-dark-400 mt-1">{item.label}</p>
            <p className="text-xs text-dark-500 mt-0.5">{item.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
