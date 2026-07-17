'use client';

import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import TheoreticalExplain from './TheoreticalExplain';
import type { AnalyzeResponse } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ThresholdSweepProps {
  data: AnalyzeResponse['threshold_sweep'];
}

export default function ThresholdSweep({ data }: ThresholdSweepProps) {
  const chartData = useMemo(() => ({
    labels: data.map((d) => `${d.threshold}%`),
    datasets: [
      {
        label: 'Selected Pixels',
        data: data.map((d) => d.selected_pixels),
        borderColor: 'rgba(58, 134, 255, 1)',
        backgroundColor: 'rgba(58, 134, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Texture %',
        data: data.map((d) => d.texture_percent),
        borderColor: 'rgba(6, 214, 160, 1)',
        backgroundColor: 'rgba(6, 214, 160, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#a4a4a4',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#e5e5e5',
        bodyColor: '#a4a4a4',
        borderColor: '#262626',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Threshold (%)', color: '#737373', font: { family: 'Inter' } },
        ticks: { color: '#a4a4a4', font: { family: 'Inter', size: 10 }, maxRotation: 45 },
        grid: { color: 'rgba(38, 38, 38, 0.5)' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Selected Pixels', color: '#3a86ff', font: { family: 'Inter' } },
        ticks: { color: '#3a86ff', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(38, 38, 38, 0.3)' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Texture %', color: '#06d6a0', font: { family: 'Inter' } },
        ticks: { color: '#06d6a0', font: { family: 'Inter', size: 11 } },
        grid: { drawOnChartArea: false },
      },
    },
  }), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-dark-300">Threshold vs Selected Pixels & Texture %</h3>
          <div className="flex items-center gap-4 text-xs text-dark-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-blue" />
              Selected Pixels
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-cyan" />
              Texture %
            </span>
          </div>
        </div>
        <div className="h-[350px]">
          <Line data={chartData} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheoreticalExplain
          title="Optimal Threshold Range"
          explanation="Threshold menentukan berapa banyak pixel yang dipilih berdasarkan koefisien CNN. Threshold rendah (5-15%) memilih hanya area dengan koefisien tertinggi — aman secara visual tetapi kapasitas terbatas. Threshold tinggi (60-95%) memilih lebih banyak pixel — meningkatkan kapasitas tetapi menurunkan kualitas. Range optimal biasanya 20-40% karena memberikan keseimbangan terbaik."
          formula="Selection: coefficient >= Threshold(T)"
          reference="Skripsi — Bab III: Analisis Threshold"
          icon="lightbulb"
        />
        <TheoreticalExplain
          title="Texture Selection Behavior"
          explanation="CNN MobileNetV2 mendeteksi area tekstur dengan skor koefisien tinggi. Pada threshold rendah, hampir semua pixel terpilih berasal dari area tekstur. Saat threshold naik, lebih banyak area smooth ikut terpilih — ini menurunkan imperceptibility karena modifikasi pada area datar lebih mudah terdeteksi secara visual."
          formula="Texture% = pixels_in_texture / total_selected × 100"
          reference="Skripsi — Bab III: Analisis Koefisien"
          icon="lightbulb"
        />
      </div>
    </motion.div>
  );
}
