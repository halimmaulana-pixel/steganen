'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

/* ── Types ─────────────────────────────────────────────────────────────── */

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface SubProcessItem {
  label: string;
  status: StepStatus;
}

export interface TimelineStep {
  id: string;
  label: string;
  icon: string;
  status: StepStatus;
  subProcesses: SubProcessItem[];
  elapsed?: number;
}

interface ProcessTimelineProps {
  steps: TimelineStep[];
  activeStepId: string | null;
  isComplete: boolean;
  originalImageUrl: string | null;
  stegoImageUrl: string | null;
  featureMaps: number[][][] | null;
  coefficients: number[][] | null;
  binaryMap: number[][] | null;
  threshold: number;
  message: string;
  metadata: Record<string, unknown> | null;
  metrics: { psnr_db: number; ssim: number; mse: number } | null;
  stepViz?: Record<string, StepVizData>;
}

interface StepVizData {
  imageThumb?: string;
  coeffThumb?: string;
  binaryThumb?: string;
  stegoThumb?: string;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function interpolateColor(value: number, min: number, max: number): string {
  const t = (value - min) / (max - min || 1);
  const r = t < 0.5 ? 255 : Math.round(255 * (1 - 2 * (t - 0.5)));
  const g = t < 0.5 ? Math.round(255 * 2 * t) : Math.round(255 * (2 * (1 - t)));
  const b = t < 0.5 ? Math.round(255 * (1 - 2 * t)) : 255;
  return `rgb(${r}, ${g}, ${b})`;
}

function downsample2D(grid: number[][], targetSize: number): number[][] {
  if (!grid || grid.length === 0) return [];
  const srcH = grid.length;
  const srcW = grid[0].length;
  const result: number[][] = [];
  for (let y = 0; y < targetSize; y++) {
    result[y] = [];
    for (let x = 0; x < targetSize; x++) {
      const sy = Math.floor((y / targetSize) * srcH);
      const sx = Math.floor((x / targetSize) * srcW);
      result[y][x] = grid[sy][sx];
    }
  }
  return result;
}

function downsample2DBoolean(grid: number[][], targetSize: number): boolean[][] {
  if (!grid || grid.length === 0) return [];
  const srcH = grid.length;
  const srcW = grid[0].length;
  const result: boolean[][] = [];
  for (let y = 0; y < targetSize; y++) {
    result[y] = [];
    for (let x = 0; x < targetSize; x++) {
      const sy = Math.floor((y / targetSize) * srcH);
      const sx = Math.floor((x / targetSize) * srcW);
      result[y][x] = grid[sy][sx] > 0;
    }
  }
  return result;
}

/* ── Sub-step item ─────────────────────────────────────────────────────── */

function SubStepRow({ item, index }: { item: SubProcessItem; index: number }) {
  const isDone = item.status === 'completed';
  const isActive = item.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-2.5 py-1"
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
        isDone
          ? 'border-accent-cyan bg-accent-cyan/20'
          : isActive
          ? 'border-accent-blue border-t-transparent'
          : 'border-dark-600'
      }`}>
        {isDone && (
          <svg className="w-2.5 h-2.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isActive && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-2 h-2 border border-accent-blue border-t-transparent rounded-full"
          />
        )}
      </div>
      <span className={`text-xs ${isDone ? 'text-dark-300' : isActive ? 'text-dark-200' : 'text-dark-500'}`}>
        {item.label}
      </span>
    </motion.div>
  );
}

/* ── Step Card ─────────────────────────────────────────────────────────── */

function StepCard({
  step,
  isLatest,
  children,
}: {
  step: TimelineStep;
  isLatest: boolean;
  children?: React.ReactNode;
}) {
  const isCompleted = step.status === 'completed';
  const isActive = step.status === 'active';
  const isPending = step.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border transition-colors ${
        isActive
          ? 'bg-dark-900/80 border-accent-blue/30'
          : isCompleted
          ? 'bg-dark-900/40 border-dark-800'
          : 'bg-dark-900/20 border-dark-800/50'
      }`}
    >
      {/* Step header — always visible */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
          isCompleted
            ? 'bg-accent-cyan/20 text-accent-cyan'
            : isActive
            ? 'bg-accent-blue/20 text-accent-blue'
            : 'bg-dark-800 text-dark-500'
        }`}>
          {isCompleted ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span>{step.icon}</span>
          )}
        </div>

        {/* Label + elapsed */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${
              isActive ? 'text-dark-100' : isCompleted ? 'text-dark-300' : 'text-dark-500'
            }`}>
              {step.label}
            </span>
            {isCompleted && step.elapsed !== undefined && (
              <span className="text-[10px] text-dark-500 font-mono">{step.elapsed}s</span>
            )}
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2 h-2 rounded-full bg-accent-blue"
          />
        )}
      </div>

      {/* Sub-steps + content — show when active or completed */}
      {(isActive || isCompleted) && (
        <div className="px-4 pb-3 space-y-2">
          {step.subProcesses.length > 0 && (
            <div className="pl-11 space-y-0.5">
              {step.subProcesses.map((sub, i) => (
                <SubStepRow key={i} item={sub} index={i} />
              ))}
            </div>
          )}
          {children && <div className="pl-11">{children}</div>}
        </div>
      )}
    </motion.div>
  );
}

