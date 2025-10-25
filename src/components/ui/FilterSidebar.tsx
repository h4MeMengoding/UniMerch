'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
import { useEffect } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export interface FilterSection {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterSection[];
  onApply?: (selectedFilters: Record<string, string[]>, priceRange: { min: number; max: number }) => void;
}

export default function FilterSidebar({ isOpen, onClose, filters, onApply }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'price']);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });

  // Initialize price range from provided filters (if any)
  useEffect(() => {
    const priceSection = filters.find(f => f.type === 'range');
    if (priceSection) {
      setPriceRange({ min: priceSection.min ?? 0, max: priceSection.max ?? 1000000 });
    }
  }, [filters]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleFilterChange = (sectionId: string, optionId: string, isChecked: boolean) => {
    setSelectedFilters(prev => {
      const currentSelection = prev[sectionId] || [];
      
      if (isChecked) {
        return {
          ...prev,
          [sectionId]: [...currentSelection, optionId]
        };
      } else {
        return {
          ...prev,
          [sectionId]: currentSelection.filter(id => id !== optionId)
        };
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setPriceRange({ min: 0, max: 1000000 });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-dark-700">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Filter</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAllFilters}
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            aria-label="Hapus semua filter"
          >
            Hapus Semua
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
            aria-label="Tutup filter"
          >
            <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {filters.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b border-neutral-200 dark:border-dark-700 pb-6 last:border-b-0"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full text-left group"
                aria-expanded={expandedSections.includes(section.id)}
              >
                <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {section.title}
                </h3>
                <motion.div
                  animate={{ rotate: expandedSections.includes(section.id) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                </motion.div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {expandedSections.includes(section.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3"
                  >
                    {/* Checkbox/Radio Options */}
                    {section.type === 'checkbox' && section.options && (
                      <div className="space-y-3">
                        {section.options.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center space-x-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters[section.id]?.includes(option.id) || false}
                              onChange={(e) => handleFilterChange(section.id, option.id, e.target.checked)}
                              className="w-4 h-4 text-primary-600 dark:text-primary-400 border-neutral-300 dark:border-dark-600 rounded dark:bg-dark-700"
                              aria-describedby={`${option.id}-count`}
                            />
                            <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                              {option.label}
                            </span>
                            <span
                              id={`${option.id}-count`}
                              className="text-xs text-neutral-500 dark:text-neutral-400"
                            >
                              ({option.count})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Price Range */}
                    {section.type === 'range' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor={`${section.id}-min`} className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                              Harga Minimum
                            </label>
                            <input
                              id={`${section.id}-min`}
                              type="number"
                              value={priceRange.min}
                              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                              className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-md text-sm focus:outline-none dark:bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label htmlFor={`${section.id}-max`} className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                              Harga Maksimum
                            </label>
                            <input
                              id={`${section.id}-max`}
                              type="number"
                              value={priceRange.max}
                              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                              className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-md text-sm focus:outline-none dark:bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                              placeholder="1000000"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          Rentang: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                        </div>
                      </div>
                    )}

                    {/* (color filter removed) */}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <div className="p-6 border-t border-neutral-200 dark:border-dark-700">
        <motion.button
          onClick={() => {
            onApply?.(selectedFilters, priceRange);
            onClose();
          }}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Terapkan Filter
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay for both mobile and desktop when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Sidebar (used for both mobile and desktop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="fixed left-0 top-0 w-80 bg-white dark:bg-dark-900 h-full z-50 shadow-xl"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

