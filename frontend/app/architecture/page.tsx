'use client';

import { motion } from 'framer-motion';

/* ── Data ──────────────────────────────────────────────────────────────── */

const layers = [
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'Next.js',
    color: 'cyan' as const,
    components: [
      { name: 'Dashboard', desc: 'Overview & stats' },
      { name: 'Embed', desc: 'Hide messages' },
      { name: 'Extract', desc: 'Reveal messages' },
      { name: 'Analyze', desc: 'Inspect images' },
      { name: 'Compare', desc: 'Side-by-side' },
    ],
    extras: ['ProcessTimeline', 'Charts', 'ImageUploader', 'React Hooks', 'REST + SSE'],
  },
  {
    id: 'backend',
    title: 'Backend',
    subtitle: 'FastAPI',
    color: 'purple' as const,
    components: [
      { name: '/embed', desc: 'POST embed stream' },
      { name: '/extract', desc: 'POST extract' },
      { name: '/evaluate', desc: 'Compare methods' },
      { name: '/analyze', desc: 'Image analysis' },
      { name: '/history', desc: 'Past operations' },
      { name: '/stats', desc: 'System stats' },
    ],
    extras: ['EmbedService', 'ExtractService', 'EvaluateService'],
  },
  {
    id: 'aiml',
    title: 'AI / ML',
    subtitle: 'TensorFlow',
    color: 'orange' as const,
    components: [
      { name: 'MobileNetV2', desc: 'Pretrained on ImageNet' },
      { name: 'CNN Feature Extractor', desc: 'Conv layers → coefficients' },
      { name: 'LSB Embedder', desc: 'Adaptive embedding' },
      { name: 'Metrics Calculator', desc: 'PSNR, SSIM, MSE' },
      { name: 'Threshold Analyzer', desc: 'Optimal pixel selection' },
    ],
    extras: ['Fallback: Sobel + Block Variance'],
  },
  {
    id: 'storage',
    title: 'Storage',
    subtitle: 'SQLite + File System',
    color: 'pink' as const,
    components: [
      { name: 'process_history', desc: 'Operation records' },
      { name: 'evaluation_results', desc: 'Metrics & comparisons' },
      { name: 'Cover images', desc: 'Original uploads' },
      { name: 'Stego images', desc: 'Embedded outputs' },
      { name: 'Thumbnails', desc: 'Previews' },
    ],
    extras: [],
  },
];

const dataFlow = [
  'Upload cover image + enter message + set threshold',
  'POST /api/v1/embed/stream (SSE)',
  'Normalize → CNN extract → Threshold → LSB embed',
  'Stream progress via SSE events',
  'Save stego image + metrics to DB & filesystem',
  'Display timeline + visualizations',
];

/* ── Color map ──────────────────────────────────────────────────────────── */

const colorMap = {
  cyan: {
    border: 'border-accent-cyan/40',
    bg: 'bg-accent-cyan/5',
    text: 'text-accent-cyan',
    badge: 'bg-accent-cyan/15 text-accent-cyan',
    componentBorder: 'border-accent-cyan/20',
    componentBg: 'bg-accent-cyan/5',
    arrow: '#06d6a0',
    glow: 'shadow-accent-cyan/10',
  },
  purple: {
    border: 'border-accent-purple/40',
    bg: 'bg-accent-purple/5',
    text: 'text-accent-purple',
    badge: 'bg-accent-purple/15 text-accent-purple',
    componentBorder: 'border-accent-purple/20',
    componentBg: 'bg-accent-purple/5',
    arrow: '#8338ec',
    glow: 'shadow-accent-purple/10',
  },
  orange: {
    border: 'border-accent-orange/40',
    bg: 'bg-accent-orange/5',
    text: 'text-accent-orange',
    badge: 'bg-accent-orange/15 text-accent-orange',
    componentBorder: 'border-accent-orange/20',
    componentBg: 'bg-accent-orange/5',
    arrow: '#fb5607',
    glow: 'shadow-accent-orange/10',
  },
  pink: {
    border: 'border-accent-pink/40',
    bg: 'bg-accent-pink/5',
    text: 'text-accent-pink',
    badge: 'bg-accent-pink/15 text-accent-pink',
    componentBorder: 'border-accent-pink/20',
    componentBg: 'bg-accent-pink/5',
    arrow: '#ff006e',
    glow: 'shadow-accent-pink/10',
  },
} as const;

