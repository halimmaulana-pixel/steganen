'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface StegoUploadProps {
  onImageSelect: (file: File) => void;
  imagePreview: string | null;
  isProcessing: boolean;
}

export default function StegoUpload({
  onImageSelect,
  imagePreview,
  isProcessing,
}: StegoUploadProps) {
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
    disabled: isProcessing,
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-dark-200">Stego Image</label>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-accent-cyan bg-accent-cyan/5'
            : 'border-dark-700 hover:border-dark-500 hover:bg-dark-900/50'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {imagePreview ? (
          <div className="space-y-3">
            <img
              src={imagePreview}
              alt="Stego Preview"
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
            <p className="text-xs text-dark-400">Click or drop to replace</p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-dark-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-300">
                {isDragActive ? 'Drop stego image here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-dark-500 mt-1">PNG, JPG, BMP, TIFF</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
