import React, { useState, useEffect } from 'react';
import WheelPicker from './WheelPicker';

export default function WheelPickerModal({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  selectedIndex, 
  onChange,
  unit = ''
}) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(selectedIndex);
    }
  }, [isOpen, selectedIndex]);

  if (!isOpen) return null;

  const handleChange = (changeData) => {
    if (changeData.index !== undefined) {
      setCurrentIndex(changeData.index);
    } else {
      // Fallback: find index by value
      const foundIndex = data.findIndex(opt => opt.value === changeData.value);
      if (foundIndex >= 0) {
        setCurrentIndex(foundIndex);
      }
    }
    onChange(changeData);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Wheel Picker */}
          <div className="p-6 flex justify-center">
            <div className="wheel-picker-container">
              <WheelPicker
                data={data}
                selectedIndex={currentIndex}
                onChange={handleChange}
                height={220}
                itemHeight={44}
              />
            </div>
          </div>

          {/* Footer with current value */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {data[currentIndex]?.label || data[currentIndex]?.value} {unit}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Scroll to select
              </p>
            </div>
          </div>

          {/* Done Button */}
          <div className="p-4 pt-0">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
