'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl border border-dark-800 bg-dark-900 p-6 group hover:border-dark-700 transition-colors`}
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${gradient}`} />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-dark-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-white/10`}>
          {icon}
        </div>
      </div>

      {/* Bottom border glow */}
      <div className={`absolute bottom-0 left-0 right-0 h-px ${gradient} opacity-30`} />
    </motion.div>
  );
}

interface StatCardsProps {
  totalProcesses: number;
  avgPsnr: number;
  avgSsim: number;
  totalPayload: string;
}

export default function StatCards({ totalProcesses, avgPsnr, avgSsim, totalPayload }: StatCardsProps) {
  const cards = [
    {
      title: 'Total Proses',
      value: totalProcesses,
      subtitle: 'Operasi steganografi',
      gradient: 'bg-gradient-to-br from-accent-cyan to-accent-blue',
      icon: (
        <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'Rata-rata PSNR',
      value: `${avgPsnr.toFixed(1)} dB`,
      subtitle: 'Kualitas citra',
      gradient: 'bg-gradient-to-br from-accent-purple to-accent-pink',
      icon: (
        <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Rata-rata SSIM',
      value: avgSsim.toFixed(3),
      subtitle: 'Structural similarity',
      gradient: 'bg-gradient-to-br from-accent-blue to-accent-cyan',
      icon: (
        <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Total Payload',
      value: totalPayload,
      subtitle: 'Data tersembunyi',
      gradient: 'bg-gradient-to-br from-accent-orange to-accent-pink',
      icon: (
        <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.title} {...card} delay={i * 0.1} />
      ))}
    </div>
  );
}
