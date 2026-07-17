'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface InputSectionProps {
  onImageSelect: (file: File) => void;
  onMessageChange: (message: string) => void;
  onThresholdChange: (value: number) => void;
  onStart: () => void;
  imagePreview: string | null;
  message: string;
  threshold: number;
  isProcessing: boolean;
}

export default function InputSection({
  onImageSelect,
  onMessageChange,
  onThresholdChange,
  onStart,
  imagePreview,
  message,
  threshold,
  isProcessing,
}: InputSectionProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'] },
    multiple: false,
  });

  const [thresholdLabel, setThresholdLabel] = useState('Coarse');

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onThresholdChange(val);
    if (val <= 25) setThresholdLabel('Fine');
    else if (val <= 50) setThresholdLabel('Coarse');
    else setThresholdLabel('Very Coarse');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold gradient-text">Input Configuration</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-200">Cover Image</label>
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-accent-cyan bg-accent-cyan/5'
                : 'border-dark-700 hover:border-dark-500 hover:bg-dark-900/50'
            }`}
          >
            <input {...getInputProps()} />
            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
                <p className="text-xs text-dark-400">Click or drop to replace</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 mx-auto rounded-xl bg-dark-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-dark-300">
                    {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-dark-500 mt-1">PNG, JPG, BMP, TIFF</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-200">Secret Message</label>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Enter your secret message..."
              rows={6}
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 resize-none transition-colors"
            />
            <div className="absolute bottom-3 right-3 text-xs text-dark-500">
              {message.length} chars · {message.length * 8} bits
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-dark-200">
            CNN Threshold: <span className="text-accent-cyan">{threshold}%</span>
          </label>
          <span className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-dark-400">
            {thresholdLabel}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={10}
            max={90}
            value={threshold}
            onChange={handleThresholdChange}
            className="w-full h-2 bg-dark-800 rounded-full appearance-none cursor-pointer accent-accent-cyan"
          />
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>90%</span>
          </div>
        </div>
        <p className="text-xs text-dark-500">
          Lower = more selective (better quality). Higher = more capacity (lower quality).
        </p>
      </div>

      {/* Start Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        disabled={!imagePreview || !message || isProcessing}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 hover:shadow-lg hover:shadow-accent-cyan/25"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          'Start Embedding Process'
        )}
      </motion.button>
    </motion.div>
  );
}
