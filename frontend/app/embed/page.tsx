'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import InputSection from '@/components/embed/InputSection';
import ProcessTimeline from '@/components/embed/ProcessTimeline';
import OutputSection from '@/components/embed/OutputSection';
import PixelInspector from '@/components/embed/PixelInspector';
import BitPlaneView from '@/components/embed/BitPlaneView';
import BinaryMapDisplay from '@/components/embed/BinaryMapDisplay';
import CoefficientHeatmap from '@/components/embed/CoefficientHeatmap';
import ThresholdHistogram from '@/components/embed/ThresholdHistogram';
import MetricsPanel from '@/components/embed/MetricsPanel';
import FeatureMapGrid from '@/components/embed/FeatureMapGrid';
import type { TimelineStep, SubProcessItem } from '@/components/embed/ProcessTimeline';
import ComparisonTable from '@/components/evaluate/ComparisonTable';
import ComparisonChart from '@/components/evaluate/ComparisonChart';
import AdvantageCard from '@/components/evaluate/AdvantageCard';
import type { ComparisonData } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ── Initial timeline steps ────────────────────────────────────────────── */

function createInitialSteps(): TimelineStep[] {
  return [
    { id: 'input', label: 'Input Preview', icon: '🖼️', status: 'pending', subProcesses: [] },
    { id: 'cnn', label: 'CNN Feature Extraction', icon: '🧠', status: 'pending', subProcesses: [] },
    { id: 'threshold', label: 'Threshold Analysis', icon: '📊', status: 'pending', subProcesses: [] },
    { id: 'embedding', label: 'LSB Embedding', icon: '🔐', status: 'pending', subProcesses: [] },
    { id: 'output', label: 'Output & Metrics', icon: '✅', status: 'pending', subProcesses: [] },
  ];
}

/* ── State ─────────────────────────────────────────────────────────────── */

interface StepVizData {
  imageThumb?: string;
  coeffThumb?: string;
  binaryThumb?: string;
  stegoThumb?: string;
}

interface EmbedState {
  timeline: TimelineStep[];
  activeStepId: string | null;
  isComplete: boolean;
  processing: boolean;
  error: string | null;
  originalUrl: string | null;
  stegoUrl: string | null;
  featureMaps: number[][][] | null;
  coefficients: number[][] | null;
  binaryMap: number[][] | null;
  thresholdValues: number[] | null;
  metrics: { psnr_db: number; ssim: number; mse: number } | null;
  metadata: Record<string, unknown> | null;
  comparisonData: ComparisonData | null;
  showEvaluation: boolean;
  evaluating: boolean;
  stepViz: Record<string, StepVizData>;
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function EmbedPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [threshold, setThreshold] = useState(30);

  const [state, setState] = useState<EmbedState>({
    timeline: createInitialSteps(),
    activeStepId: null,
    isComplete: false,
    processing: false,
    error: null,
    originalUrl: null,
    stegoUrl: null,
    featureMaps: null,
    coefficients: null,
    binaryMap: null,
    thresholdValues: null,
    metrics: null,
    metadata: null,
    comparisonData: null,
    showEvaluation: false,
    evaluating: false,
    stepViz: {},
  });

