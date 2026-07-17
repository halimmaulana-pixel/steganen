'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import StegoUpload from '@/components/extract/StegoUpload';
import MetadataInput from '@/components/extract/MetadataInput';
import ExtractSteps from '@/components/extract/ExtractSteps';
import MessageResult from '@/components/extract/MessageResult';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ExtractState {
  step: number;
  processing: boolean;
  error: string | null;
  extractedMessage: string | null;
  bitCount: number | null;
  charCount: number | null;
  success: boolean;
}

export default function ExtractPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);
  const [metadata, setMetadata] = useState({
    threshold_percent: 30,
    message_length_bits: 0,
  });
  const [state, setState] = useState<ExtractState>({
    step: -1,
    processing: false,
    error: null,
    extractedMessage: null,
    bitCount: null,
    charCount: null,
    success: false,
  });

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setState((prev) => ({
      ...prev,
      step: -1,
      extractedMessage: null,
      error: null,
    }));
  }, []);

  const simulateSteps = async () => {
    const steps = [0, 1, 2, 3];
    for (let i = 0; i < steps.length; i++) {
      setState((prev) => ({ ...prev, step: steps[i] }));
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const handleStart = async () => {
    if (!imageFile) return;
    if (!metadata.message_length_bits || metadata.message_length_bits <= 0) {
      setState((prev) => ({
        ...prev,
        error: 'Please specify message length in bits',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      processing: true,
      error: null,
      step: 0,
      extractedMessage: null,
    }));

    try {
      await simulateSteps();

      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

      const stegoImage = await toBase64(imageFile);

      const response = await axios.post(`${API_URL}/api/v1/extract`, {
        stego_image: stegoImage,
        metadata: {
          threshold_percent: metadata.threshold_percent,
          message_length_bits: metadata.message_length_bits,
        },
      });

      const data = response.data as Record<string, unknown>;
      const innerData = (data.data || data) as Record<string, unknown>;
      const message = (innerData.message || innerData.extracted_message || innerData.payload || '') as string;

      setState((prev) => ({
        ...prev,
        step: 3,
        processing: false,
        extractedMessage: message,
        bitCount: (innerData.bit_count as number) ?? metadata.message_length_bits,
        charCount: message.length,
        success: true,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Extraction failed';
      setState((prev) => ({
        ...prev,
        processing: false,
        error: errorMsg,
        step: -1,
        success: false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold gradient-text">Message Extraction</h1>
          <p className="text-dark-400 text-sm max-w-2xl mx-auto">
            Extract a hidden message from a stego image using the same CNN-guided LSB process.
            Provide the stego image and metadata for extraction.
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
        <section className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-6">
          <StegoUpload
            onImageSelect={handleImageSelect}
            imagePreview={imagePreview}
            isProcessing={state.processing}
          />

          <MetadataInput
            onMetadataChange={setMetadata}
            metadata={metadata}
            disabled={state.processing}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={!imageFile || state.processing}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-accent-purple to-accent-cyan text-dark-950 hover:shadow-lg hover:shadow-accent-purple/25"
          >
            {state.processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Extracting...
              </span>
            ) : (
              'Start Extraction'
            )}
          </motion.button>
        </section>

        {/* Section 2: Process Steps */}
        <AnimatePresence>
          {state.step >= 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
                <ExtractSteps currentStep={state.step} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 3: Output */}
        <section className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <MessageResult
            message={state.extractedMessage}
            bitCount={state.bitCount}
            charCount={state.charCount}
            isSuccess={state.success}
          />
        </section>
      </div>
    </div>
  );
}
