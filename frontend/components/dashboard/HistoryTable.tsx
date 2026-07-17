'use client';

import { motion } from 'framer-motion';
import type { HistoryEntry } from '@/lib/api';

interface HistoryTableProps {
  data: HistoryEntry[];
}

const METHOD_LABELS: Record<string, string> = {
  embed: 'Embed',
  extract: 'Extract',
  evaluate: 'Evaluate',
  analyze: 'Analyze',
};

export default function HistoryTable({ data }: HistoryTableProps) {
  const recent = data.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-sm font-medium text-dark-400">Proses Terakhir</h3>
          <p className="text-lg font-semibold text-white">Riwayat Steganografi</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="px-6 pb-6 text-center text-dark-500 text-sm">
          Belum ada riwayat proses.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-dark-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Citra
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  PSNR
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  SSIM
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Usage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {recent.map((entry) => (
                <tr key={entry.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-3.5 text-dark-300 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-3.5 text-white font-medium max-w-[160px] truncate">
                    {entry.image_name}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-1 rounded-md bg-dark-800 text-dark-300 text-xs font-medium">
                      {METHOD_LABELS[entry.process_type] || entry.process_type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-dark-300 tabular-nums">
                    {entry.threshold_percent}%
                  </td>
                  <td className="px-6 py-3.5 text-right tabular-nums">
                    <span className={entry.psnr_db != null && entry.psnr_db >= 40 ? 'text-accent-cyan' : entry.psnr_db != null && entry.psnr_db >= 30 ? 'text-accent-orange' : 'text-accent-pink'}>
                      {entry.psnr_db != null ? `${entry.psnr_db.toFixed(1)} dB` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right tabular-nums">
                    <span className={entry.ssim != null && entry.ssim >= 0.95 ? 'text-accent-cyan' : entry.ssim != null && entry.ssim >= 0.9 ? 'text-accent-blue' : 'text-accent-pink'}>
                      {entry.ssim != null ? entry.ssim.toFixed(4) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-dark-300 tabular-nums">
                    {entry.usage_percent != null ? `${entry.usage_percent.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
