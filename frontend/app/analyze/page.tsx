'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ThresholdSweep from '@/components/analyze/ThresholdSweep';
import CoefficientDist from '@/components/analyze/CoefficientDist';
import PixelAnalysis from '@/components/analyze/PixelAnalysis';
import ExportReport from '@/components/analyze/ExportReport';
import type { AnalyzeData, AnalyzeTabId, Metrics } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AnalyzePage() {
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [threshold, setThreshold] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalyzeData | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeTab, setActiveTab] = useState<AnalyzeTabId>('threshold');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const tabs: { id: AnalyzeTabId; label: string; icon: JSX.Element }[] = [
    {
      id: 'threshold',
      label: 'Threshold Sweep',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'coefficients',
      label: 'Coefficient Dist',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      id: 'pixels',
      label: 'Pixel Analysis',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      id: 'export',
      label: 'Export',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  }, []);

  const handleSubmit = async () => {
    if (!image || !message.trim()) {
      setError('Upload gambar dan masukkan pesan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

      const coverImage = await toBase64(image);

      const response = await axios.post<{
        success: boolean;
        data: AnalyzeResponse;
      }>(`${API}/api/v1/analyze`, {
        cover_image: coverImage,
        threshold_percent: threshold,
      });

      setResult(response.data.data);
      setMetrics(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Analyze</span>
        </h1>
        <p className="text-dark-400 mt-2">Analisis mendalam steganografi dengan penjelasan teoritis</p>
      </motion.div>

      {/* Input Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-6"
      >
        <h2 className="text-lg font-semibold text-dark-100">Input</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center hover:border-dark-500 transition-colors cursor-pointer"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <>
                <div className="text-dark-500 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-dark-400">Drag & drop gambar atau klik untuk upload</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-input-analyze"
            />
            <label
              htmlFor="file-input-analyze"
              className="mt-4 inline-block px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm rounded-lg cursor-pointer transition-colors"
            >
              Pilih File
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-2">Pesan Rahasia</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Masukkan pesan rahasia..."
                className="w-full h-32 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-accent-cyan resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-dark-400 mb-2">
                Threshold: <span className="text-dark-100 font-medium">{threshold}%</span>
              </label>
              <input
                type="range"
                min={5}
                max={95}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-accent-cyan"
              />
              <div className="flex justify-between text-xs text-dark-500 mt-1">
                <span>5%</span>
                <span>95%</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-dark-50 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menganalisis...
                </span>
              ) : (
                'Analisis'
              )}
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </motion.section>

      {/* Analysis Tabs */}
      <AnimatePresence>
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-dark-800 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'text-accent-purple border-b-2 border-accent-purple bg-dark-900'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              {activeTab === 'threshold' && (
                <ThresholdSweep data={result.threshold_sweep} />
              )}

              {activeTab === 'coefficients' && (
                <CoefficientDist
                  data={result.coefficient_stats}
                  threshold={threshold}
                />
              )}

              {activeTab === 'pixels' && (
                <PixelAnalysis
                  data={result.pixel_analysis}
                  originalUrl={previewUrl || undefined}
                />
              )}

              {activeTab === 'export' && (
                <ExportReport
                  analyzeData={result}
                  metrics={metrics}
                  threshold={threshold}
                  imageName={image?.name || 'unknown'}
                />
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
