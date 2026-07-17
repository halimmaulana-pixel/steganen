'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SideBySideView from '@/components/evaluate/SideBySideView';
import ComparisonTable from '@/components/evaluate/ComparisonTable';
import ComparisonChart from '@/components/evaluate/ComparisonChart';
import AdvantageCard from '@/components/evaluate/AdvantageCard';
import type { ComparisonData } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ComparePage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [secretMessage, setSecretMessage] = useState('');
  const [threshold, setThreshold] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonData | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  }, []);

  const handleCompare = async () => {
    if (!image || !secretMessage.trim()) {
      setError('Upload gambar dan masukkan pesan rahasia');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const coverImage = await toBase64(image);
      const response = await axios.post<{
        success: boolean;
        data: ComparisonData;
      }>(`${API}/api/v1/evaluate`, {
        cover_image: coverImage,
        secret_message: secretMessage,
        threshold_percent: threshold,
      });
      setResult(response.data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membandingkan';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ─── Section 1: Hero ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Perbandingan Metode</span>
          </h1>
          <p className="text-dark-400 text-sm max-w-2xl mx-auto">
            LSB Standar vs LSB+CNN — Analisis kualitas dan keamanan steganografi pada citra digital
          </p>
        </motion.div>

        {/* ─── Section 2: Upload & Compare ──────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-6"
        >
          <h2 className="text-lg font-semibold text-dark-100">Upload & Bandingkan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drag & Drop */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center hover:border-dark-500 transition-colors cursor-pointer"
            >
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              ) : (
                <>
                  <div className="text-dark-500 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-dark-400">Drag & drop gambar cover</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input-compare"
              />
              <label
                htmlFor="file-input-compare"
                className="mt-4 inline-block px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm rounded-lg cursor-pointer transition-colors"
              >
                Pilih File
              </label>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Pesan Rahasia</label>
                <textarea
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
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
                onClick={handleCompare}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-dark-50 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Membandingkan...
                  </span>
                ) : (
                  'Bandingkan'
                )}
              </motion.button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-3 text-sm text-accent-pink"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ─── Results ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Section 3: Side-by-Side View */}
              <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-dark-100">Perbandingan Visual</h2>
                <p className="text-xs text-dark-500">Klik gambar untuk zoom</p>
                <SideBySideView
                  originalUrl={result.original_image}
                  lsbStandarUrl={result.lsb_standar.stego_image}
                  lsbCnnUrl={result.lsb_cnn.stego_image}
                />
              </section>

              {/* Section 4: Metrics Comparison */}
              <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-dark-100">Perbandingan Metrik</h2>
                <p className="text-xs text-dark-500">PSNR, SSIM, MSE, dan metrik detail lainnya</p>
                <ComparisonTable
                  lsbStandar={result.lsb_standar.metrics}
                  lsbCnn={result.lsb_cnn.metrics}
                />
              </section>

              {/* Section 5: Charts */}
              <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-dark-100">Visualisasi Metrik</h2>
                <p className="text-xs text-dark-500">Grafik bar per kanal, radar multi-dimensi, dan selisih metrik</p>
                <ComparisonChart
                  lsbStandar={result.lsb_standar.metrics}
                  lsbCnn={result.lsb_cnn.metrics}
                />
              </section>

              {/* Section 6: Advantage Cards */}
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-dark-100">Mengapa LSB+CNN Lebih Unggul?</h2>
                  <p className="text-xs text-dark-500 mt-1">Keunggulan utama CNN-guided LSB over standard LSB</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AdvantageCard
                    title="PSNR (dB)"
                    standar={result.lsb_standar.metrics.psnr_db}
                    cnn={result.lsb_cnn.metrics.psnr_db}
                    unit="dB"
                    higherBetter
                  />
                  <AdvantageCard
                    title="SSIM"
                    standar={result.lsb_standar.metrics.ssim}
                    cnn={result.lsb_cnn.metrics.ssim}
                    higherBetter
                  />
                  <AdvantageCard
                    title="MSE"
                    standar={result.lsb_standar.metrics.mse}
                    cnn={result.lsb_cnn.metrics.mse}
                    lowerBetter
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AdvantageCard
                    title="Pixel Berubah"
                    standar={result.lsb_standar.metrics.changed_pixels ?? 0}
                    cnn={result.lsb_cnn.metrics.changed_pixels ?? 0}
                    lowerBetter
                  />
                  <AdvantageCard
                    title="Rasio Perubahan"
                    standar={(result.lsb_standar.metrics.change_ratio ?? 0) * 100}
                    cnn={(result.lsb_cnn.metrics.change_ratio ?? 0) * 100}
                    unit="%"
                    lowerBetter
                  />
                  <AdvantageCard
                    title="Histogram Distance"
                    standar={result.lsb_standar.metrics.histogram_distance ?? 0}
                    cnn={result.lsb_cnn.metrics.histogram_distance ?? 0}
                    lowerBetter
                  />
                </div>

                {/* Summary */}
                <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-dark-100">Kesimpulan</h3>
                      <p className="text-xs text-dark-500">Ringkasan perbandingan kedua metode</p>
                    </div>
                  </div>
                  <div className="text-sm text-dark-300 leading-relaxed space-y-2">
                    <p>
                      Metode <span className="text-accent-cyan font-medium">LSB+CNN</span> secara konsisten menghasilkan
                      kualitas steganografi yang lebih baik dibandingkan LSB Standar.
                    </p>
                    <ul className="list-disc list-inside text-dark-400 space-y-1">
                      <li>CNN memilih pixel yang <span className="text-dark-200">lebih aman</span> untuk penyisipan pesan</li>
                      <li>PSNR lebih tinggi = <span className="text-dark-200">distorsi visual lebih rendah</span></li>
                      <li>SSIM lebih tinggi = <span className="text-dark-200">struktur gambar lebih terjaga</span></li>
                      <li>MSE lebih rendah = <span className="text-dark-200">error per pixel lebih kecil</span></li>
                    </ul>
                    <p className="text-dark-500 text-xs">
                      Metode ini menggunakan fitur tekstur dan tepi dari CNN untuk menentukan area mana yang paling toleran
                      terhadap modifikasi bit, sehingga hasilnya lebih imperceptible.
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
