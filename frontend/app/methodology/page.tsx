'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const sections = [
  {
    id: 'pendekatan',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.25-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 005.982-2.275M12 21a8.966 8.966 0 01-5.982-2.275M15.75 3.186a24.286 24.286 0 012.094.904M8.25 3.186a24.286 24.286 0 00-2.094.904M12 3v1.5" />
      </svg>
    ),
    color: 'accent-cyan',
    title: 'Pendekatan Penelitian',
    items: [
      { label: 'Jenis', value: 'Penelitian terapan (applied research)' },
      { label: 'Fokus', value: 'Rekayasa perangkat lunak dan keamanan data' },
      { label: 'Tujuan', value: 'Mengimplementasikan deep learning dengan MobileNetV2 ke dalam metode LSB' },
      { label: 'Pendekatan', value: 'Kuantitatif dengan metode eksperimental' },
      { label: 'Pengukuran', value: 'PSNR dan SSIM secara objektif' },
    ],
  },
  {
    id: 'lsb',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    color: 'accent-purple',
    title: 'Algoritma LSB (Least Significant Bit)',
    content: (
      <div className="space-y-4">
        <p className="text-dark-300 leading-relaxed">
          LSB steganography bekerja dengan mengganti bit paling tidak signifikan (LSB) dari setiap piksel citra. Prinsip ini memanfaatkan fakta bahwa perubahan pada bit terakhir tidak terlihat oleh mata manusia.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
            <h4 className="text-sm font-semibold text-accent-cyan mb-2">Kapasitas</h4>
            <p className="text-dark-300 text-sm">1 bit per channel (R/G/B) = <span className="text-white font-mono">3 bit per piksel</span></p>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
            <h4 className="text-sm font-semibold text-accent-purple mb-2">Formula</h4>
            <code className="text-dark-200 text-sm font-mono block">P<sub>mod</sub> = P<sub>orig</sub> AND 0xFE OR msg_bit</code>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
            <svg className="w-5 h-5 text-accent-cyan mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <div>
              <p className="text-sm font-medium text-white">Kelebihan</p>
              <p className="text-xs text-dark-400">Simple, high capacity</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-pink/5 border border-accent-pink/20">
            <svg className="w-5 h-5 text-accent-pink mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-white">Kekurangan</p>
              <p className="text-xs text-dark-400">Rentan terhadap serangan statistik</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'cnn',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    color: 'accent-blue',
    title: 'CNN Feature Extraction (MobileNetV2)',
    content: (
      <div className="space-y-4">
        <p className="text-dark-300 leading-relaxed">
          MobileNetV2 menggunakan depthwise separable convolutions untuk ekstraksi fitur yang efisien. Arsitektur ini menghasilkan feature map yang merepresentasikan koefisien tekstur pada setiap region citra.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent-blue/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
            </div>
            <p className="text-xs text-dark-400 mb-1">Arsitektur</p>
            <p className="text-sm font-medium text-white">MobileNetV2</p>
            <p className="text-xs text-dark-500">Depthwise separable conv</p>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </div>
            <p className="text-xs text-dark-400 mb-1">Input</p>
            <p className="text-sm font-medium text-white">[-1, 1]</p>
            <p className="text-xs text-dark-500">Citra dinormalisasi</p>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <p className="text-xs text-dark-400 mb-1">Output</p>
            <p className="text-sm font-medium text-white">Feature Map</p>
            <p className="text-xs text-dark-500">Koefisien tekstur</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
          <h4 className="text-sm font-semibold text-white mb-2">Sliding Window Mechanism</h4>
          <code className="text-dark-200 text-sm font-mono block text-center py-2">
            Y = &Sigma;&Sigma; I &middot; K
          </code>
          <p className="text-xs text-dark-400 text-center mt-1">
            Koefisien tinggi = area tekstur kompleks = aman untuk LSB
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'seleksi',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
    ),
    color: 'accent-orange',
    title: 'Seleksi Koefisien CNN',
    content: (
      <div className="space-y-4">
        <p className="text-dark-300 leading-relaxed">
          CNN mengekstraksi fitur spasial untuk menentukan area tekstur kasar pada citra. Area dengan koefisien tinggi menunjukkan kompleksitas tekstural yang memungkinkan penyisipan pesan tanpa menimbulkan kecurigaan visual.
        </p>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-orange/50 via-accent-cyan/50 to-accent-purple/50" />
          <div className="space-y-4">
            <div className="flex items-start gap-4 pl-8 relative">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-accent-orange border-2 border-dark-900" />
              <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 flex-1">
                <p className="text-sm text-dark-300">CNN mengekstraksi fitur spasial untuk menentukan area tekstur kasar</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pl-8 relative">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-accent-cyan border-2 border-dark-900" />
              <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 flex-1">
                <p className="text-sm text-dark-300">Nilai koefisien (C) tinggi &rarr; area kompleks &rarr; <span className="text-accent-cyan font-medium">aman untuk penyisipan</span></p>
              </div>
            </div>
            <div className="flex items-start gap-4 pl-8 relative">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-accent-purple border-2 border-dark-900" />
              <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 flex-1">
                <p className="text-sm text-dark-300">Threshold selection: menentukan batas koefisien yang dipilih</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pl-8 relative">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-accent-pink border-2 border-dark-900" />
              <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700 flex-1">
                <p className="text-sm text-dark-300">Pesan disisipkan di area yang <span className="text-accent-pink font-medium">tidak mencurigakan</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'metrik',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: 'accent-pink',
    title: 'Metrik Evaluasi',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
                <span className="text-accent-cyan font-bold text-sm">P</span>
              </div>
              <h4 className="text-sm font-semibold text-white">PSNR</h4>
            </div>
            <p className="text-xs text-dark-400 mb-3">Peak Signal-to-Noise Ratio</p>
            <code className="text-dark-200 text-xs font-mono block p-2 rounded bg-dark-900 mb-3">
              PSNR = 10 &middot; log<sub>10</sub>(MAX&sup2; / MSE)
            </code>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                <span className="text-xs text-dark-300">&gt;40dB = Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-orange" />
                <span className="text-xs text-dark-300">30-40dB = Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-pink" />
                <span className="text-xs text-dark-300">&lt;30dB = Poor</span>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                <span className="text-accent-purple font-bold text-sm">S</span>
              </div>
              <h4 className="text-sm font-semibold text-white">SSIM</h4>
            </div>
            <p className="text-xs text-dark-400 mb-3">Structural Similarity Index</p>
            <div className="p-3 rounded bg-dark-900 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-500">0</span>
                <div className="flex-1 mx-2 h-2 rounded-full bg-gradient-to-r from-accent-pink via-accent-orange to-accent-cyan" />
                <span className="text-xs text-dark-500">1</span>
              </div>
              <p className="text-xs text-dark-400 text-center mt-2">Rentang 0-1, mendekati 1 = mirip</p>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue font-bold text-sm">M</span>
              </div>
              <h4 className="text-sm font-semibold text-white">MSE</h4>
            </div>
            <p className="text-xs text-dark-400 mb-3">Mean Squared Error</p>
            <code className="text-dark-200 text-xs font-mono block p-2 rounded bg-dark-900">
              MSE = (1/n) &middot; &Sigma;(P<sub>i</sub> - I<sub>i</sub>)&sup2;
            </code>
            <p className="text-xs text-dark-500 mt-2">Rata-rata kuadrat selisih piksel</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'eksperimen',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.25-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 005.982-2.275M12 21a8.966 8.966 0 01-5.982-2.275M15.75 3.186a24.286 24.286 0 012.094.904M8.25 3.186a24.286 24.286 0 00-2.094.904M12 3v1.5" />
      </svg>
    ),
    color: 'accent-cyan',
    title: 'Eksperimen',
    items: [
      { label: 'Perbandingan', value: 'LSB Standar vs LSB+CNN' },
      { label: 'Dataset', value: 'ALASKA (sekunder) + Kamera Smartphone (primer)' },
      { label: 'Variabel Independen', value: 'Teknik ekstraksi fitur MobileNetV2' },
      { label: 'Variabel Depend', value: 'PSNR dan SSIM' },
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Metodologi
        </h1>
        <p className="mt-1 text-dark-400">
          Pendekatan ilmiah di balik StegoNet
        </p>
      </motion.div>

      {/* Sections */}
      {sections.map((section, i) => (
        <motion.section
          key={section.id}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="border border-dark-800 bg-dark-900 rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={`p-2.5 rounded-xl bg-${section.color}/20 text-${section.color}`}>
              {section.icon}
            </div>
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
          </div>

          {section.items && (
            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-3 rounded-xl bg-dark-800/40 border border-dark-800"
                >
                  <span className="text-xs font-medium text-dark-400 sm:w-40 shrink-0">
                    {item.label}
                  </span>
                  <span className="text-sm text-dark-200">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {section.content && section.content}
        </motion.section>
      ))}
    </div>
  );
}
