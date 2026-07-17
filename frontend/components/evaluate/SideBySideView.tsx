'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SideBySideViewProps {
  originalUrl: string;
  lsbStandarUrl: string;
  lsbCnnUrl: string;
}

export default function SideBySideView({
  originalUrl,
  lsbStandarUrl,
  lsbCnnUrl,
}: SideBySideViewProps) {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  const images = [
    { src: originalUrl, label: 'Original', border: 'border-dark-600' },
    { src: lsbStandarUrl, label: 'LSB Standar', border: 'border-accent-blue' },
    { src: lsbCnnUrl, label: 'LSB + CNN', border: 'border-accent-cyan' },
  ];

  const diffUrl = lsbCnnUrl && !lsbCnnUrl.startsWith('data:')
    ? `${lsbCnnUrl}?diff=true`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <motion.div
            key={img.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-xl overflow-hidden border ${img.border} bg-dark-900 cursor-pointer group`}
            onClick={() => setZoomedIndex(zoomedIndex === i ? null : i)}
          >
            <div className="aspect-square relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.label}
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  zoomedIndex === i ? 'scale-150' : 'group-hover:scale-105'
                }`}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-xs font-medium text-dark-50">{img.label}</p>
            </div>
            {zoomedIndex === i && (
              <div className="absolute top-2 right-2 bg-dark-950/80 rounded-full p-1">
                <svg className="w-4 h-4 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}

        {diffUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative rounded-xl overflow-hidden border border-accent-pink/50 bg-dark-900"
          >
            <div className="aspect-square relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={diffUrl}
                alt="Difference View"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-xs font-medium text-dark-50">Difference (Amplified)</p>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {zoomedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark-950/90 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setZoomedIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[zoomedIndex].src}
                alt={images[zoomedIndex].label}
                className="w-full h-auto rounded-xl"
              />
              <p className="text-center mt-4 text-sm text-dark-300">
                {images[zoomedIndex].label} — Klik untuk tutup
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
