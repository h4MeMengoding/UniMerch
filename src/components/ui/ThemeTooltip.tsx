'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import NextImage from 'next/image';

interface ThemeTooltipProps {
  isVisible: boolean;
  onClose: () => void;
}

export function ThemeTooltip({ isVisible, onClose }: ThemeTooltipProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-12 -right-8 w-40 bg-white dark:bg-dark-800 rounded-lg shadow-2xl border border-neutral-200 dark:border-dark-700 p-4 z-50 ring-1 ring-black/5 dark:ring-white/10"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Text */}
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
                Xilauu? 😎
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                klik button diatas biar gx xilau
              </p>

              {/* Meme Image */}
              <div className="mb-3">
                <NextImage 
                  src="/meme-light-mode.png" 
                  alt="Light mode meme"
                  width={128}
                  height={128}
                  className="w-full max-w-32 mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Arrow pointing to theme button */}
            <div className="absolute top-0 right-10 transform -translate-y-2">
              <div 
                className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-dark-800"
                style={{
                  filter: 'drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1))'
                }}
              ></div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}