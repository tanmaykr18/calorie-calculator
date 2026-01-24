import React, { useMemo, useState, useEffect } from 'react';
import WheelPickerModal from './WheelPickerModal';

export default function SetInput({ setNumber, set, onUpdate, onRemove, canRemove }) {
  const [inclineModalOpen, setInclineModalOpen] = useState(false);
  const [speedModalOpen, setSpeedModalOpen] = useState(false);
  const [minutesModalOpen, setMinutesModalOpen] = useState(false);
  const [secondsModalOpen, setSecondsModalOpen] = useState(false);

  // Close all modals if set becomes invalid (e.g., after deletion)
  useEffect(() => {
    if (!set) {
      setInclineModalOpen(false);
      setSpeedModalOpen(false);
      setMinutesModalOpen(false);
      setSecondsModalOpen(false);
    }
  }, [set]);

  // Generate incline options: 0-25% (step 1)
  const inclineOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i <= 25; i++) {
      options.push({ value: i, label: `${i}` });
    }
    return options;
  }, []);

  // Generate speed options: 1-20 km/h (step 0.1)
  const speedOptions = useMemo(() => {
    const options = [];
    for (let i = 10; i <= 200; i++) {
      const value = i / 10;
      options.push({ value: parseFloat(value.toFixed(1)), label: `${value.toFixed(1)}` });
    }
    return options;
  }, []);

  // Safety check: ensure set exists
  if (!set) {
    return null;
  }

  const currentIncline = Math.round(set.incline || 0);
  const currentSpeed = parseFloat((set.speed || 5).toFixed(1));

  // Generate minutes options: 0-120 (step 1)
  const minutesOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i <= 120; i++) {
      options.push({ value: i, label: `${i}` });
    }
    return options;
  }, []);

  // Generate seconds options: 0-59 (step 1)
  const secondsOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i <= 59; i++) {
      options.push({ value: i, label: `${i}` });
    }
    return options;
  }, []);

  const currentMinutes = set.timeMinutes !== undefined ? set.timeMinutes : (set.time ? Math.floor(set.time) : 30);
  const currentSeconds = set.timeSeconds !== undefined ? set.timeSeconds : (set.time ? Math.round((set.time % 1) * 60) : 0);

  const inclineSelectedIndex = inclineOptions.findIndex(opt => opt.value === currentIncline) >= 0 
    ? inclineOptions.findIndex(opt => opt.value === currentIncline) 
    : 0;
  const speedSelectedIndex = speedOptions.findIndex(opt => opt.value === currentSpeed) >= 0 
    ? speedOptions.findIndex(opt => opt.value === currentSpeed) 
    : 0;
  const minutesSelectedIndex = minutesOptions.findIndex(opt => opt.value === currentMinutes) >= 0 
    ? minutesOptions.findIndex(opt => opt.value === currentMinutes) 
    : 30;
  const secondsSelectedIndex = secondsOptions.findIndex(opt => opt.value === currentSeconds) >= 0 
    ? secondsOptions.findIndex(opt => opt.value === currentSeconds) 
    : 0;
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Set {setNumber}</h3>
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors duration-200 font-bold text-lg leading-none"
            aria-label="Remove set"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Incline - Clickable Display */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Incline
          </label>
          <button
            onClick={() => setInclineModalOpen(true)}
            className="w-full px-4 py-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-between"
          >
            <span className="text-slate-600 dark:text-slate-300">Tap to select incline</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {currentIncline}
              </span>
              <span className="text-lg font-semibold text-slate-600 dark:text-slate-300">%</span>
              <span className="text-blue-500 text-lg">⌄</span>
            </div>
          </button>
        </div>

        {/* Speed - Clickable Display */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Speed
          </label>
          <button
            onClick={() => setSpeedModalOpen(true)}
            className="w-full px-4 py-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-between"
          >
            <span className="text-slate-600 dark:text-slate-300">Tap to select speed</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {currentSpeed.toFixed(1)}
              </span>
              <span className="text-lg font-semibold text-slate-600 dark:text-slate-300">km/h</span>
              <span className="text-blue-500 text-lg">⌄</span>
            </div>
          </button>
        </div>

        {/* Time - Clickable Displays */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Duration</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Minutes</label>
              <button
                onClick={() => setMinutesModalOpen(true)}
                className="w-full px-3 py-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-between"
              >
                <span className="text-slate-600 dark:text-slate-300 text-xs">Tap</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentMinutes}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">min</span>
                  <span className="text-blue-500 text-sm">⌄</span>
                </div>
              </button>
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Seconds</label>
              <button
                onClick={() => setSecondsModalOpen(true)}
                className="w-full px-3 py-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-between"
              >
                <span className="text-slate-600 dark:text-slate-300 text-xs">Tap</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentSeconds}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">sec</span>
                  <span className="text-blue-500 text-sm">⌄</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incline Modal */}
      <WheelPickerModal
        isOpen={inclineModalOpen}
        onClose={() => setInclineModalOpen(false)}
        title="Select Incline"
        data={inclineOptions}
        selectedIndex={inclineSelectedIndex >= 0 ? inclineSelectedIndex : 0}
        onChange={(data) => onUpdate("incline", data.value)}
        unit="%"
      />

      {/* Speed Modal */}
      <WheelPickerModal
        isOpen={speedModalOpen}
        onClose={() => setSpeedModalOpen(false)}
        title="Select Speed"
        data={speedOptions}
        selectedIndex={speedSelectedIndex >= 0 ? speedSelectedIndex : 0}
        onChange={(data) => onUpdate("speed", data.value)}
        unit="km/h"
      />

      {/* Minutes Modal */}
      <WheelPickerModal
        isOpen={minutesModalOpen}
        onClose={() => setMinutesModalOpen(false)}
        title="Select Minutes"
        data={minutesOptions}
        selectedIndex={minutesSelectedIndex >= 0 ? minutesSelectedIndex : 30}
        onChange={(data) => onUpdate("timeMinutes", data.value)}
        unit="min"
      />

      {/* Seconds Modal */}
      <WheelPickerModal
        isOpen={secondsModalOpen}
        onClose={() => setSecondsModalOpen(false)}
        title="Select Seconds"
        data={secondsOptions}
        selectedIndex={secondsSelectedIndex >= 0 ? secondsSelectedIndex : 0}
        onChange={(data) => onUpdate("timeSeconds", data.value)}
        unit="sec"
      />
    </div>
  )
}
