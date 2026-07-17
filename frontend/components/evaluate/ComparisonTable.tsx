'use client';

import { motion } from 'framer-motion';
import type { Metrics } from '@/lib/types';

interface ComparisonTableProps {
  lsbStandar: Metrics;
  lsbCnn: Metrics;
}

interface RowData {
  label: string;
  unit: string;
  standar: number;
  cnn: number;
  higherBetter: boolean;
  category: string;
  description: string;
}

function winnerCell(standar: number, cnn: number, higherBetter: boolean) {
  const diff = cnn - standar;
  const isWinner = higherBetter ? diff > 0 : diff < 0;
  const isTie = Math.abs(diff) < 0.001;
  return isTie ? 'tie' : isWinner ? 'cnn' : 'standar';
}

const CATEGORIES = [
  { id: 'quality', label: 'Kualitas Visual', icon: '👁️', description: 'Metrik imperceptibility dan struktur gambar' },
  { id: 'per_channel', label: 'Per Channel RGB', icon: '🎨', description: 'PSNR terpisah untuk kanal Red, Green, Blue' },
  { id: 'pixel_change', label: 'Distribusi Perubahan', icon: '📊', description: 'Statistik perubahan pixel antara original dan stego' },
  { id: 'histogram', label: 'Preservasi Histogram', icon: '📈', description: 'Seberapa baik distribusi pixel terjaga' },
];

