'use client';

import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import type { HistoryEntry } from '@/lib/api';

Chart.register(...registerables);

interface ThresholdQualityScatterProps {
  data: HistoryEntry[];
}

export default function ThresholdQualityScatter({ data }: ThresholdQualityScatterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    if (chartRef.current) chartRef.current.destroy();

    const embeds = data
      .filter(e => e.process_type === 'embed' && e.psnr_db != null && e.threshold_percent != null)
      .sort((a, b) => a.threshold_percent - b.threshold_percent);

    if (embeds.length === 0) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Threshold vs PSNR',
          data: embeds.map(e => ({
            x: e.threshold_percent,
            y: e.psnr_db!,
            r: Math.max((e.ssim ?? 0.5) * 12, 3),
          })),
          backgroundColor: 'rgba(6, 214, 160, 0.5)',
          borderColor: '#06d6a0',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#e5e5e5',
            bodyColor: '#a3a3a3',
            borderColor: '#262626',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => {
                const raw = ctx.raw as any;
                return `Threshold: ${raw.x}% | PSNR: ${raw.y?.toFixed(1)} dB | SSIM: ~${(raw.r / 12).toFixed(3)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Threshold (%)', color: '#737373' },
            ticks: { color: '#737373' },
            grid: { color: '#1a1a1a' },
          },
          y: {
            title: { display: true, text: 'PSNR (dB)', color: '#737373' },
            ticks: { color: '#737373' },
            grid: { color: '#1a1a1a' },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data]);

  if (data.filter(e => e.process_type === 'embed').length === 0) {
    return (
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
        <h3 className="text-sm font-medium text-dark-400 mb-4">Threshold vs Kualitas</h3>
        <div className="h-72 flex flex-col items-center justify-center gap-3 text-dark-500">
          <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p className="text-sm">Belum ada data embed</p>
          <p className="text-xs">Lakukan embed untuk melihat hubungan threshold dan kualitas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
      <h3 className="text-sm font-medium text-dark-400 mb-4">Threshold vs Kualitas</h3>
      <div className="h-72">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
