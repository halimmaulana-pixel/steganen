'use client';

import { motion } from 'framer-motion';

interface ExtractStepsProps {
  currentStep: number;
}

const STEPS = [
  { label: 'CNN Extraction', icon: '🧠' },
  { label: 'Binary Map', icon: '🗺️' },
  { label: 'Read Bits', icon: '💾' },
  { label: 'Convert to Text', icon: '📝' },
];

export default function ExtractSteps({ currentStep }: ExtractStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-dark-800" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? '#06d6a0'
                    : isActive
                    ? '#8338ec'
                    : '#262626',
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors"
                style={{
                  borderColor: isCompleted
                    ? '#06d6a0'
                    : isActive
                    ? '#8338ec'
                    : '#404040',
                }}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-dark-400">{index + 1}</span>
                )}
              </motion.div>
              <div className="text-center">
                <span className="text-lg">{step.icon}</span>
                <p
                  className={`text-xs mt-1 whitespace-nowrap ${
                    isActive
                      ? 'text-accent-purple font-medium'
                      : isCompleted
                      ? 'text-dark-200'
                      : 'text-dark-500'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
