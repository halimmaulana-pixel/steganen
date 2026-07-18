'use client';

import { motion } from 'framer-motion';
import TheoreticalExplain from './TheoreticalExplain';
import type { AnalyzeData } from '@/lib/types';

interface PixelAnalysisProps {
  data: AnalyzeData['pixel_analysis'];
  originalUrl?: string;
}

export default function PixelAnalysis({ data, originalUrl }: PixelAnalysisProps) {
  const regionStats = [
    {
      label: 'Area Tekstur',
      description: 'Koefisien > 0.5',
      percentage: data.texture_ratio * 100,
      selected: data.selected_pixels_texture,
      color: 'bg-accent-cyan',
      bgColor: 'bg-accent-cyan/10',
    },
    {
      label: 'Area Halus',
      description: 'Koefisien ≤ 0.5',
      percentage: data.smooth_ratio * 100,
      selected: data.selected_pixels_smooth,
      color: 'bg-accent-purple',
      bgColor: 'bg-accent-purple/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Statistik Pixel</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-dark-800/50">
              <span className="text-xs text-dark-400">Total Pixel Terpilih</span>
              <span className="text-sm font-medium text-dark-200">{data.total_selected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dark-800/50">
              <span className="text-xs text-dark-400">Dari Area Tekstur</span>
              <span className="text-sm font-medium text-accent-cyan">{data.selected_pixels_texture.toLocaleString()} ({data.texture_selection_percent}%)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dark-800/50">
              <span className="text-xs text-dark-400">Dari Area Halus</span>
              <span className="text-sm font-medium text-accent-purple">{data.selected_pixels_smooth.toLocaleString()} ({(100 - data.texture_selection_percent).toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-dark-300">Distribusi Area</h3>
            </div>
            <div className="space-y-4">
              {regionStats.map((region, i) => (
                <motion.div
                  key={region.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-dark-200">{region.label}</span>
                      <span className="text-xs text-dark-500 ml-2">{region.description}</span>
                    </div>
                    <span className="text-sm font-medium text-dark-100">
                      {region.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${region.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                      className={`h-full ${region.color} rounded-full`}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-dark-500">
                      {region.selected.toLocaleString()} pixel terpilih
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {originalUrl && (
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-4">
              <p className="text-xs text-dark-400 mb-2">Citra Original</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original"
                className="w-full h-auto rounded-lg border border-dark-700"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheoreticalExplain
          title="Why CNN Selects Texture Areas"
          explanation="Area tekstur memiliki variasi intensitas tinggi dan pola frekuensi kompleks. Modifikasi piksel di area ini lebih sulit dideteksi oleh mata manusia karena sudah ada variasi alami. CNN dilatih untuk mengenali pola tekstur menggunakan filter konvolusi yang mendeteksi gradien, tepi, dan pola periodik. Hasilnya, area tekstur mendapat skor lebih tinggi untuk penyisipan steganografi."
          formula="Texture Score = Σ|∇I(x,y)|² untuk setiap blok"
          reference="Skripsi — Bab III: Seleksi Koefisien CNN"
          icon="lightbulb"
        />
        <TheoreticalExplain
          title="Edge vs Smooth Regions"
          explanation="Area smooth (datar) sangat sensitif terhadap noise karena tidak ada variasi alami untuk menutupi perubahan. Oleh karena itu, CNN memberikan skor lebih rendah pada area ini untuk menjaga imperceptibility. Threshold yang tepat memastikan hanya area tekstur yang dipilih untuk penyisipan."
          formula="Smoothness = 1 / (1 + σ²(I_block))"
          reference="Fridrich & Kodovsky, 2007 — Rich Models for Steganalysis"
          icon="formula"
        />
      </div>
    </motion.div>
  );
}