/* ── Step Content Renderers ────────────────────────────────────────────── */

function Step0Content({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) return null;
  return (
    <div className="relative rounded-xl overflow-hidden border border-dark-700 mt-2">
      <img src={imageUrl} alt="Original" className="w-full h-auto object-contain max-h-48" />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-950/90 to-transparent p-2">
        <span className="text-[10px] text-dark-400">224 × 224 · RGB</span>
      </div>
    </div>
  );
}

function Step1Content({ featureMaps }: { featureMaps: number[][][] | null }) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (!featureMaps) return;
    featureMaps.slice(0, 16).forEach((map, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 60;
      canvas.height = 60;
      const cellW = 60 / map[0].length;
      const cellH = 60 / map.length;
      const flat = map.flat();
      const min = Math.min(...flat);
      const max = Math.max(...flat);
      const range = max - min || 1;
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          const n = (map[y][x] - min) / range;
          const r = Math.round(n * 255);
          const b = Math.round((1 - n) * 255);
          ctx.fillStyle = `rgb(${r}, 50, ${b})`;
          ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    });
  }, [featureMaps]);

  if (!featureMaps) return null;

  return (
    <div className="grid grid-cols-8 gap-1 mt-2">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="relative group">
          <canvas
            ref={(el) => { canvasRefs.current[i] = el; }}
            width={60}
            height={60}
            className="w-full rounded border border-dark-700"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark-950/70 rounded">
            <span className="text-[8px] text-dark-200 font-mono">CH{i}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Step2Content({
  coefficients,
  threshold,
  metadata,
}: {
  coefficients: number[][] | null;
  threshold: number;
  metadata: Record<string, unknown> | null;
}) {
  const heatmapRef = useRef<HTMLCanvasElement>(null);
  const displayCoeffs = useMemo(() => coefficients ? downsample2D(coefficients, 48) : null, [coefficients]);

  useEffect(() => {
    if (!displayCoeffs || !heatmapRef.current) return;
    const canvas = heatmapRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = displayCoeffs.length;
    canvas.width = 200;
    canvas.height = 200;
    const cellSize = 200 / size;
    const flat = displayCoeffs.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = interpolateColor(displayCoeffs[y][x], min, max);
        ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
      }
    }
    // Threshold line
    const thresholdY = 200 * (1 - threshold / 100);
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(200, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff006e';
    ctx.font = '10px sans-serif';
    ctx.fillText(`θ=${threshold}%`, 4, thresholdY - 4);
  }, [displayCoeffs, threshold]);

  if (!displayCoeffs) return null;

  return (
    <div className="flex items-start gap-4 mt-2">
      <canvas ref={heatmapRef} className="rounded-lg border border-dark-700" style={{ width: 150, height: 150 }} />
      <div className="flex flex-col gap-1.5">
        <StatMini label="Selected" value={metadata?.selected_pixels?.toLocaleString() || '—'} />
        <StatMini label="Total" value={metadata?.total_pixels?.toLocaleString() || '—'} />
        <StatMini label="θ Value" value={typeof metadata?.threshold_value === 'number' ? metadata.threshold_value.toFixed(4) : '—'} />
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-dark-500">{label}:</span>
      <span className="text-dark-300 font-mono">{value}</span>
    </div>
  );
}

