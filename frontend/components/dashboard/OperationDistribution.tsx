'use client';

import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import type { HistoryEntry } from '@/lib/api';

Chart.register(...registerables);

interface OperationDistributionProps {
  data: HistoryEntry[];
}

const COLORS: Record<string, string> = {
  embed: '#06d6a0',
  extract: '#8338ec',
  evaluate: '#3a86ff',
  analyze: '#fb5607',
};

const LABELS: Record<string, string> = {
  embed: 'Embed',
  extract: 'Extract',
  evaluate: 'Evaluate',
  analyze: 'Analyze',
};

export default function OperationDistribution({ data }: OperationDistributionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const counts: Record<string, number> = {};
    data.forEach(e => { counts[e.process_type] = (counts[e.process_type] || 0) + 1; });
    const types = Object.keys(counts);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: types.map(t => LABELS[t] || t),
        datasets: [{
          data: types.map(t => counts[t]),
          backgroundColor: types.map(t => COLORS[t] || '#737373'),
          borderColor: '#0a0a0a',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#a3a3a3', font: { size: 12 }, padding: 16 },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
        <h3 className="text-sm font-medium text-dark-400 mb-4">Distribusi Operasi</h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-dark-500">Belum ada data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
      <h3 className="text-sm font-medium text-dark-400 mb-4">Distribusi Operasi</h3>
      <div className="h-48">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
