'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

/* ── Tech stack data ─────────────────────────────────────────────────── */

const techStack = [
  {
    name: 'Next.js 14',
    desc: 'React framework dengan App Router, server components, dan hybrid rendering.',
    icon: '⚡',
    color: 'from-dark-700 to-dark-600',
  },
  {
    name: 'FastAPI',
    desc: 'Backend API performa tinggi untuk pemrosesan steganografi dan inferensi model.',
    icon: '🚀',
    color: 'from-accent-cyan/20 to-accent-blue/20',
  },
  {
    name: 'TensorFlow / MobileNetV2',
    desc: 'Model CNN untuk ekstraksi fitur dan seleksi koefisien DCT.',
    icon: '🧠',
    color: 'from-accent-purple/20 to-accent-pink/20',
  },
  {
    name: 'Tailwind CSS',
    desc: 'Utility-first CSS framework untuk desain antarmuka yang konsisten.',
    icon: '🎨',
    color: 'from-accent-blue/20 to-accent-purple/20',
  },
  {
    name: 'Chart.js',
    desc: 'Visualisasi data kualitas citra: PSNR, SSIM, capacity, dan threshold.',
    icon: '📊',
    color: 'from-accent-orange/20 to-accent-pink/20',
  },
];

/* ── Acknowledgments ─────────────────────────────────────────────────── */

const acknowledgments = [
  'Universitas Muhammadiyah Sumatera Utara — Fakultas Ilmu Komputer dan Teknologi Informasi',
  'Dosen pembimbing yang telah membimbing penelitian ini dari awal hingga akhir',
  'Tim laboratorium yang mendukung pengumpulan data dan pengujian',
  'Keluarga dan teman-teman yang selalu memberikan motivasi',
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Hero */}
      <motion.section
        variants={stagger}
        initial="initial"
        animate="animate"
        className="text-center space-y-6"
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dark-700 bg-dark-900 text-xs text-dark-400">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
          Versi 1.0.0
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="gradient-text">StegoNet</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-dark-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Steganografi Citra Digital Menggunakan Least Significant Bit (LSB) dengan Seleksi Koefisien Berbasis Convolutional Neural Network (CNN)
        </motion.p>

        <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 text-sm text-dark-500">
          <Link href="/embed" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 font-semibold hover:opacity-90 transition-opacity">
            Coba Sekarang
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl border border-dark-700 text-dark-300 hover:border-dark-500 transition-colors"
          >
            Source Code
          </a>
        </motion.div>
      </motion.section>

      {/* Author Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">Penulis</p>
        <div className="border border-dark-800 bg-dark-900 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Photo placeholder */}
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-dark-700 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-bold text-white">Dwi Sintia</h2>
              <p className="text-dark-400">NPM 2209010277</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="px-3 py-1 text-xs rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                  S1 Informatika
                </span>
                <span className="px-3 py-1 text-xs rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                  Universitas Muhammadiyah Sumatera Utara
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Thesis Info */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">Tugas Akhir</p>
        <div className="border border-dark-800 bg-dark-900 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white leading-snug">
            Steganografi Citra Digital Menggunakan Least Significant Bit (LSB) dengan Seleksi Koefisien Berbasis Convolutional Neural Network (CNN)
          </h2>

          <div className="space-y-4 text-sm text-dark-300 leading-relaxed">
            <p>
              Penelitian ini mengusulkan pendekatan baru dalam steganografi citra digital dengan menggabungkan metode Least Significant Bit (LSB) dan Convolutional Neural Network (CNN). CNN digunakan untuk mengekstrak fitur koefisien DCT (Discrete Cosine Transform) dari citra, yang kemudian dimanfaatkan untuk seleksi area penyisipan yang optimal.
            </p>
            <p>
              Dengan pendekatan berbasis CNN, sistem dapat secara otomatis menentukan piksel atau koefisien mana yang paling cocok untuk menyisipkan pesan rahasia tanpa mengurangi kualitas visual citra secara signifikan. MobileNetV2 dipilih sebagai arsitektur CNN karena efisiensinya dalam penggunaan komputasi sambil mempertahankan akurasi yang tinggi.
            </p>
            <p>
              Evaluasi dilakukan menggunakan metrik PSNR (Peak Signal-to-Noise Ratio) dan SSIM (Structural Similarity Index Measure) untuk mengukur kualitas citra stego dibandingkan dengan citra asli. Hasil pengujian menunjukkan bahwa pendekatan ini menghasilkan kualitas steganografi yang lebih baik dibandingkan metode LSB tradisional.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dark-800">
            {[
              { label: 'Metode', value: 'LSB + CNN' },
              { label: 'Arsitektur CNN', value: 'MobileNetV2' },
              { label: 'Transformasi', value: 'DCT' },
              { label: 'Metrik', value: 'PSNR & SSIM' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xs text-dark-500 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-dark-200">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">Teknologi</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              whileHover={{ scale: 1.02 }}
              className="border border-dark-800 bg-dark-900 rounded-2xl p-5 space-y-3 hover:border-dark-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tech.color}`}>
                  <span className="text-lg">{tech.icon}</span>
                </div>
                <h3 className="font-semibold text-white text-sm">{tech.name}</h3>
              </div>
              <p className="text-xs text-dark-400 leading-relaxed">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Acknowledgments */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">Pengakuan</p>
        <div className="border border-dark-800 bg-dark-900 rounded-2xl p-6 sm:p-8">
          <ul className="space-y-3">
            {acknowledgments.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-dark-300">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Footer note */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pb-8"
      >
        <p className="text-xs text-dark-500">
          StegoNet v1.0.0 — Dibuat untuk keperluan tugas akhir Universitas Muhammadiyah Sumatera Utara
        </p>
      </motion.section>
    </div>
  );
}