function Step3Content({
  binaryMap,
  coefficients,
  threshold,
  message,
}: {
  binaryMap: number[][] | null;
  coefficients: number[][] | null;
  threshold: number;
  message: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayBinary = useMemo(() => binaryMap ? downsample2DBoolean(binaryMap, 48) : null, [binaryMap]);
  const displayCoeffs = useMemo(() => coefficients ? downsample2D(coefficients, 48) : null, [coefficients]);

  useEffect(() => {
    if (!displayBinary || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = displayBinary.length;
    const displaySize = Math.min(container.clientWidth, 200);
    canvas.width = displaySize;
    canvas.height = displaySize;
    const cellSize = displaySize / size;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, displaySize, displaySize);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = displayBinary[y][x] ? 'rgba(6, 214, 160, 0.35)' : 'rgba(50, 50, 50, 0.4)';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
      }
    }
  }, [displayBinary]);

  if (!displayBinary) return null;

  const bitCapacity = message.length * 8;
  const selectedPct = ((displayBinary.flat().filter(Boolean).length / displayBinary.flat().length) * 100).toFixed(1);

  return (
    <div className="flex items-start gap-4 mt-2">
      <div ref={containerRef}>
        <canvas ref={canvasRef} className="rounded-lg border border-dark-700" style={{ width: 150, height: 150 }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <StatMini label="Message Bits" value={String(bitCapacity)} />
        <StatMini label="Selected" value={`${selectedPct}%`} />
        <StatMini label="Grid" value={`${displayBinary.length}×${displayBinary[0].length}`} />
      </div>
    </div>
  );
}

function Step4Content({
  originalImageUrl,
  stegoImageUrl,
  metrics,
}: {
  originalImageUrl: string | null;
  stegoImageUrl: string | null;
  metrics: { psnr_db: number; ssim: number; mse: number } | null;
}) {
  if (!stegoImageUrl) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-dark-500 mb-1">Original</p>
          <div className="rounded-lg overflow-hidden border border-dark-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={originalImageUrl || ''} alt="Original" className="w-full h-auto object-contain max-h-32" />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-dark-500 mb-1">Stego</p>
          <div className="rounded-lg overflow-hidden border border-dark-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stegoImageUrl} alt="Stego" className="w-full h-auto object-contain max-h-32" />
          </div>
        </div>
      </div>
      {metrics && (
        <div className="grid grid-cols-3 gap-2">
          <MetricBadge label="PSNR" value={metrics.psnr_db.toFixed(2)} unit="dB" good={metrics.psnr_db >= 40} />
          <MetricBadge label="SSIM" value={metrics.ssim.toFixed(6)} good={metrics.ssim >= 0.95} />
          <MetricBadge label="MSE" value={metrics.mse.toFixed(6)} good={metrics.mse <= 5} invert />
        </div>
      )}
    </div>
  );
}

