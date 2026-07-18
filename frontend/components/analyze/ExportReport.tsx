'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { AnalyzeData, Metrics } from '@/lib/types';

interface ExportReportProps {
  analyzeData: AnalyzeData | null;
  metrics: Metrics | null;
  threshold: number;
  imageName: string;
}

export default function ExportReport({
  analyzeData,
  metrics,
  threshold,
  imageName,
}: ExportReportProps) {
  const generateCSV = useCallback(() => {
    if (!analyzeData) return '';

    const lines: string[] = [];
    lines.push('=== STEGONET ANALYSIS REPORT ===');
    lines.push('');
    lines.push('--- Threshold Sweep ---');
    lines.push('Threshold (%),Selected Pixels,Selection Ratio,Texture %');
    analyzeData.threshold_sweep.forEach((s) => {
      lines.push(
        `${s.threshold},${s.selected_pixels},${s.selection_ratio},${s.texture_percent}`
      );
    });
    lines.push('');
    lines.push('--- Coefficient Statistics ---');
    lines.push('Statistic,Value');
    lines.push(`Min,${analyzeData.coefficient_stats.min.toFixed(4)}`);
    lines.push(`Max,${analyzeData.coefficient_stats.max.toFixed(4)}`);
    lines.push(`Mean,${analyzeData.coefficient_stats.mean.toFixed(4)}`);
    lines.push(`Std Dev,${analyzeData.coefficient_stats.std.toFixed(4)}`);
    lines.push(`Median,${analyzeData.coefficient_stats.median.toFixed(4)}`);
    lines.push(`Skewness,${analyzeData.coefficient_stats.skewness.toFixed(4)}`);
    lines.push(`Kurtosis,${analyzeData.coefficient_stats.kurtosis.toFixed(4)}`);
    lines.push(`Entropy,${analyzeData.coefficient_stats.entropy.toFixed(4)}`);
    lines.push('');
    lines.push('--- Pixel Analysis ---');
    lines.push('Metric,Value');
    lines.push(`Texture Ratio,${analyzeData.pixel_analysis.texture_ratio}`);
    lines.push(`Smooth Ratio,${analyzeData.pixel_analysis.smooth_ratio}`);
    lines.push(`Total Selected,${analyzeData.pixel_analysis.total_selected}`);
    lines.push(`Texture Selection %,${analyzeData.pixel_analysis.texture_selection_percent}%`);
    lines.push('');
    lines.push('--- Explanations ---');
    lines.push(`Coefficient Distribution,${analyzeData.explanations.coefficient_distribution}`);
    lines.push(`Pixel Selection,${analyzeData.explanations.pixel_selection}`);
    lines.push(`Threshold Methodology,${analyzeData.explanations.threshold_methodology}`);
    lines.push('');
    lines.push('--- Embedding Metrics ---');
    if (metrics) {
      lines.push(`PSNR,${metrics.psnr_db.toFixed(2)} dB`);
      lines.push(`SSIM,${metrics.ssim.toFixed(6)}`);
      lines.push(`MSE,${metrics.mse.toFixed(8)}`);
    }

    return lines.join('\n');
  }, [analyzeData, metrics]);

  const handleExportCSV = useCallback(() => {
    const csv = generateCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stegonet_analysis_${imageName.replace(/\.[^.]+$/, '')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [generateCSV, imageName]);

  const handleExportJSON = useCallback(() => {
    if (!analyzeData) return;
    const json = JSON.stringify(
      {
        metadata: {
          image: imageName,
          threshold,
          generated_at: new Date().toISOString(),
          tool: 'StegoNet v1.0',
        },
        metrics,
        analysis: analyzeData,
      },
      null,
      2
    );
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stegonet_analysis_${imageName.replace(/\.[^.]+$/, '')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [analyzeData, metrics, imageName, threshold]);

  const handleExportPDF = useCallback(() => {
    if (!analyzeData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const thresholdData = analyzeData.threshold_sweep;
    const coeffStats = analyzeData.coefficient_stats;
    const pixelAnalysis = analyzeData.pixel_analysis;
    const explanations = analyzeData.explanations;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>StegoNet Analysis Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
    h1 { color: #0a0a0a; border-bottom: 2px solid #06d6a0; padding-bottom: 8px; }
    h2 { color: #434343; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #f5f5f5; }
    .highlight { background: #e6fff8; font-weight: bold; }
    .metric { display: inline-block; background: #f0f0f0; border-radius: 6px; padding: 8px 12px; margin: 4px; }
    .metric-label { font-size: 11px; color: #666; }
    .metric-value { font-size: 16px; font-weight: bold; }
    .section { margin: 20px 0; padding: 16px; background: #fafafa; border-radius: 8px; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #eee; font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <h1>StegoNet Analysis Report</h1>
  <p><strong>Image:</strong> ${imageName} | <strong>Threshold:</strong> ${threshold}% | <strong>Generated:</strong> ${new Date().toLocaleString('id-ID')}</p>

  ${metrics ? `
  <div class="section">
    <h2>Embedding Metrics</h2>
    <div class="metric">
      <div class="metric-label">PSNR</div>
      <div class="metric-value">${metrics.psnr_db.toFixed(2)} dB</div>
    </div>
    <div class="metric">
      <div class="metric-label">SSIM</div>
      <div class="metric-value">${metrics.ssim.toFixed(4)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">MSE</div>
      <div class="metric-value">${metrics.mse.toFixed(6)}</div>
    </div>
  </div>` : ''}

  <div class="section">
    <h2>Threshold Sweep</h2>
    <table>
      <tr><th>Threshold (%)</th><th>Selected Pixels</th><th>Selection Ratio</th><th>Texture %</th></tr>
      ${thresholdData.map((s) =>
        `<tr>
          <td>${s.threshold}%</td>
          <td>${s.selected_pixels.toLocaleString()}</td>
          <td>${(s.selection_ratio * 100).toFixed(1)}%</td>
          <td>${s.texture_percent.toFixed(1)}%</td>
        </tr>`
      ).join('')}
    </table>
  </div>

  <div class="section">
    <h2>Coefficient Statistics</h2>
    <table>
      <tr><th>Statistic</th><th>Value</th></tr>
      <tr><td>Min</td><td>${coeffStats.min.toFixed(4)}</td></tr>
      <tr><td>Max</td><td>${coeffStats.max.toFixed(4)}</td></tr>
      <tr><td>Mean</td><td>${coeffStats.mean.toFixed(4)}</td></tr>
      <tr><td>Std Dev</td><td>${coeffStats.std.toFixed(4)}</td></tr>
      <tr><td>Median</td><td>${coeffStats.median.toFixed(4)}</td></tr>
      <tr><td>Skewness</td><td>${coeffStats.skewness.toFixed(4)}</td></tr>
      <tr><td>Kurtosis</td><td>${coeffStats.kurtosis.toFixed(4)}</td></tr>
      <tr><td>Entropy</td><td>${coeffStats.entropy.toFixed(4)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Pixel Analysis</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Texture Ratio</td><td>${(pixelAnalysis.texture_ratio * 100).toFixed(1)}%</td></tr>
      <tr><td>Smooth Ratio</td><td>${(pixelAnalysis.smooth_ratio * 100).toFixed(1)}%</td></tr>
      <tr><td>Total Selected</td><td>${pixelAnalysis.total_selected.toLocaleString()}</td></tr>
      <tr><td>Texture Selection %</td><td>${pixelAnalysis.texture_selection_percent}%</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Theoretical Explanations</h2>
    <p><strong>Coefficient Distribution:</strong> ${explanations.coefficient_distribution}</p>
    <p><strong>Pixel Selection:</strong> ${explanations.pixel_selection}</p>
    <p><strong>Threshold Methodology:</strong> ${explanations.threshold_methodology}</p>
  </div>

  <div class="footer">
    Generated by StegoNet v1.0 — LSB Steganography with CNN-based Coefficient Selection
  </div>
</body>
</html>
`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }, [analyzeData, imageName, threshold]);

  const exportButtons = [
    {
      label: 'Export CSV',
      description: 'Data mentah dalam format comma-separated',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: handleExportCSV,
      color: 'hover:border-accent-blue hover:bg-accent-blue/5',
    },
    {
      label: 'Export PDF',
      description: 'Laporan terformat dengan grafik',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      ),
      onClick: handleExportPDF,
      color: 'hover:border-accent-pink hover:bg-accent-pink/5',
    },
    {
      label: 'Export JSON',
      description: 'Metadata + hasil analisis lengkap',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      onClick: handleExportJSON,
      color: 'hover:border-accent-cyan hover:bg-accent-cyan/5',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-sm font-medium text-dark-300">Export Hasil Analisis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportButtons.map((btn, i) => (
          <motion.button
            key={btn.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={btn.onClick}
            disabled={!analyzeData}
            className={`bg-dark-900 border border-dark-800 rounded-xl p-5 text-left transition-all ${btn.color} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-accent-cyan mb-3">{btn.icon}</div>
            <p className="text-sm font-medium text-dark-100 mb-1">{btn.label}</p>
            <p className="text-xs text-dark-500">{btn.description}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
