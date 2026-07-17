'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageResultProps {
  message: string | null;
  bitCount: number | null;
  charCount: number | null;
  isSuccess: boolean;
}

export default function MessageResult({
  message,
  bitCount,
  charCount,
  isSuccess,
}: MessageResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!message) return;
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_message.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold gradient-text">Extracted Message</h2>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isSuccess
              ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
              : 'bg-accent-pink/10 text-accent-pink border border-accent-pink/30'
          }`}
        >
          {isSuccess ? '✓ Success' : '✗ Failed'}
        </span>
      </div>

      {/* Message Display */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
        {message ? (
          <div className="space-y-4">
            <div className="bg-dark-950 rounded-lg p-4 min-h-[120px]">
              <pre className="text-sm text-dark-100 whitespace-pre-wrap font-mono break-words">
                {message}
              </pre>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-xs text-dark-400">
              <span>
                Characters: <span className="text-dark-200 font-medium">{charCount ?? message.length}</span>
              </span>
              <span>
                Bits: <span className="text-dark-200 font-medium">{bitCount ?? message.length * 8}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 hover:shadow-lg hover:shadow-accent-cyan/25 transition-shadow"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.svg
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </motion.svg>
                  )}
                </AnimatePresence>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-dark-600 text-dark-200 hover:bg-dark-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download as .txt
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-dark-500 text-sm">
            Extracted message will appear here
          </div>
        )}
      </div>
    </motion.div>
  );
}