export default function ComparisonTable({ lsbStandar, lsbCnn }: ComparisonTableProps) {
  const rows: RowData[] = [
    // Quality metrics
    { label: 'PSNR', unit: 'dB', standar: lsbStandar?.psnr_db ?? 0, cnn: lsbCnn?.psnr_db ?? 0, higherBetter: true, category: 'quality', description: 'Peak Signal-to-Noise Ratio — semakin tinggi semakin baik' },
    { label: 'SSIM', unit: '', standar: lsbStandar?.ssim ?? 0, cnn: lsbCnn?.ssim ?? 0, higherBetter: true, category: 'quality', description: 'Structural Similarity Index — mendekati 1 = mirip' },
    { label: 'MSE', unit: '', standar: lsbStandar?.mse ?? 0, cnn: lsbCnn?.mse ?? 0, higherBetter: false, category: 'quality', description: 'Mean Squared Error — semakin kecil semakin baik' },

    // Per-channel PSNR
    { label: 'PSNR Red', unit: 'dB', standar: lsbStandar?.psnr_r_db ?? 0, cnn: lsbCnn?.psnr_r_db ?? 0, higherBetter: true, category: 'per_channel', description: 'PSNR kanal merah' },
    { label: 'PSNR Green', unit: 'dB', standar: lsbStandar?.psnr_g_db ?? 0, cnn: lsbCnn?.psnr_g_db ?? 0, higherBetter: true, category: 'per_channel', description: 'PSNR kanal hijau' },
    { label: 'PSNR Blue', unit: 'dB', standar: lsbStandar?.psnr_b_db ?? 0, cnn: lsbCnn?.psnr_b_db ?? 0, higherBetter: true, category: 'per_channel', description: 'PSNR kanal biru' },

    // Pixel change stats
    { label: 'Pixel Berubah', unit: '', standar: lsbStandar?.changed_pixels ?? 0, cnn: lsbCnn?.changed_pixels ?? 0, higherBetter: false, category: 'pixel_change', description: 'Jumlah pixel yang dimodifikasi (lebih sedikit = lebih baik)' },
    { label: 'Rasio Perubahan', unit: '%', standar: ((lsbStandar?.change_ratio ?? 0) * 100), cnn: ((lsbCnn?.change_ratio ?? 0) * 100), higherBetter: false, category: 'pixel_change', description: 'Persentase pixel yang berubah' },
    { label: 'Max Perubahan', unit: '', standar: lsbStandar?.max_pixel_difference ?? 0, cnn: lsbCnn?.max_pixel_difference ?? 0, higherBetter: false, category: 'pixel_change', description: 'Perubahan pixel maksimum (0-255)' },
    { label: 'Mean Perubahan', unit: '', standar: lsbStandar?.mean_pixel_difference ?? 0, cnn: lsbCnn?.mean_pixel_difference ?? 0, higherBetter: false, category: 'pixel_change', description: 'Rata-rata perubahan per pixel' },

    // Histogram
    { label: 'Histogram Distance', unit: '', standar: lsbStandar?.histogram_distance ?? 0, cnn: lsbCnn?.histogram_distance ?? 0, higherBetter: false, category: 'histogram', description: 'Jarak chi-squared histogram (lebih kecil = lebih baik)' },
  ];

  const groupedRows = CATEGORIES.map((cat) => ({
    ...cat,
    rows: rows.filter((r) => r.category === cat.id),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(() => {
          const psnrDiff = (lsbCnn?.psnr_db ?? 0) - (lsbStandar?.psnr_db ?? 0);
          const ssimDiff = (lsbCnn?.ssim ?? 0) - (lsbStandar?.ssim ?? 0);
          const mseDiff = (lsbStandar?.mse ?? 0) - (lsbCnn?.mse ?? 0);
          const histDiff = (lsbStandar?.histogram_distance ?? 0) - (lsbCnn?.histogram_distance ?? 0);

          const items = [
            { label: 'PSNR Δ', value: `${psnrDiff >= 0 ? '+' : ''}${psnrDiff.toFixed(2)}`, unit: 'dB', better: psnrDiff > 0 },
            { label: 'SSIM Δ', value: `${ssimDiff >= 0 ? '+' : ''}${ssimDiff.toFixed(6)}`, unit: '', better: ssimDiff > 0 },
            { label: 'MSE Δ', value: `${mseDiff >= 0 ? '+' : ''}${mseDiff.toFixed(6)}`, unit: '', better: mseDiff > 0 },
            { label: 'Histogram Δ', value: `${histDiff >= 0 ? '+' : ''}${histDiff.toFixed(2)}`, unit: '', better: histDiff > 0 },
          ];

          return items.map((item) => (
            <div key={item.label} className="bg-dark-800/50 rounded-xl p-3 border border-dark-700">
              <p className="text-[10px] text-dark-500 uppercase tracking-wider">{item.label}</p>
              <p className={`text-lg font-bold font-mono ${item.better ? 'text-accent-cyan' : 'text-accent-pink'}`}>
                {item.value}
              </p>
              <p className="text-[10px] text-dark-500">{item.unit} {item.better ? '✓ lebih baik' : '✗ lebih rendah'}</p>
            </div>
          ));
        })()}
      </div>

      {/* Detailed tables by category */}
      {groupedRows.map((cat, catIdx) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: catIdx * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{cat.icon}</span>
            <div>
              <h4 className="text-sm font-semibold text-dark-200">{cat.label}</h4>
              <p className="text-[10px] text-dark-500">{cat.description}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-dark-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dark-700 bg-dark-800/50">
                  <th className="text-left py-2 px-3 text-dark-400 font-medium">Metrik</th>
                  <th className="text-center py-2 px-3 text-dark-400 font-medium">LSB Standar</th>
                  <th className="text-center py-2 px-3 text-dark-400 font-medium">LSB + CNN</th>
                  <th className="text-center py-2 px-3 text-dark-400 font-medium">Selisih</th>
                  <th className="text-center py-2 px-3 text-dark-400 font-medium">Pemenang</th>
                </tr>
              </thead>
              <tbody>
                {cat.rows.map((row, i) => {
                  const diff = row.cnn - row.standar;
                  const absDiff = Math.abs(diff);
                  const winner = winnerCell(row.standar, row.cnn, row.higherBetter);
                  const isBetter = row.higherBetter ? diff > 0 : diff < 0;

                  return (
                    <motion.tr
                      key={row.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors group"
                    >
                      <td className="py-2 px-3">
                        <span className="font-medium text-dark-200">{row.label}</span>
                        <span className="block text-[10px] text-dark-500 group-hover:text-dark-400 transition-colors">{row.description}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={winner === 'standar' ? 'text-accent-cyan font-semibold' : 'text-dark-300'}>
                          {row.standar < 1 && row.standar > 0 ? row.standar.toFixed(6) : row.standar.toFixed(2)}
                        </span>
                        {row.unit && <span className="text-dark-500 ml-0.5">{row.unit}</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={winner === 'cnn' ? 'text-accent-cyan font-semibold' : 'text-dark-300'}>
                          {row.cnn < 1 && row.cnn > 0 ? row.cnn.toFixed(6) : row.cnn.toFixed(2)}
                        </span>
                        {row.unit && <span className="text-dark-500 ml-0.5">{row.unit}</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={isBetter ? 'text-accent-cyan' : diff === 0 ? 'text-dark-400' : 'text-accent-pink'}>
                          {diff >= 0 ? '+' : ''}{absDiff < 1 ? absDiff.toFixed(6) : absDiff.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {winner === 'tie' ? (
                          <span className="text-dark-500">—</span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            winner === 'cnn'
                              ? 'bg-accent-cyan/10 text-accent-cyan'
                              : 'bg-accent-blue/10 text-accent-blue'
                          }`}>
                            {winner === 'cnn' ? 'CNN' : 'Standar'}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
