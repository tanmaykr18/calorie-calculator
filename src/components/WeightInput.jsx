import React, { useMemo, useState } from 'react';
import WheelPickerModal from './WheelPickerModal';

export default function WeightInput({ weight, onWeightChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate weight options: 30-200 kg with 0.5 step for better UX
  const weightOptions = useMemo(() => {
    const options = [];
    for (let i = 30; i <= 200; i += 0.5) {
      options.push({ value: parseFloat(i.toFixed(1)), label: `${i.toFixed(1)}` });
    }
    return options;
  }, []);

  // Get current weight value or default to 85
  const currentWeight = weight && !isNaN(weight) && weight >= 30 && weight <= 200 
    ? parseFloat(Number(weight).toFixed(1)) 
    : 85;
  
  // Find the closest matching index
  const getSelectedIndex = () => {
    const exactIndex = weightOptions.findIndex(opt => opt.value === currentWeight);
    if (exactIndex >= 0) return exactIndex;
    // Find closest value
    const closestIndex = weightOptions.findIndex(opt => opt.value >= currentWeight);
    return closestIndex >= 0 ? closestIndex : weightOptions.length - 1;
  };

  const selectedIndex = useMemo(() => getSelectedIndex(), [currentWeight, weightOptions]);

  const handleWeightChange = (data) => {
    // Ensure value is within valid range
    const validValue = Math.max(30, Math.min(200, parseFloat(data.value.toFixed(1))));
    onWeightChange(validValue);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Body Weight
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tap the weight to select (30-200 kg)
            </p>
          </div>

          {/* Clickable weight display */}
          <div className="text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {currentWeight.toFixed(1)}
              </span>
              <span className="text-xl font-semibold text-slate-600 dark:text-slate-300">
                kg
              </span>
              <span className="text-blue-500 text-lg">⌄</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <WheelPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Weight"
        data={weightOptions}
        selectedIndex={selectedIndex}
        onChange={handleWeightChange}
        unit="kg"
      />
    </>
  )
}