function MetricBadge({
  label,
  value,
  unit,
  good,
  invert = false,
}: {
  label: string;
  value: string;
  unit?: string;
  good: boolean;
  invert?: boolean;
}) {
  return (
    <div className={`rounded-lg p-2 border ${
      good ? 'bg-accent-cyan/5 border-accent-cyan/20' : 'bg-dark-800/50 border-dark-700'
    }`}>
      <p className="text-[10px] text-dark-500">{label}</p>
      <p className={`text-sm font-bold font-mono ${good ? 'text-accent-cyan' : 'text-dark-300'}`}>
        {value}{unit || ''}
      </p>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────── */

export default function ProcessTimeline({
  steps,
  activeStepId,
  isComplete,
  originalImageUrl,
  stegoImageUrl,
  featureMaps,
  coefficients,
  binaryMap,
  threshold,
  message,
  metadata,
  metrics,
  stepViz,
}: ProcessTimelineProps) {
  const latestCompletedIdx = useMemo(() => {
    let idx = -1;
    steps.forEach((s, i) => {
      if (s.status === 'completed') idx = i;
    });
    return idx;
  }, [steps]);

  const renderContent = useCallback((step: TimelineStep) => {
    const viz = stepViz?.[step.id];

    switch (step.id) {
      case 'input': {
        // Use thumbnail from stepViz if available, otherwise full data
        const thumbUrl = viz?.imageThumb
          ? `data:image/png;base64,${viz.imageThumb}`
          : originalImageUrl;
        return <Step0Content imageUrl={thumbUrl} />;
      }
      case 'cnn': {
        // Show coefficient heatmap thumbnail during streaming, full feature maps after complete
        if (featureMaps) return <Step1Content featureMaps={featureMaps} />;
        if (viz?.coeffThumb) {
          return (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={`data:image/png;base64,${viz.coeffThumb}`}
                alt="Coefficient heatmap"
                className="rounded-lg border border-dark-700"
                style={{ width: 100, height: 100, objectFit: 'contain' }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-dark-500">Coefficient map (224×224)</span>
                <span className="text-[10px] text-dark-400 font-mono">Sobel + block variance</span>
              </div>
            </div>
          );
        }
        return null;
      }
      case 'threshold': {
        // Show heatmap + binary map thumbnails during streaming
        if (coefficients) return <Step2Content coefficients={coefficients} threshold={threshold} metadata={metadata} />;
        if (viz?.coeffThumb || viz?.binaryThumb) {
          return (
            <div className="mt-2 flex items-start gap-3">
              {viz.coeffThumb && (
                <div>
                  <p className="text-[9px] text-dark-500 mb-1">Coefficient Heatmap</p>
                  <img
                    src={`data:image/png;base64,${viz.coeffThumb}`}
                    alt="Coefficient heatmap"
                    className="rounded-lg border border-dark-700"
                    style={{ width: 100, height: 100, objectFit: 'contain' }}
                  />
                </div>
              )}
              {viz.binaryThumb && (
                <div>
                  <p className="text-[9px] text-dark-500 mb-1">Binary Map (θ={threshold}%)</p>
                  <img
                    src={`data:image/png;base64,${viz.binaryThumb}`}
                    alt="Binary map"
                    className="rounded-lg border border-dark-700"
                    style={{ width: 100, height: 100, objectFit: 'contain' }}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <StatMini label="Selected" value={metadata?.selected_pixels?.toLocaleString() || '—'} />
                <StatMini label="Total" value={metadata?.total_pixels?.toLocaleString() || '—'} />
              </div>
            </div>
          );
        }
        return null;
      }
      case 'embedding': {
        // Show stego thumbnail + binary map during streaming
        if (binaryMap) return <Step3Content binaryMap={binaryMap} coefficients={coefficients} threshold={threshold} message={message} />;
        if (viz?.stegoThumb || viz?.binaryThumb) {
          return (
            <div className="mt-2 flex items-start gap-3">
              {viz.binaryThumb && (
                <div>
                  <p className="text-[9px] text-dark-500 mb-1">Binary Map</p>
                  <img
                    src={`data:image/png;base64,${viz.binaryThumb}`}
                    alt="Binary map"
                    className="rounded-lg border border-dark-700"
                    style={{ width: 80, height: 80, objectFit: 'contain' }}
                  />
                </div>
              )}
              {viz.stegoThumb && (
                <div>
                  <p className="text-[9px] text-dark-500 mb-1">Stego Result</p>
                  <img
                    src={`data:image/png;base64,${viz.stegoThumb}`}
                    alt="Stego"
                    className="rounded-lg border border-dark-700"
                    style={{ width: 80, height: 80, objectFit: 'contain' }}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <StatMini label="Message Bits" value={String(message.length * 8)} />
                <StatMini label="Method" value="LSB" />
              </div>
            </div>
          );
        }
        return null;
      }
      case 'output':
        return <Step4Content originalImageUrl={originalImageUrl} stegoImageUrl={stegoImageUrl} metrics={metrics} />;
      default:
        return null;
    }
  }, [originalImageUrl, stegoImageUrl, featureMaps, coefficients, binaryMap, threshold, message, metadata, metrics, stepViz]);

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <StepCard
          key={step.id}
          step={step}
          isLatest={index === latestCompletedIdx}
        >
          {renderContent(step)}
        </StepCard>
      ))}
    </div>
  );
}
