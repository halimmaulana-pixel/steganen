'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import type { Metrics } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

interface ComparisonChartProps {
  lsbStandar: Metrics;
  lsbCnn: Metrics;
}

const chartFont = { family: 'Inter, sans-serif', size: 11 };

export default function ComparisonChart({ lsbStandar, lsbCnn }: ComparisonChartProps) {
  // Per-channel PSNR data
  const perChannelData = {
    labels: ['Red', 'Green', 'Blue', 'Overall'],
    datasets: [
      {
        label: 'LSB Standar',
        data: [
          lsbStandar?.psnr_r_db ?? 0,
          lsbStandar?.psnr_g_db ?? 0,
          lsbStandar?.psnr_b_db ?? 0,
          lsbStandar?.psnr_db ?? 0,
        ],
        backgroundColor: 'rgba(58, 134, 255, 0.8)',
        borderColor: 'rgba(58, 134, 255, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: 'LSB + CNN',
        data: [
          lsbCnn?.psnr_r_db ?? 0,
          lsbCnn?.psnr_g_db ?? 0,
          lsbCnn?.psnr_b_db ?? 0,
          lsbCnn?.psnr_db ?? 0,
        ],
        backgroundColor: 'rgba(6, 214, 160, 0.8)',
        borderColor: 'rgba(6, 214, 160, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  // Radar chart data for overall comparison
  const radarMax = {
    psnr: Math.max(lsbStandar?.psnr_db ?? 0, lsbCnn?.psnr_db ?? 0, 1),
    ssim: 1,
    mse_inv: 1,
    hist_inv: Math.max(lsbStandar?.histogram_distance ?? 1, lsbCnn?.histogram_distance ?? 1, 1),
    change_inv: 1,
  };

  const radarData = {
    labels: ['PSNR', 'SSIM', 'MSE (inv)', 'Histogram (inv)', 'Pixel Change (inv)'],
    datasets: [
      {
        label: 'LSB Standar',
        data: [
          ((lsbStandar?.psnr_db ?? 0) / radarMax.psnr) * 100,
          ((lsbStandar?.ssim ?? 0) / radarMax.ssim) * 100,
          radarMax.mse_inv > 0 ? (1 - (lsbStandar?.mse ?? 0) / radarMax.mse_inv) * 100 : 50,
          radarMax.hist_inv > 0 ? (1 - (lsbStandar?.histogram_distance ?? 0) / radarMax.hist_inv) * 100 : 50,
          radarMax.change_inv > 0 ? (1 - (lsbStandar?.change_ratio ?? 0) / radarMax.change_inv) * 100 : 50,
        ],
        backgroundColor: 'rgba(58, 134, 255, 0.15)',
        borderColor: 'rgba(58, 134, 255, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(58, 134, 255, 1)',
        pointRadius: 4,
      },
      {
        label: 'LSB + CNN',
        data: [
          ((lsbCnn?.psnr_db ?? 0) / radarMax.psnr) * 100,
          ((lsbCnn?.ssim ?? 0) / radarMax.ssim) * 100,
          radarMax.mse_inv > 0 ? (1 - (lsbCnn?.mse ?? 0) / radarMax.mse_inv) * 100 : 50,
          radarMax.hist_inv > 0 ? (1 - (lsbCnn?.histogram_distance ?? 0) / radarMax.hist_inv) * 100 : 50,
          radarMax.change_inv > 0 ? (1 - (lsbCnn?.change_ratio ?? 0) / radarMax.change_inv) * 100 : 50,
        ],
        backgroundColor: 'rgba(6, 214, 160, 0.15)',
        borderColor: 'rgba(6, 214, 160, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(6, 214, 160, 1)',
        pointRadius: 4,
      },
    ],
  };

  const perChannelOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#a4a4a4', font: chartFont, padding: 12, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#e5e5e5',
        bodyColor: '#a4a4a4',
        borderColor: '#262626',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(2)} dB`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#a4a4a4', font: chartFont },
        grid: { color: 'rgba(38, 38, 38, 0.5)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#a4a4a4', font: chartFont },
        grid: { color: 'rgba(38, 38, 38, 0.5)' },
        title: { display: true, text: 'PSNR (dB)', color: '#737373', font: chartFont },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#a4a4a4', font: chartFont, padding: 12, usePointStyle: true },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(38, 38, 38, 0.6)' },
        pointLabels: { color: '#a4a4a4', font: chartFont },
        angleLines: { color: 'rgba(38, 38, 38, 0.4)' },
      },
    },
  };

  // Difference bar chart
  const psnrDiff = (lsbCnn?.psnr_db ?? 0) - (lsbStandar?.psnr_db ?? 0);
  const ssimDiff = (lsbCnn?.ssim ?? 0) - (lsbStandar?.ssim ?? 0);
  const mseDiff = (lsbStandar?.mse ?? 0) - (lsbCnn?.mse ?? 0);
  const histDiff = (lsbStandar?.histogram_distance ?? 0) - (lsbCnn?.histogram_distance ?? 0);

  const diffData = {
    labels: ['PSNR (dB)', 'SSIM (×100)', 'MSE (inv)', 'Histogram (inv)'],
    datasets: [
      {
        label: 'Selisih (CNN - Standar)',
        data: [psnrDiff, ssimDiff * 100, mseDiff, histDiff],
        backgroundColor: [psnrDiff >= 0, ssimDiff >= 0, mseDiff >= 0, histDiff >= 0].map((better) =>
          better ? 'rgba(6, 214, 160, 0.8)' : 'rgba(255, 0, 110, 0.8)'
        ),
        borderColor: [psnrDiff >= 0, ssimDiff >= 0, mseDiff >= 0, histDiff >= 0].map((better) =>
          better ? 'rgba(6, 214, 160, 1)' : 'rgba(255, 0, 110, 1)'
        ),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const diffOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#e5e5e5',
        bodyColor: '#a4a4a4',
        borderColor: '#262626',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            const val = ctx.parsed.x ?? 0;
            return `${val >= 0 ? '✓ CNN lebih baik' : '✗ Standar lebih baik'}: ${val >= 0 ? '+' : ''}${val.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#a4a4a4', font: chartFont },
        grid: { color: 'rgba(38, 38, 38, 0.5)' },
      },
      y: {
        ticks: { color: '#a4a4a4', font: chartFont },
        grid: { display: false },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Per-channel PSNR */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-dark-300 mb-1">PSNR per Channel RGB</h3>
        <p className="text-[10px] text-dark-500 mb-4">Perbandingan kualitas per kanal warna</p>
        <div className="h-[250px]">
          <Bar data={perChannelData} options={perChannelOptions} />
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-dark-300 mb-1">Overall Quality Radar</h3>
        <p className="text-[10px] text-dark-500 mb-4">Perbandingan multi-dimensi (semakin luas = semakin baik)</p>
        <div className="h-[300px] flex justify-center">
          <div className="w-full max-w-[400px]">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>

      {/* Difference chart */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-dark-300 mb-1">Selisih Metrik (CNN − Standar)</h3>
        <p className="text-[10px] text-dark-500 mb-4"> positif = CNN lebih baik, negatif = Standar lebih baik</p>
        <div className="h-[200px]">
          <Bar data={diffData} options={diffOptions} />
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-dark-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-cyan" /> CNN lebih baik
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-pink" /> Standar lebih baik
          </span>
        </div>
      </div>

      {/* Key insights */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-dark-300 mb-3">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightCard
            title="Imperceptibility"
            standar={lsbStandar?.psnr_db ?? 0}
            cnn={lsbCnn?.psnr_db ?? 0}
            unit="dB"
            higherBetter
          />
          <InsightCard
            title="Structural Similarity"
            standar={lsbStandar?.ssim ?? 0}
            cnn={lsbCnn?.ssim ?? 0}
            unit=""
            higherBetter
          />
          <InsightCard
            title="Pixel Distortion"
            standar={lsbStandar?.mean_pixel_difference ?? 0}
            cnn={lsbCnn?.mean_pixel_difference ?? 0}
            unit=""
            higherBetter={false}
          />
          <InsightCard
            title="Histogram Preservation"
            standar={lsbStandar?.histogram_distance ?? 0}
            cnn={lsbCnn?.histogram_distance ?? 0}
            unit=""
            higherBetter={false}
          />
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({
  title,
  standar,
  cnn,
  unit,
  higherBetter,
}: {
  title: string;
  standar: number;
  cnn: number;
  unit: string;
  higherBetter: boolean;
}) {
  const diff = cnn - standar;
  const isBetter = higherBetter ? diff > 0 : diff < 0;
  const pct = standar !== 0 ? Math.abs(diff / standar) * 100 : 0;

  return (
    <div className={`p-3 rounded-lg border ${
      isBetter ? 'bg-accent-cyan/5 border-accent-cyan/20' : 'bg-dark-800/50 border-dark-700'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-dark-400">{title}</span>
        {isBetter && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-medium">
            CNN unggul
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-sm font-bold font-mono ${isBetter ? 'text-accent-cyan' : 'text-dark-300'}`}>
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
    </div>
  );
}
