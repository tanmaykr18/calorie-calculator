import React, { useState } from 'react';

const TAB_BY_TOTAL = 'by_total';
const TAB_BY_RATE = 'by_rate';
const TYPE_ACTIVE = 'active';
const TYPE_GROSS = 'gross';

export default function AICalorieCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_BY_TOTAL);

  // Tab 1: By total calories
  const [weight, setWeight] = useState(95);
  const [timeMinutes, setTimeMinutes] = useState(60);
  const [targetCalories, setTargetCalories] = useState(400);
  const [calorieType, setCalorieType] = useState(TYPE_ACTIVE); // active | gross

  // Tab 2: By cal/min
  const [targetCalPerMin, setTargetCalPerMin] = useState(7);
  const [calPerMinType, setCalPerMinType] = useState(TYPE_ACTIVE);

  const [variations, setVariations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [resultContext, setResultContext] = useState({ tab: TAB_BY_TOTAL, type: TYPE_ACTIVE });

  const getIntensity = (mets) => {
    if (mets < 3) return { label: 'Light', color: 'text-green-600 dark:text-green-400' };
    if (mets < 6) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    if (mets < 9) return { label: 'Vigorous', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Very Vigorous', color: 'text-red-600 dark:text-red-400' };
  };

  // Solve for speed/incline options. For "active": target = (METs-1)*w*t. For "gross": target = METs*w*t.
  const calculateVariationsByTotal = () => {
    const results = [];
    const timeHours = timeMinutes / 60;
    const useActive = calorieType === TYPE_ACTIVE;

    // Active: calories = (METs - 1) * weight * time  => METs = calories/(weight*time) + 1
    // Gross:  calories = METs * weight * time        => METs = calories/(weight*time)
    const targetMETs = useActive
      ? (targetCalories / (weight * timeHours)) + 1
      : targetCalories / (weight * timeHours);
    const targetVO2 = targetMETs * 3.5;

    const inclineOptions = [0, 2, 4, 6, 8, 10, 12, 15];
    inclineOptions.forEach(incline => {
      const gradeFraction = incline / 100;
      const denominator = 12 + (54 * gradeFraction);
      const speedMPerS = (targetVO2 - 3.5) / denominator;
      const speedKmh = speedMPerS * 3.6;

      if (speedKmh >= 1 && speedKmh <= 20) {
        const actualVO2 = 3.5 + (12 * speedMPerS) + (54 * speedMPerS * gradeFraction);
        const actualMETs = actualVO2 / 3.5;
        const activeCal = (actualMETs - 1) * weight * timeHours;
        const grossCal = actualMETs * weight * timeHours;
        const activeCalMin = timeMinutes > 0 ? activeCal / timeMinutes : 0;
        const grossCalMin = timeMinutes > 0 ? grossCal / timeMinutes : 0;

        results.push({
          speed: speedKmh,
          incline,
          calories: useActive ? activeCal : grossCal,
          caloriesActive: activeCal,
          caloriesGross: grossCal,
          caloriesPerMinute: activeCalMin,
          caloriesPerMinuteGross: grossCalMin,
          mets: actualMETs,
          intensity: getIntensity(actualMETs),
          timeMinutes
        });
      }
    });
    results.sort((a, b) => a.incline - b.incline);
    setVariations(results);
    setResultContext({ tab: TAB_BY_TOTAL, type: calorieType, timeMinutes, weight, targetCalories: targetCalories });
    setShowResults(true);
  };

  // By cal/min: treat as "target calories in 1 minute"
  const calculateVariationsByRate = () => {
    const results = [];
    const timeMinutesOne = 1;
    const timeHoursOne = 1 / 60;
    const useActive = calPerMinType === TYPE_ACTIVE;

    const targetMETs = useActive
      ? (targetCalPerMin / (weight * timeHoursOne)) + 1
      : targetCalPerMin / (weight * timeHoursOne);
    const targetVO2 = targetMETs * 3.5;

    const inclineOptions = [0, 2, 4, 6, 8, 10, 12, 15];
    inclineOptions.forEach(incline => {
      const gradeFraction = incline / 100;
      const denominator = 12 + (54 * gradeFraction);
      const speedMPerS = (targetVO2 - 3.5) / denominator;
      const speedKmh = speedMPerS * 3.6;

      if (speedKmh >= 1 && speedKmh <= 20) {
        const actualVO2 = 3.5 + (12 * speedMPerS) + (54 * speedMPerS * gradeFraction);
        const actualMETs = actualVO2 / 3.5;
        const activeCalMin = (actualMETs - 1) * weight * (1 / 60);
        const grossCalMin = actualMETs * weight * (1 / 60);
        const activeCal60 = activeCalMin * 60;
        const grossCal60 = grossCalMin * 60;

        results.push({
          speed: speedKmh,
          incline,
          caloriesPerMinute: activeCalMin,
          caloriesPerMinuteGross: grossCalMin,
          caloriesActive: activeCal60,
          caloriesGross: grossCal60,
          mets: actualMETs,
          intensity: getIntensity(actualMETs),
          timeMinutes: 60
        });
      }
    });
    results.sort((a, b) => a.incline - b.incline);
    setVariations(results);
    setResultContext({ tab: TAB_BY_RATE, type: calPerMinType, weight, targetCalPerMin });
    setShowResults(true);
  };

  const handleCalculate = () => {
    if (weight < 30 || weight > 200) return;
    if (activeTab === TAB_BY_TOTAL) {
      if (timeMinutes >= 1 && targetCalories > 0) calculateVariationsByTotal();
    } else {
      if (targetCalPerMin > 0) calculateVariationsByRate();
    }
  };

  const resetForm = () => {
    setShowResults(false);
    setVariations([]);
  };

  const renderForm = () => (
    <div className="space-y-6">
      <div className="flex rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab(TAB_BY_TOTAL)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === TAB_BY_TOTAL ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          By Total Calories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TAB_BY_RATE)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === TAB_BY_RATE ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          By Cal/Min Rate
        </button>
      </div>

      {/* Shared: Weight */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Weight (kg)</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          min="30"
          max="200"
          step="0.1"
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      {activeTab === TAB_BY_TOTAL && (
        <>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Calories to Burn (kcal)</label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
              min="1"
              max="2000"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Calorie type</label>
            <select
              value={calorieType}
              onChange={(e) => setCalorieType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value={TYPE_ACTIVE}>Active (exercise only, BMR excluded)</option>
              <option value={TYPE_GROSS}>Gross (total including BMR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Time Available (minutes)</label>
            <input
              type="number"
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(parseInt(e.target.value) || 0)}
              min="1"
              max="120"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </>
      )}

      {activeTab === TAB_BY_RATE && (
        <>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Calories/Min to Burn</label>
            <input
              type="number"
              value={targetCalPerMin}
              onChange={(e) => setTargetCalPerMin(parseFloat(e.target.value) || 0)}
              min="0.5"
              max="50"
              step="0.5"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Calorie type</label>
            <select
              value={calPerMinType}
              onChange={(e) => setCalPerMinType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value={TYPE_ACTIVE}>Active (exercise only, BMR excluded)</option>
              <option value={TYPE_GROSS}>Gross (total including BMR)</option>
            </select>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We’ll show speed & incline options that burn this many calories per minute. You can sustain as long as you want.
          </p>
        </>
      )}

      <button
        onClick={handleCalculate}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
      >
        Generate Options ✨
      </button>

      <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-semibold">💡</span> Active = exercise-only (BMR excluded). Gross = total including BMR. Choose the option that fits your fitness level.
        </p>
      </div>
    </div>
  );

  const renderResults = () => {
    const isByRate = resultContext.tab === TAB_BY_RATE;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4 mb-4">
          <p className="text-sm text-purple-900 dark:text-purple-100 text-center">
            {isByRate ? (
              <>Target: <span className="font-bold">{resultContext.targetCalPerMin} cal/min</span> ({resultContext.type === TYPE_ACTIVE ? 'Active' : 'Gross'}) @ {resultContext.weight} kg</>
            ) : (
              <>Target: <span className="font-bold">{resultContext.targetCalories} kcal</span> in {resultContext.timeMinutes} min ({resultContext.type === TYPE_ACTIVE ? 'Active' : 'Gross'}) @ {resultContext.weight} kg</>
            )}
          </p>
        </div>

        {variations.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Recommended options</h3>
            {variations.map((v, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">Option {index + 1}</span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-800 ${v.intensity.color}`}>
                    {v.intensity.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-xs">Speed</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{v.speed.toFixed(1)} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-xs">Incline</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">{v.incline}%</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-600 pt-3 mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Active:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {isByRate ? `${v.caloriesPerMinute?.toFixed(1) ?? v.caloriesPerMinute} cal/min` : `${v.caloriesActive?.toFixed(0) ?? v.calories?.toFixed(0)} kcal`}
                      {!isByRate && v.caloriesPerMinute != null && (
                        <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">({v.caloriesPerMinute.toFixed(1)}/min)</span>
                      )}
                      {isByRate && v.caloriesActive != null && (
                        <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">→ 60 min: {v.caloriesActive.toFixed(0)} kcal</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Gross:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {isByRate ? `${v.caloriesPerMinuteGross?.toFixed(1)} cal/min` : `${v.caloriesGross?.toFixed(0)} kcal`}
                      {!isByRate && v.caloriesPerMinuteGross != null && (
                        <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">({v.caloriesPerMinuteGross.toFixed(1)}/min)</span>
                      )}
                      {isByRate && v.caloriesGross != null && (
                        <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">→ 60 min: {v.caloriesGross.toFixed(0)} kcal</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No realistic options for these parameters. Try adjusting target or time.
          </div>
        )}

        <button
          onClick={resetForm}
          className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold rounded-xl transition-all duration-200"
        >
          ← Calculate again
        </button>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group active:scale-95"
        aria-label="AI Calorie Calculator"
        title="AI Calorie Calculator"
      >
        <span className="text-2xl">✨</span>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <h2 className="text-2xl font-bold">AI Calorie Calculator</h2>
                </div>
                <button
                  onClick={() => { setIsOpen(false); resetForm(); }}
                  className="text-white/80 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
              <p className="text-purple-100 text-sm">Find speed & incline to hit your calorie goal (by total or by rate)</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!showResults ? renderForm() : renderResults()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
