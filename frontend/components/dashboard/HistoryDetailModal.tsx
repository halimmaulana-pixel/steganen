'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HistoryEntry } from '@/lib/api';

interface HistoryDetailModalProps {
  entry: HistoryEntry | null;
  onClose: () => void;
}

export default function HistoryDetailModal({ entry, onClose }: HistoryDetailModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (entry) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [entry, onClose]);

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
              <h2 className="text-lg font-semibold text-white">Process #{entry.id}</h2>
              <button onClick={onClose} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-3">Metadata</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-dark-500">Tipe</p>
                    <p className="text-sm text-white font-medium capitalize">{entry.process_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">Threshold</p>
                    <p className="text-sm text-white font-medium">{entry.threshold_percent}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">Waktu</p>
                    <p className="text-sm text-white font-medium">
                      {new Date(entry.created_at).toLocaleDateString('id-ID')} {new Date(entry.created_at).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-3">Metrik Kualitas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-dark-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent-cyan tabular-nums">{entry.psnr_db?.toFixed(1) ?? '—'}</p>
                    <p className="text-xs text-dark-400 mt-1">PSNR (dB)</p>
                  </div>
                  <div className="bg-dark-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent-purple tabular-nums">{entry.ssim?.toFixed(4) ?? '—'}</p>
                    <p className="text-xs text-dark-400 mt-1">SSIM</p>
                  </div>
                  <div className="bg-dark-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent-orange tabular-nums">{entry.mse?.toFixed(2) ?? '—'}</p>
                    <p className="text-xs text-dark-400 mt-1">MSE</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-3">Payload & Kapasitas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Panjang Pesan</span>
                    <span className="text-white">{entry.message_length_chars} karakter ({entry.message_length_bits} bit)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Selected Pixels</span>
                    <span className="text-white">{entry.selected_pixels?.toLocaleString()} / {entry.total_pixels?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Kapasitas</span>
                    <span className="text-white">{entry.capacity_bits?.toLocaleString()} bits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Utilization</span>
                    <span className="text-white">{entry.usage_percent?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
