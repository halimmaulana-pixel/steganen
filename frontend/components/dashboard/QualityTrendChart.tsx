'use client';

import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import type { HistoryEntry } from '@/lib/api';

Chart.register(...registerables);

interface QualityTrendChartProps {
  data: HistoryEntry[];
}

export default function QualityTrendChart({ data }: QualityTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const valid = data
      .filter(e => e.psnr_db != null && e.ssim != null)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (valid.length === 0) return;

    const labels = valid.map(e => {
      const d = new Date(e.created_at);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'PSNR (dB)',
            data: valid.map(e => e.psnr_db!),
            borderColor: '#06d6a0',
            backgroundColor: 'rgba(6, 214, 160, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y',
          },
          {
            label: 'SSIM',
            data: valid.map(e => e.ssim!),
            borderColor: '#8338ec',
            backgroundColor: 'rgba(131, 56, 236, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#a3a3a3', font: { size: 12 } },
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#e5e5e5',
            bodyColor: '#a3a3a3',
            borderColor: '#262626',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            ticks: { color: '#737373', font: { size: 11 } },
            grid: { color: '#1a1a1a' },
          },
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'PSNR (dB)', color: '#06d6a0' },
            ticks: { color: '#06d6a0', font: { size: 11 } },
            grid: { color: '#1a1a1a' },
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'SSIM', color: '#8338ec' },
            ticks: { color: '#8338ec', font: { size: 11 } },
            grid: { drawOnChartArea: false },
            min: 0,
            max: 1,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
        <h3 className="text-sm font-medium text-dark-400 mb-4">Tren Kualitas</h3>
        <div className="h-72 flex flex-col items-center justify-center gap-3 text-dark-500">
          <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-sm">Belum ada data kualitas</p>
          <p className="text-xs">Mulai dengan melakukan embed atau extract</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
      <h3 className="text-sm font-medium text-dark-400 mb-4">Tren Kualitas</h3>
      <div className="h-72">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
