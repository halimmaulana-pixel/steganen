'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface MetadataInputProps {
  onMetadataChange: (metadata: { threshold_percent: number; message_length_bits: number }) => void;
  metadata: { threshold_percent: number; message_length_bits: number };
  disabled?: boolean;
}

export default function MetadataInput({
  onMetadataChange,
  metadata,
  disabled = false,
}: MetadataInputProps) {
  const [inputMode, setInputMode] = useState<'manual' | 'json'>('manual');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          onMetadataChange({
            threshold_percent: json.threshold_percent ?? 30,
            message_length_bits: json.message_length_bits ?? 0,
          });
          setJsonError(null);
        } catch {
          setJsonError('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    },
    [onMetadataChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled,
  });

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-dark-200">Metadata</label>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        {(['manual', 'json'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              inputMode === mode
                ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-500'
            }`}
          >
            {mode === 'manual' ? 'Manual Input' : 'Upload JSON'}
          </button>
        ))}
      </div>

      {inputMode === 'manual' ? (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="space-y-1">
            <label className="text-xs text-dark-400">Threshold (%)</label>
            <input
              type="number"
              min={10}
              max={90}
              value={metadata.threshold_percent}
              onChange={(e) =>
                onMetadataChange({
                  ...metadata,
                  threshold_percent: Number(e.target.value),
                })
              }
              disabled={disabled}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-accent-cyan/50 disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-dark-400">Message Length (bits)</label>
            <input
              type="number"
              min={0}
              value={metadata.message_length_bits}
              onChange={(e) =>
                onMetadataChange({
                  ...metadata,
                  message_length_bits: Number(e.target.value),
                })
              }
              disabled={disabled}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-accent-cyan/50 disabled:opacity-50"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-accent-cyan bg-accent-cyan/5'
                : 'border-dark-700 hover:border-dark-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <p className="text-xs text-dark-400">
              {isDragActive ? 'Drop JSON file here' : 'Drag & drop metadata JSON or click to browse'}
            </p>
          </div>
          {jsonError && (
            <p className="text-xs text-accent-pink mt-1">{jsonError}</p>
          )}
          {metadata.message_length_bits > 0 && !jsonError && (
            <div className="mt-2 text-xs text-dark-400 bg-dark-900 rounded-lg p-2 font-mono">
              threshold: {metadata.threshold_percent}% | bits: {metadata.message_length_bits}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
