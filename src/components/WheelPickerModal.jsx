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
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(selectedIndex);
      const currentValue = data[selectedIndex]?.value || data[selectedIndex]?.label || '';
      setInputValue(String(currentValue));
      setIsEditing(false);
    }
  }, [isOpen, selectedIndex, data]);

  if (!isOpen) return null;

  const handleChange = (changeData) => {
    if (changeData.index !== undefined) {
      setCurrentIndex(changeData.index);
      setInputValue(String(changeData.value));
    } else {
      // Fallback: find index by value
      const foundIndex = data.findIndex(opt => opt.value === changeData.value);
      if (foundIndex >= 0) {
        setCurrentIndex(foundIndex);
        setInputValue(String(changeData.value));
      }
    }
    onChange(changeData);
  };

  // Find closest value in data array
  const findClosestValue = (targetValue) => {
    const numericTarget = parseFloat(targetValue);
    if (isNaN(numericTarget)) return null;

    // Find exact match first
    const exactIndex = data.findIndex(opt => parseFloat(opt.value) === numericTarget);
    if (exactIndex >= 0) return exactIndex;

    // Find closest value
    let closestIndex = 0;
    let minDiff = Math.abs(parseFloat(data[0].value) - numericTarget);

    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(parseFloat(data[i].value) - numericTarget);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    return closestIndex;
  };

  // Handle manual input - real-time scrolling
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If input is empty or just whitespace, don't update
    if (!newValue.trim()) {
      return;
    }
    
    // Find closest value and scroll in real-time
    const closestIndex = findClosestValue(newValue);
    if (closestIndex !== null && closestIndex >= 0) {
      setCurrentIndex(closestIndex);
      const closestValue = data[closestIndex].value;
      
      // Update the wheel picker immediately
      onChange({
        value: closestValue,
        label: data[closestIndex].label,
        index: closestIndex
      });
    }
  };

  const handleInputSubmit = () => {
    // Finalize the value - snap to exact match if available
    const closestIndex = findClosestValue(inputValue);
    if (closestIndex !== null && closestIndex >= 0) {
      const closestValue = data[closestIndex].value;
      setInputValue(String(closestValue));
      setCurrentIndex(closestIndex);
      onChange({
        value: closestValue,
        label: data[closestIndex].label,
        index: closestIndex
      });
    } else {
      // Reset to current value if invalid
      const currentValue = data[currentIndex]?.value || data[currentIndex]?.label || '';
      setInputValue(String(currentValue));
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      const currentValue = data[currentIndex]?.value || data[currentIndex]?.label || '';
      setInputValue(String(currentValue));
      setIsEditing(false);
    }
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

          {/* Footer with editable value */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setIsEditing(true)}
                  onBlur={handleInputSubmit}
                  onKeyDown={handleInputKeyDown}
                  className="text-3xl font-bold text-blue-600 dark:text-blue-400 bg-transparent text-center border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg px-3 py-1 outline-none transition-colors w-32"
                  aria-label="Enter value"
                />
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {unit}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {isEditing ? 'Type to scroll in real-time' : 'Scroll or tap to edit'}
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
