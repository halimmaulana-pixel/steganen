'use client';

import { motion } from 'framer-motion';

interface OutputSectionProps {
  originalImageUrl: string | null;
  stegoImageUrl: string | null;
  differenceImageUrl: string | null;
  metrics: {
    psnr_db: number;
    ssim: number;
    mse: number;
  } | null;
  metadata: Record<string, unknown> | null;
}

export default function OutputSection({
  originalImageUrl,
  stegoImageUrl,
  differenceImageUrl,
  metrics,
  metadata,
}: OutputSectionProps) {
  const handleDownload = (url: string, filename: string) => {
    try {
      const dataUrl = url.startsWith('data:') ? url : `data:image/png;base64,${url}`;
      if (dataUrl.startsWith('data:')) {
        const parts = dataUrl.split(',');
        const byteString = atob(parts[1] || '');
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      alert('Gagal mengunduh gambar. Silakan coba lagi.');
    }
  };

  const handleDownloadMetadata = () => {
    if (!metadata) return;
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stego_metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold gradient-text">Output Results</h2>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-dark-400 uppercase tracking-wider">Original</h4>
          <div className="rounded-xl overflow-hidden border border-dark-700">
            {originalImageUrl ? (
              <img src={originalImageUrl} alt="Original" className="w-full h-auto" />
            ) : (
              <div className="h-40 bg-dark-900 flex items-center justify-center text-dark-500 text-sm">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Stego */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-dark-400 uppercase tracking-wider">Stego Image</h4>
          <div className="rounded-xl overflow-hidden border border-dark-700">
            {stegoImageUrl ? (
              <img src={stegoImageUrl} alt="Stego" className="w-full h-auto" />
            ) : (
              <div className="h-40 bg-dark-900 flex items-center justify-center text-dark-500 text-sm">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Difference */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-dark-400 uppercase tracking-wider">
            Difference (10x amplified)
          </h4>
          <div className="rounded-xl overflow-hidden border border-dark-700">
            {differenceImageUrl ? (
              <img src={differenceImageUrl} alt="Difference" className="w-full h-auto" />
            ) : (
              <div className="h-40 bg-dark-900 flex items-center justify-center text-dark-500 text-sm">
                No image
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => stegoImageUrl && handleDownload(stegoImageUrl, 'stego_image.png')}
          disabled={!stegoImageUrl}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent-cyan/25 transition-shadow"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Stego Image
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadMetadata}
          disabled={!metadata}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-dark-600 text-dark-200 hover:bg-dark-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Metadata (JSON)
        </motion.button>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <h4 className="text-sm font-medium text-dark-200 mb-3">Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-accent-cyan">{metrics.psnr_db.toFixed(1)}</p>
              <p className="text-xs text-dark-400">PSNR (dB)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-blue">{metrics.ssim.toFixed(4)}</p>
              <p className="text-xs text-dark-400">SSIM</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-purple">{metrics.mse.toFixed(4)}</p>
              <p className="text-xs text-dark-400">MSE</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