/* ── Animation variants ──────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const layerVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const arrowVariants = {
  hidden: { opacity: 0, scaleY: 0 },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/* ── Sub-components ──────────────────────────────────────────────────── */

function Arrow({ color }: { color: string }) {
  return (
    <motion.div
      variants={arrowVariants}
      className="flex justify-center py-1"
    >
      <svg
        width="24"
        height="48"
        viewBox="0 0 24 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0V40M12 40L4 32M12 40L20 32"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  );
}

function LayerCard({ layer }: { layer: typeof layers[number] }) {
  const c = colorMap[layer.color];
  return (
    <motion.div
      variants={layerVariants}
      className={`relative rounded-2xl border ${c.border} ${c.bg} p-6 transition-shadow hover:shadow-lg ${c.glow}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${c.badge}`}>
          {layer.subtitle}
        </span>
        <h2 className={`text-xl font-bold ${c.text}`}>{layer.title}</h2>
      </div>

      {/* Component grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {layer.components.map((comp) => (
          <div
            key={comp.name}
            className={`rounded-xl border ${c.componentBorder} ${c.componentBg} px-3 py-2.5`}
          >
            <div className="text-sm font-semibold text-dark-100">{comp.name}</div>
            <div className="text-xs text-dark-400 mt-0.5">{comp.desc}</div>
          </div>
        ))}
      </div>

      {/* Extras */}
      {layer.extras.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {layer.extras.map((extra) => (
            <span
              key={extra}
              className="text-[11px] text-dark-400 bg-dark-800/60 rounded-md px-2 py-1"
            >
              {extra}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text">System Architecture</h1>
          <p className="text-dark-400 text-sm max-w-xl mx-auto">
            StegoNet implements a four-layer architecture for CNN-guided LSB steganography.
            Each layer communicates through well-defined interfaces, enabling real-time streaming via SSE.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0"
        >
          {layers.map((layer, i) => (
            <div key={layer.id}>
              <LayerCard layer={layer} />
              {i < layers.length - 1 && (
                <Arrow color={colorMap[layer.color].arrow} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Data Flow Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6"
        >
          <h2 className="text-xl font-bold text-dark-100 mb-5">
            <span className="gradient-text">Data Flow — Embed Operation</span>
          </h2>
          <ol className="space-y-3">
            {dataFlow.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.8 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/15 text-accent-cyan text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-dark-200 pt-0.5">{step}</span>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* Technology Stack */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6"
        >
          <h2 className="text-xl font-bold text-dark-100 mb-5">
            <span className="gradient-text">Technology Stack</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Framework', value: 'Next.js 14', icon: '⚡' },
              { label: 'Backend', value: 'FastAPI', icon: '🚀' },
              { label: 'ML Engine', value: 'TensorFlow', icon: '🧠' },
              { label: 'Database', value: 'SQLite', icon: '💾' },
              { label: 'Styling', value: 'Tailwind CSS', icon: '🎨' },
              { label: 'Animation', value: 'Framer Motion', icon: '✨' },
              { label: 'Streaming', value: 'Server-Sent Events', icon: '📡' },
              { label: 'Model', value: 'MobileNetV2', icon: '🔬' },
            ].map((tech) => (
              <div
                key={tech.label}
                className="bg-dark-800/40 rounded-xl border border-dark-700/50 px-4 py-3 text-center"
              >
                <div className="text-lg mb-1">{tech.icon}</div>
                <div className="text-xs text-dark-400">{tech.label}</div>
                <div className="text-sm font-semibold text-dark-100">{tech.value}</div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
