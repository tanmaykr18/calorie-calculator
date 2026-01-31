import React, { useState } from 'react';

export default function ResultsList({ results, totalCalories, sets }) {
  const [copied, setCopied] = useState(false);

  if (results.length === 0) {
    return null
  }

  // Format time from minutes and seconds
  const formatTime = (set) => {
    if (!set) return '0min';
    const minutes = set.timeMinutes !== undefined ? set.timeMinutes : (set.time ? Math.floor(set.time) : 0);
    const seconds = set.timeSeconds !== undefined ? set.timeSeconds : (set.time ? Math.round((set.time % 1) * 60) : 0);
    if (seconds > 0) {
      return `${minutes}min ${seconds}sec`;
    }
    return `${minutes}min`;
  };

  // Calculate averages and totals (with safety check for empty sets)
  const avgSpeed = sets.length > 0 ? sets.reduce((sum, set) => sum + set.speed, 0) / sets.length : 0;
  const avgIncline = sets.length > 0 ? sets.reduce((sum, set) => sum + Math.round(set.incline), 0) / sets.length : 0;
  const totalTimeMinutes = sets.reduce((sum, set) => {
    const minutes = set.timeMinutes !== undefined ? set.timeMinutes : (set.time ? Math.floor(set.time) : 0);
    const seconds = set.timeSeconds !== undefined ? set.timeSeconds : (set.time ? Math.round((set.time % 1) * 60) : 0);
    return sum + minutes + (seconds / 60);
  }, 0);

  // Copy to clipboard function
  const copyToClipboard = async () => {
    if (sets.length === 0 || results.length === 0) return;
    
    let text = '';
    
    // Format each set
    sets.forEach((set, index) => {
      const minutes = set.timeMinutes !== undefined ? set.timeMinutes : (set.time ? Math.floor(set.time) : 0);
      const seconds = set.timeSeconds !== undefined ? set.timeSeconds : (set.time ? Math.round((set.time % 1) * 60) : 0);
      const totalMinutes = minutes + (seconds / 60);
      const incline = Math.round(set.incline);
      const speed = set.speed.toFixed(1);
      const calories = results[index]?.calories.toFixed(1) || '0.0';
      
      // Format time: show as whole minutes if no seconds, otherwise show decimal
      const timeStr = seconds === 0 ? `${minutes}mins` : `${totalMinutes.toFixed(1)}min`;
      
      const calPerMin = results[index]?.caloriesPerMinute?.toFixed(1) || (parseFloat(calories) / totalMinutes).toFixed(1);
      
      text += `set${index + 1}:- speed ${speed}km/hr | ${incline}incline | ${timeStr} | ${calories} calories | ${calPerMin} cal/min\n`;
    });
    
    // Add totals with actual calculated values (same as shown in summary)
    const totalMins = Math.floor(totalTimeMinutes);
    const totalSecs = Math.round((totalTimeMinutes % 1) * 60);
    const timeStr = totalSecs > 0 ? `${totalMins}min ${totalSecs}sec` : `${totalMins}min`;
    
    // Use the actual calculated values from the summary
    text += `total:- avg speed ${avgSpeed.toFixed(1)}km/hr | avg incline ${avgIncline.toFixed(0)}incline | total time ${timeStr} | total calories ${totalCalories.toFixed(1)} calories`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Workout Results</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Summary of your workout performance</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors duration-200"
            aria-label="Copy results to clipboard"
            title="Copy workout details"
          >
            {copied ? (
              <span className="text-lg">✓</span>
            ) : (
              <span className="text-lg">📋</span>
            )}
          </button>
        </div>
      </div>

      {/* Per-set results */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200">Set {index + 1}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Speed</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {sets[index]?.speed.toFixed(1)} km/h
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Incline</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(sets[index]?.incline || 0)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Time</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatTime(sets[index])}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Calories</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {result.calories.toFixed(1)} kcal
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Cal/Min</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {result.caloriesPerMinute?.toFixed(1) || (result.calories / ((sets[index]?.timeMinutes || 0) + (sets[index]?.timeSeconds || 0) / 60)).toFixed(1)} /min
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Distance</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{result.distance.toFixed(2)} km</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary - Featured */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-4 sm:p-6 text-center shadow-lg mb-4">
        <p className="text-blue-100 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 uppercase tracking-wide">Total Summary</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
          <div>
            <p className="text-blue-100 text-xs font-medium mb-1">Avg Speed</p>
            <p className="text-white text-lg sm:text-xl font-bold">{avgSpeed.toFixed(1)} km/h</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs font-medium mb-1">Avg Incline</p>
            <p className="text-white text-lg sm:text-xl font-bold">{avgIncline.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs font-medium mb-1">Total Time</p>
            <p className="text-white text-lg sm:text-xl font-bold">
              {Math.floor(totalTimeMinutes)}min {Math.round((totalTimeMinutes % 1) * 60)}sec
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-xs font-medium mb-1">Total Calories</p>
            <p className="text-white text-lg sm:text-xl font-bold">{totalCalories.toFixed(1)} kcal</p>
          </div>
        </div>
      </div>

      {/* Accuracy disclaimer */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
          <span className="font-semibold">Note:</span> Calories shown are NET (active only, BMR excluded). ±5-10% estimate using ACSM metabolic equations. Individual metabolism varies.
        </p>
      </div>
    </div>
  )
}
