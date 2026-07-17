'use client';

import { motion } from 'framer-motion';

interface TheoreticalExplainProps {
  title: string;
  explanation: string;
  formula?: string;
  reference?: string;
  icon?: 'info' | 'formula' | 'lightbulb';
}

const iconMap = {
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  formula: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  lightbulb: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

export default function TheoreticalExplain({
  title,
  explanation,
  formula,
  reference,
  icon = 'info',
}: TheoreticalExplainProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-accent-cyan">{iconMap[icon]}</span>
        <h4 className="text-sm font-medium text-dark-100">{title}</h4>
      </div>
      <p className="text-sm text-dark-300 leading-relaxed">{explanation}</p>
      {formula && (
        <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700/30">
          <code className="text-xs text-accent-blue font-mono">{formula}</code>
        </div>
      )}
      {reference && (
        <p className="text-xs text-dark-500 italic">
          Sumber: {reference}
        </p>
      )}
    </motion.div>
  );
}
