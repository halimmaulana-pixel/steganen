'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import TheoreticalExplain from './TheoreticalExplain';
import type { AnalyzeData } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface CoefficientDistProps {
  data: AnalyzeData['coefficient_stats'];
  threshold: number;
}

export default function CoefficientDist({ data, threshold }: CoefficientDistProps) {
  const stats = [
    { label: 'Min', value: data.min.toFixed(4) },
    { label: 'Max', value: data.max.toFixed(4) },
    { label: 'Mean', value: data.mean.toFixed(4) },
    { label: 'Std Dev', value: data.std.toFixed(4) },
    { label: 'Median', value: data.median.toFixed(4) },
    { label: 'Skewness', value: data.skewness.toFixed(4) },
    { label: 'Kurtosis', value: data.kurtosis.toFixed(4) },
    { label: 'Entropy', value: data.entropy.toFixed(4) },
  ];

  const pieData = {
    labels: ['Tekstur (>0.5)', 'Halus (≤0.5)'],
    datasets: [
      {
        data: [
          Math.round((data.mean > 0.5 ? data.mean : 1 - data.mean) * 100),
          Math.round((data.mean > 0.5 ? 1 - data.mean : data.mean) * 100),
        ],
        backgroundColor: ['rgba(6, 214, 160, 0.8)', 'rgba(60, 60, 60, 0.6)'],
        borderColor: ['rgba(6, 214, 160, 1)', 'rgba(80, 80, 80, 0.8)'],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#a4a4a4', font: { family: 'Inter', size: 11 }, padding: 12 },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-dark-300 mb-4">Statistik Koefisien CNN</h3>
          <div className="space-y-2">
            {stats.map((s) => (
              <div key={s.label} className="flex justify-between items-center py-1 border-b border-dark-800/50">
                <span className="text-xs text-dark-400">{s.label}</span>
                <span className="text-xs font-medium text-dark-200 font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-dark-300">Distribusi Area</h3>
          <div className="h-[200px]">
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-400">Rata-rata koefisien: <span className="text-accent-cyan font-medium">{data.mean.toFixed(4)}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheoreticalExplain
          title="CNN Texture Detection"
          explanation="Convolutional Neural Network menganalisis tekstur lokal pada setiap area citra. Area dengan pola tekstur tinggi (gradien kuat, variasi intensitas) menghasilkan koefisien CNN yang lebih besar. CNN dilatih untuk mengidentifikasi area yang aman untuk penyisipan — koefisien besar lebih tahan terhadap modifikasi karena perubahan kecil sulit dideteksi secara visual."
          formula="Feature Map = ReLU(Conv2D(input, filters))"
          reference="Skripsi — Bab II: Arsitektur CNN"
          icon="lightbulb"
        />
        <TheoreticalExplain
          title="Coefficient Distribution Properties"
          explanation="Distribusi koefisien CNN menunjukkan bagaimana model memahami struktur citra. Mean tinggi menunjukkan banyak area tekstur terdeteksi. Std tinggi menunjukkan variasi besar antar area. Skewness menunjukkan kemiringan distribusi. Entropy menunjukkan keragaman informasi — semakin tinggi, semakin kompleks citra."
          formula="Entropy = -Σ p(x) × log₂(p(x))"
          reference="Shannon, 1948 — Information Theory"
          icon="formula"
        />
      </div>
    </motion.div>
  );
}
