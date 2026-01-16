import React from 'react';

export default function ResultsList({ results, totalCalories }) {
  if (results.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Workout Results</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Summary of your workout performance</p>
      </div>

      {/* Per-set results */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <span className="font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200">Set {index + 1}</span>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Calories</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {result.calories.toFixed(1)} kcal
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Distance</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{result.distance.toFixed(2)} km</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">METs</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{result.mets.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total calories - Featured */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-4 sm:p-6 text-center shadow-lg mb-4">
        <p className="text-blue-100 text-xs sm:text-sm font-semibold mb-1 sm:mb-2 uppercase tracking-wide">Total Calories Burned</p>
        <p className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">{totalCalories.toFixed(1)}</p>
        <p className="text-blue-100 text-xs sm:text-sm mt-1 sm:mt-2">kcal</p>
      </div>

      {/* Accuracy disclaimer */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
          <span className="font-semibold">Note:</span> ±5-10% estimate using ACSM metabolic equations. Individual
          metabolism varies.
        </p>
      </div>
    </div>
  )
}
