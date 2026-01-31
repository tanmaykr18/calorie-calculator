import React, { useState } from 'react';

export default function AICalorieCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState(95);
  const [timeMinutes, setTimeMinutes] = useState(60);
  const [targetCalories, setTargetCalories] = useState(400);
  const [variations, setVariations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Calculate variations
  const calculateVariations = () => {
    const results = [];
    const timeHours = timeMinutes / 60;
    
    // Target METs needed: calories = (METs - 1) × weight × time
    // So: METs = (calories / (weight × time)) + 1
    const targetMETs = (targetCalories / (weight * timeHours)) + 1;
    const targetVO2 = targetMETs * 3.5;

    // Generate variations with different inclines
    // VO2 = 3.5 + (12 × speedMPerS) + (54 × speedMPerS × incline/100)
    // Solving for speed: speedMPerS = (VO2 - 3.5) / (12 + 54 × incline/100)
    
    const inclineOptions = [0, 2, 4, 6, 8, 10, 12, 15];
    
    inclineOptions.forEach(incline => {
      const gradeFraction = incline / 100;
      const denominator = 12 + (54 * gradeFraction);
      const speedMPerS = (targetVO2 - 3.5) / denominator;
      const speedKmh = speedMPerS * 3.6;
      
      // Only include realistic speeds (1-20 km/h)
      if (speedKmh >= 1 && speedKmh <= 20) {
        // Calculate actual calories for verification
        const actualVO2 = 3.5 + (12 * speedMPerS) + (54 * speedMPerS * gradeFraction);
        const actualMETs = actualVO2 / 3.5;
        const actualCalories = (actualMETs - 1) * weight * timeHours;
        
        results.push({
          speed: speedKmh,
          incline: incline,
          calories: actualCalories,
          mets: actualMETs,
          intensity: getIntensity(actualMETs)
        });
      }
    });

    // Sort by incline (easier options first)
    results.sort((a, b) => a.incline - b.incline);
    
    setVariations(results);
    setShowResults(true);
  };

  const getIntensity = (mets) => {
    if (mets < 3) return { label: 'Light', color: 'text-green-600 dark:text-green-400' };
    if (mets < 6) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    if (mets < 9) return { label: 'Vigorous', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Very Vigorous', color: 'text-red-600 dark:text-red-400' };
  };

  const handleCalculate = () => {
    if (weight >= 30 && weight <= 200 && timeMinutes >= 1 && targetCalories > 0) {
      calculateVariations();
    }
  };

  const resetForm = () => {
    setShowResults(false);
    setVariations([]);
  };

  return (
    <>
      {/* AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group active:scale-95"
        aria-label="AI Calorie Calculator"
        title="AI Calorie Calculator"
      >
        <span className="text-2xl">✨</span>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          AI
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <h2 className="text-2xl font-bold">AI Calorie Calculator</h2>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  className="text-white/80 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
              <p className="text-purple-100 text-sm">
                Find the perfect speed & incline combinations to hit your calorie goal
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!showResults ? (
                <div className="space-y-6">
                  {/* Input Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Your Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                        min="30"
                        max="200"
                        step="0.1"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Time Available (minutes)
                      </label>
                      <input
                        type="number"
                        value={timeMinutes}
                        onChange={(e) => setTimeMinutes(parseInt(e.target.value) || 0)}
                        min="1"
                        max="120"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Target Calories to Burn (kcal)
                      </label>
                      <input
                        type="number"
                        value={targetCalories}
                        onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
                        min="1"
                        max="2000"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <button
                    onClick={handleCalculate}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                  >
                    Generate Options ✨
                  </button>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-semibold">💡 Tip:</span> The AI will suggest various speed and incline combinations 
                      that burn your target calories. Choose the one that matches your fitness level!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Results Header */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4 mb-4">
                    <p className="text-sm text-purple-900 dark:text-purple-100 text-center">
                      <span className="font-bold">Target:</span> {targetCalories} kcal in {timeMinutes} min @ {weight} kg
                    </p>
                  </div>

                  {/* Variations */}
                  {variations.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                        Recommended Options:
                      </h3>
                      {variations.map((variation, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              Option {index + 1}
                            </span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-800 ${variation.intensity.color}`}>
                              {variation.intensity.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-xs">Speed</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                {variation.speed.toFixed(1)} km/h
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-xs">Incline</span>
                              <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                                {variation.incline}%
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-xs">Calories</span>
                              <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                                {variation.calories.toFixed(0)} kcal
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-xs">Intensity (METs)</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">
                                {variation.mets.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No realistic options found for these parameters. Try adjusting your target calories or time.
                    </div>
                  )}

                  {/* Back Button */}
                  <button
                    onClick={resetForm}
                    className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    ← Calculate Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