  // Accumulate viz data locally (not in React state) to avoid batching issues
  const stepVizRef = useRef<Record<string, StepVizData>>({});

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  /* ── Image select ──────────────────────────────────────────────────── */

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    stepVizRef.current = {};
    setState((prev) => ({
      ...prev,
      timeline: createInitialSteps(),
      activeStepId: null,
      isComplete: false,
      stegoUrl: null,
      featureMaps: null,
      coefficients: null,
      binaryMap: null,
      thresholdValues: null,
      metrics: null,
      metadata: null,
      comparisonData: null,
      showEvaluation: false,
      stepViz: {},
    }));
  }, []);

  /* ── SSE embed ─────────────────────────────────────────────────────── */

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handleStart = async () => {
    if (!imageFile || !message) return;

    const initialSteps = createInitialSteps();
    stepVizRef.current = {};
    setState((prev) => ({
      ...prev,
      processing: true,
      error: null,
      timeline: initialSteps,
      activeStepId: null,
      isComplete: false,
      originalUrl: imagePreview,
      stegoUrl: null,
      featureMaps: null,
      coefficients: null,
      binaryMap: null,
      metrics: null,
      metadata: null,
      stepViz: {},
      thresholdValues: null,
      showEvaluation: false,
      comparisonData: null,
    }));

    try {
      const coverImage = await toBase64(imageFile);

      const response = await fetch(`${API_URL}/api/v1/embed/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cover_image: coverImage,
          secret_message: message,
          threshold_percent: threshold,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      const processLine = (line: string) => {
        if (line === '') {
          currentEvent = '';
        } else if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          try {
            const data = JSON.parse(dataStr);
            handleSSEEvent(currentEvent, data);
          } catch {
            // skip malformed JSON
          }
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            processLine(line);
          }
        }
        // Flush remaining buffer
        if (buffer.trim()) {
          processLine(buffer);
        }
      } finally {
        try { reader.releaseLock(); } catch {}
        setState((prev) => ({
          ...prev,
          processing: false,
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Embedding failed';
      setState((prev) => ({
        ...prev,
        processing: false,
        error: errorMsg,
        activeStepId: null,
      }));
    }
  };

  /* ── SSE event handler ─────────────────────────────────────────────── */

  const handleSSEEvent = (event: string, data: Record<string, unknown>) => {
    switch (event) {
      case 'step_start': {
        const stepIdx = data.step as number;
        const stepIds = ['input', 'cnn', 'threshold', 'embedding', 'output'];
        const stepId = stepIds[stepIdx];
        if (!stepId) return;
        const subSteps = (data.sub_steps as string[]) || [];

        setState((prev) => ({
          ...prev,
          activeStepId: stepId,
          timeline: prev.timeline.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  status: 'active' as const,
                  subProcesses: subSteps.map((label) => ({
                    label,
                    status: 'pending' as const,
                  })),
                }
              : s
          ),
        }));
        break;
      }

      case 'sub_step_done': {
        const stepIdx = data.step as number;
        const subIdx = data.sub as number;
        const stepIds = ['input', 'cnn', 'threshold', 'embedding', 'output'];
        const stepId = stepIds[stepIdx];
        if (!stepId) return;

        setState((prev) => ({
          ...prev,
          timeline: prev.timeline.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  subProcesses: s.subProcesses.map((sp, i) =>
                    i === subIdx ? { ...sp, status: 'completed' as const } : sp
                  ),
                }
              : s
          ),
        }));
        break;
      }

      case 'step_done': {
        const stepIdx = data.step as number;
        const stepIds = ['input', 'cnn', 'threshold', 'embedding', 'output'];
        const stepId = stepIds[stepIdx];
        if (!stepId) return;
        const elapsed = data.elapsed as number | undefined;
        // Convert snake_case backend viz keys to camelCase frontend keys
        const rawViz = (data.viz || {}) as Record<string, string>;
        const viz: StepVizData = {
          imageThumb: rawViz.image_thumb,
          coeffThumb: rawViz.coeff_thumb,
          binaryThumb: rawViz.binary_thumb,
          stegoThumb: rawViz.stego_thumb,
        };

        // Accumulate viz in ref (not React state) to avoid batching issues
        stepVizRef.current = { ...stepVizRef.current, [stepId]: viz };

        setState((prev) => ({
          ...prev,
          stepViz: { ...stepVizRef.current },
          timeline: prev.timeline.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  status: 'completed' as const,
                  elapsed,
                  subProcesses: s.subProcesses.map((sp) => ({
                    ...sp,
                    status: 'completed' as const,
                  })),
                }
              : s
          ),
        }));
        break;
      }

      case 'complete': {
        const stegoRaw = data.stego_image as string || null;
        const stegoUrl = stegoRaw && !stegoRaw.startsWith('data:')
          ? `data:image/png;base64,${stegoRaw}`
          : stegoRaw;

        const vizData = (data.visualization_data || {}) as Record<string, unknown>;
        const coefficients = (vizData.coefficient_map as number[][]) || null;
        const binaryMapData = (vizData.binary_map as number[][]) || null;
        const displayCoeffs = coefficients ? downsampleGrid(coefficients, 32) : null;
        const featureMaps = generateFeatureMaps(displayCoeffs);
        const values = displayCoeffs ? displayCoeffs.flat() : [];
        const meta = (data.metadata || {}) as Record<string, unknown>;

        setState((prev) => ({
          ...prev,
          processing: false,
          isComplete: true,
          activeStepId: null,
          stegoUrl,
          featureMaps,
          coefficients: displayCoeffs,
          binaryMap: binaryMapData,
          thresholdValues: values,
          metrics: data.metrics as EmbedState['metrics'],
          metadata: meta,
          stepViz: { ...stepVizRef.current },
          timeline: prev.timeline.map((s) => ({
            ...s,
            status: 'completed' as const,
            subProcesses: s.subProcesses.map((sp) => ({
              ...sp,
              status: 'completed' as const,
            })),
          })),
          }));
        break;
      }

      case 'error': {
        const msg = (data.message as string) || 'Unknown error';
        setState((prev) => ({
          ...prev,
          processing: false,
          error: msg,
          activeStepId: null,
          isComplete: false,
          stegoUrl: null,
          timeline: createInitialSteps(),
        }));
        break;
      }
    }
  };

  /* ── Evaluation ────────────────────────────────────────────────────── */

  const handleEvaluate = async () => {
    if (!imageFile || !message) return;
    setState((prev) => ({ ...prev, evaluating: true, error: null }));

    try {
      const coverImage = await toBase64(imageFile);
      const response = await axios.post(`${API_URL}/api/v1/evaluate`, {
        cover_image: coverImage,
        secret_message: message,
        threshold_percent: threshold,
      });
      const innerData = (response.data.data || response.data) as Record<string, unknown>;
      const comparisonData = innerData as unknown as ComparisonData;
      setState((prev) => ({
        ...prev,
        comparisonData,
        showEvaluation: true,
        evaluating: false,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Evaluation failed';
      setState((prev) => ({ ...prev, evaluating: false, error: errorMsg }));
    }
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  const hasStarted = state.processing || state.isComplete || state.activeStepId !== null;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold gradient-text">LSB Embedding</h1>
          <p className="text-dark-400 text-sm max-w-2xl mx-auto">
            Embed a secret message into an image using CNN-guided LSB steganography.
            The system analyzes pixel coefficients to select optimal embedding locations.
          </p>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-accent-pink/10 border border-accent-pink/30 rounded-xl p-4 text-sm text-accent-pink"
            >
              {state.error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: Input */}
        <section className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <InputSection
            onImageSelect={handleImageSelect}
            onMessageChange={setMessage}
            onThresholdChange={setThreshold}
            onStart={handleStart}
            imagePreview={imagePreview}
            message={message}
            threshold={threshold}
            isProcessing={state.processing}
          />
        </section>

        {/* Section 2: Process Timeline */}
        <AnimatePresence>
          {hasStarted && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                <ProcessTimeline
                  steps={state.timeline}
                  activeStepId={state.activeStepId}
                  isComplete={state.isComplete}
                  originalImageUrl={state.originalUrl}
                  stegoImageUrl={state.stegoUrl}
                  featureMaps={state.featureMaps}
                  coefficients={state.coefficients}
                  binaryMap={state.binaryMap}
                  threshold={threshold}
                  message={message}
                  metadata={state.metadata}
                  metrics={state.metrics}
                  stepViz={state.stepViz}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 2.5: Output Results (download + metrics) */}
        <AnimatePresence>
          {state.isComplete && state.stegoUrl && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6"
            >
              <OutputSection
                originalImageUrl={state.originalUrl}
                stegoImageUrl={state.stegoUrl}
                differenceImageUrl={null}
                metrics={state.metrics}
                metadata={state.metadata}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 2.6: Analysis Tools */}
        <AnimatePresence>
          {state.isComplete && state.stegoUrl && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Metrics Panel */}
              {state.metrics && (
                <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                  <MetricsPanel
                    psnr={state.metrics.psnr_db}
                    ssim={state.metrics.ssim}
                    mse={state.metrics.mse}
                  />
                </div>
              )}

              {/* Pixel Inspector + Bit Plane */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4">Pixel Inspector</h3>
                  <PixelInspector
                    originalImageUrl={state.originalUrl}
                    stegoImageUrl={state.stegoUrl}
                  />
                </div>
                <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4">Bit Plane View</h3>
                  <BitPlaneView originalImageUrl={state.originalUrl} />
                </div>
              </div>

              {/* Coefficient Heatmap + Binary Map */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4">Coefficient Heatmap</h3>
                  <CoefficientHeatmap
                    coefficients={state.coefficients}
                    threshold={threshold}
                  />
                </div>
                <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4">Binary Map Overlay</h3>
                  <BinaryMapDisplay
                    originalImageUrl={state.originalUrl}
                    coefficients={state.coefficients}
                    threshold={threshold}
                  />
                </div>
              </div>

              {/* Threshold Histogram */}
              <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                <h3 className="text-sm font-semibold text-dark-200 mb-4">Threshold Histogram</h3>
                <ThresholdHistogram
                  values={state.thresholdValues}
                  threshold={threshold}
                  selectedCount={state.metadata?.selected_pixels as number}
                  totalCount={state.metadata?.total_pixels as number}
                />
              </div>

              {/* Feature Map Grid */}
              {state.featureMaps && (
                <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4">Feature Maps (16 Channels)</h3>
                  <FeatureMapGrid featureMaps={state.featureMaps} />
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 3: Evaluation */}
        <AnimatePresence>
          {state.isComplete && state.stegoUrl && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6"
            >
              {!state.showEvaluation ? (
                <div className="text-center">
                  <button
                    onClick={handleEvaluate}
                    disabled={state.evaluating}
                    className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {state.evaluating ? 'Evaluating...' : 'Compare LSB Standard vs LSB+CNN'}
                  </button>
                </div>
              ) : state.comparisonData ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold gradient-text">
                    LSB Standard vs LSB+CNN Comparison
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AdvantageCard
                      title="PSNR"
                      standar={state.comparisonData.lsb_standar.metrics.psnr_db}
                      cnn={state.comparisonData.lsb_cnn.metrics.psnr_db}
                      unit="dB"
                      higherBetter
                    />
                    <AdvantageCard
                      title="SSIM"
                      standar={state.comparisonData.lsb_standar.metrics.ssim}
                      cnn={state.comparisonData.lsb_cnn.metrics.ssim}
                      higherBetter
                    />
                    <AdvantageCard
                      title="MSE"
                      standar={state.comparisonData.lsb_standar.metrics.mse}
                      cnn={state.comparisonData.lsb_cnn.metrics.mse}
                      lowerBetter
                    />
                  </div>

                  <ComparisonTable
                    lsbStandar={state.comparisonData.lsb_standar.metrics}
                    lsbCnn={state.comparisonData.lsb_cnn.metrics}
                  />

                  <ComparisonChart
                    lsbStandar={state.comparisonData.lsb_standar.metrics}
                    lsbCnn={state.comparisonData.lsb_cnn.metrics}
                  />
                </div>
              ) : null}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Utility functions ─────────────────────────────────────────────────── */

function downsampleGrid(grid: number[][], targetSize: number): number[][] {
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

function generateFeatureMaps(coefficients: number[][] | null): number[][][] | null {
  if (!coefficients || coefficients.length === 0) return null;

  const h = coefficients.length;
  const w = coefficients[0].length;
  const maps: number[][][] = [];

  // Map 0: Original
  maps.push(coefficients.map((row) => [...row]));

  // Map 1: Horizontal gradient
  const gradX: number[][] = [];
  for (let y = 0; y < h; y++) {
    gradX[y] = [];
    for (let x = 0; x < w; x++) {
      const left = x > 0 ? coefficients[y][x - 1] : coefficients[y][x];
      const right = x < w - 1 ? coefficients[y][x + 1] : coefficients[y][x];
      gradX[y][x] = right - left;
    }
  }
  maps.push(gradX);

  // Map 2: Vertical gradient
  const gradY: number[][] = [];
  for (let y = 0; y < h; y++) {
    gradY[y] = [];
    for (let x = 0; x < w; x++) {
      const up = y > 0 ? coefficients[y - 1][x] : coefficients[y][x];
      const down = y < h - 1 ? coefficients[y + 1][x] : coefficients[y][x];
      gradY[y][x] = down - up;
    }
  }
  maps.push(gradY);

  // Map 3: Gradient magnitude
  const magnitude: number[][] = [];
  for (let y = 0; y < h; y++) {
    magnitude[y] = [];
    for (let x = 0; x < w; x++) {
      magnitude[y][x] = Math.sqrt(gradX[y][x] ** 2 + gradY[y][x] ** 2);
    }
  }
  maps.push(magnitude);

  // Maps 4-6: Block variance
  for (const blockSize of [2, 4, 8]) {
    const blockVar: number[][] = [];
    for (let y = 0; y < h; y++) {
      blockVar[y] = [];
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let count = 0;
        for (let dy = 0; dy < blockSize && y + dy < h; dy++) {
          for (let dx = 0; dx < blockSize && x + dx < w; dx++) {
            sum += coefficients[y + dy][x + dx];
            count++;
          }
        }
        const mean = sum / count;
        let variance = 0;
        for (let dy = 0; dy < blockSize && y + dy < h; dy++) {
          for (let dx = 0; dx < blockSize && x + dx < w; dx++) {
            variance += (coefficients[y + dy][x + dx] - mean) ** 2;
          }
        }
        blockVar[y][x] = variance / count;
      }
    }
    maps.push(blockVar);
  }

  // Maps 7-9: Threshold masks
  const sorted = coefficients.flat().sort((a, b) => a - b);
  for (const pct of [0.3, 0.5, 0.7]) {
    const thresh = sorted[Math.floor(sorted.length * pct)] || 0;
    const mask: number[][] = coefficients.map((row) =>
      row.map((v) => (v >= thresh ? 1 : 0))
    );
    maps.push(mask);
  }

  // Map 10: Laplacian
  const laplacian: number[][] = [];
  for (let y = 0; y < h; y++) {
    laplacian[y] = [];
    for (let x = 0; x < w; x++) {
      const center = coefficients[y][x];
      const up = y > 0 ? coefficients[y - 1][x] : center;
      const down = y < h - 1 ? coefficients[y + 1][x] : center;
      const left = x > 0 ? coefficients[y][x - 1] : center;
      const right = x < w - 1 ? coefficients[y][x + 1] : center;
      laplacian[y][x] = 4 * center - up - down - left - right;
    }
  }
  maps.push(laplacian);

  // Map 11: Gaussian blur
  const gaussian: number[][] = [];
  const kernel = [[1, 2, 1], [2, 4, 2], [1, 2, 1]];
  for (let y = 0; y < h; y++) {
    gaussian[y] = [];
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const py = Math.min(h - 1, Math.max(0, y + ky));
          const px = Math.min(w - 1, Math.max(0, x + kx));
          sum += coefficients[py][px] * kernel[ky + 1][kx + 1];
        }
      }
      gaussian[y][x] = sum / 16;
    }
  }
  maps.push(gaussian);

  // Map 12: Local contrast
  const contrast: number[][] = [];
  for (let y = 0; y < h; y++) {
    contrast[y] = [];
    for (let x = 0; x < w; x++) {
      let min = Infinity;
      let max = -Infinity;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const py = Math.min(h - 1, Math.max(0, y + dy));
          const px = Math.min(w - 1, Math.max(0, x + dx));
          const v = coefficients[py][px];
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      contrast[y][x] = max - min;
    }
  }
  maps.push(contrast);

  // Map 13: Normalized
  const flat = coefficients.flat();
  const cMin = Math.min(...flat);
  const cMax = Math.max(...flat);
  const cRange = cMax - cMin || 1;
  const normalized: number[][] = coefficients.map((row) =>
    row.map((v) => (v - cMin) / cRange)
  );
  maps.push(normalized);

  // Map 14: Inverted
  const inverted: number[][] = coefficients.map((row) =>
    row.map((v) => cMax - v + cMin)
  );
  maps.push(inverted);

  // Map 15: Absolute gradient
  const absGrad: number[][] = [];
  for (let y = 0; y < h; y++) {
    absGrad[y] = [];
    for (let x = 0; x < w; x++) {
      absGrad[y][x] = (Math.abs(gradX[y][x]) + Math.abs(gradY[y][x])) / 2;
    }
  }
  maps.push(absGrad);

  return maps;
}
