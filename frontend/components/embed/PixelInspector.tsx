'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PixelInspectorProps {
  originalImageUrl: string | null;
  stegoImageUrl: string | null;
}

interface PixelData {
  x: number;
  y: number;
  original: { r: number; g: number; b: number };
  stego: { r: number; g: number; b: number };
}

function toBinary(value: number): string {
  return value.toString(2).padStart(8, '0');
}

function countChangedBits(a: number, b: number): number {
  return (a ^ b).toString(2).split('1').length - 1;
}

export default function PixelInspector({
  originalImageUrl,
  stegoImageUrl,
}: PixelInspectorProps) {
  const [pixel, setPixel] = useState<PixelData | null>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const stegoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [origLoaded, setOrigLoaded] = useState(false);
  const [stegoLoaded, setStegoLoaded] = useState(false);

  const handleImageLoad = useCallback(
    (which: 'orig' | 'stego', img: HTMLImageElement) => {
      const canvasRef = which === 'orig' ? origCanvasRef : stegoCanvasRef;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 224;
      canvas.height = 224;
      ctx.drawImage(img, 0, 0, 224, 224);

      if (which === 'orig') setOrigLoaded(true);
      else setStegoLoaded(true);
    },
    []
  );

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!origLoaded || !stegoLoaded) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / rect.width) * 224);
      const y = Math.floor(((e.clientY - rect.top) / rect.height) * 224);

      const origCanvas = origCanvasRef.current;
      const stegoCanvas = stegoCanvasRef.current;
      if (!origCanvas || !stegoCanvas) return;

      const origCtx = origCanvas.getContext('2d');
      const stegoCtx = stegoCanvas.getContext('2d');
      if (!origCtx || !stegoCtx) return;

      const origData = origCtx.getImageData(x, y, 1, 1).data;
      const stegoData = stegoCtx.getImageData(x, y, 1, 1).data;

      setPixel({
        x,
        y,
        original: { r: origData[0], g: origData[1], b: origData[2] },
        stego: { r: stegoData[0], g: stegoData[1], b: stegoData[2] },
      });
    },
    [origLoaded, stegoLoaded]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-dark-200">Pixel Inspector</h3>

      {/* Hidden canvases for image processing */}
      <canvas ref={origCanvasRef} className="hidden" />
      <canvas ref={stegoCanvasRef} className="hidden" />

      {/* Load images */}
      {originalImageUrl && (
        <img
          src={originalImageUrl}
          alt=""
          className="hidden"
          onLoad={(e) => handleImageLoad('orig', e.target as HTMLImageElement)}
        />
      )}
      {stegoImageUrl && (
        <img
          src={stegoImageUrl}
          alt=""
          className="hidden"
          onLoad={(e) => handleImageLoad('stego', e.target as HTMLImageElement)}
        />
      )}

      {origLoaded && stegoLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clickable image */}
          <div
            className="relative cursor-crosshair rounded-xl overflow-hidden border border-dark-700"
            onClick={handleImageClick}
          >
            {originalImageUrl && (
              <img
                src={originalImageUrl}
                alt="Click to inspect"
                className="w-full h-auto"
              />
            )}
            {pixel && (
              <div
                className="absolute border-2 border-accent-cyan pointer-events-none"
                style={{
                  left: `${(pixel.x / 224) * 100}%`,
                  top: `${(pixel.y / 224) * 100}%`,
                  width: `${(1 / 224) * 100}%`,
                  height: `${(1 / 224) * 100}%`,
                  minWidth: '8px',
                  minHeight: '8px',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
          </div>

          {/* Inspector panel */}
          <div className="space-y-3">
            {pixel ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-dark-900 rounded-xl border border-dark-700 p-4 space-y-4"
              >
                <div className="flex items-center gap-2 text-xs text-dark-400">
                  <span>Pixel ({pixel.x}, {pixel.y})</span>
                </div>

                {/* RGB Comparison Table */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-dark-400 border-b border-dark-700">
                      <th className="py-1 text-left">Channel</th>
                      <th className="py-1 text-right">Original</th>
                      <th className="py-1 text-right">Stego</th>
                      <th className="py-1 text-center">Changed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['r', 'g', 'b'] as const).map((ch) => {
                      const origVal = pixel.original[ch];
                      const stegoVal = pixel.stego[ch];
                      const changed = origVal !== stegoVal;
                      const changedBits = countChangedBits(origVal, stegoVal);

                      return (
                        <tr key={ch} className="border-b border-dark-800">
                          <td className="py-1.5 uppercase font-mono text-dark-300">{ch}</td>
                          <td className="py-1.5 text-right font-mono text-dark-200">
                            {origVal}
                            <span className="text-dark-500 ml-1">0b{toBinary(origVal)}</span>
                          </td>
                          <td className="py-1.5 text-right font-mono text-dark-200">
                            {stegoVal}
                            <span className="text-dark-500 ml-1">0b{toBinary(stegoVal)}</span>
                          </td>
                          <td className="py-1.5 text-center">
                            {changed ? (
                              <span className="text-accent-pink text-[10px] font-bold">
                                {changedBits} bit{changedBits > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-dark-600">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* LSB Explanation */}
                <div className="bg-dark-950 rounded-lg p-3 text-xs text-dark-400 space-y-1">
                  <p className="text-dark-200 font-medium">LSB Operation Theory</p>
                  <p>
                    <span className="text-accent-cyan">Original:</span>{' '}
                    <code className="bg-dark-800 px-1 rounded">0b{toBinary(pixel.original.r)}</code> →
                    LSB = {pixel.original.r & 1}
                  </p>
                  <p>
                    <span className="text-accent-purple">Modified:</span>{' '}
                    <code className="bg-dark-800 px-1 rounded">0b{toBinary(pixel.stego.r)}</code> →
                    LSB = {pixel.stego.r & 1}
                  </p>
                  <p className="text-dark-500">
                    Message bit replaces the LSB (bit 0) of each selected pixel.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-dark-900 rounded-xl border border-dark-700 border-dashed">
                <p className="text-dark-500 text-sm">Click on the image to inspect a pixel</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 bg-dark-900 rounded-xl border border-dark-700">
          <p className="text-dark-500 text-sm">Upload an image to enable pixel inspection</p>
        </div>
      )}
    </div>
  );
}
