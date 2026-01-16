import { useState, useEffect } from "react"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import WeightInput from "./components/WeightInput"
import SetInput from "./components/SetInput"
import ResultsList from "./components/ResultsList"
import { useTreadmillCalc } from "./hooks/useTreadmillCalc"
import { getTheme } from "./theme/theme"
import "./App.css"

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode")
    return stored ? JSON.parse(stored) : false
  })

  const { weight, sets, results, totalCalories, updateWeight, updateSet, addSet, removeSet, resetAll } =
    useTreadmillCalc()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  const muiTheme = getTheme(darkMode);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 pb-safe pt-safe px-safe">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center gap-2 mb-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">🏃 Treadmill Calorie</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition-colors flex-shrink-0"
              style={{ minHeight: "48px", minWidth: "48px" }}
              aria-label="Toggle dark mode"
            >
              <span className="text-xl sm:text-2xl">{darkMode ? "☀️" : "🌙"}</span>
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Calculate accurate calories using ACSM metabolic equations
          </p>
        </header>

        {/* Weight Input */}
        <WeightInput weight={weight} onWeightChange={updateWeight} />

        {/* Sets Section */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">Workout Sets</h2>
          {sets.map((set, index) => (
            <SetInput
              key={index}
              setNumber={index + 1}
              set={set}
              onUpdate={(field, value) => updateSet(index, field, value)}
              onRemove={() => removeSet(index)}
              canRemove={sets.length > 1}
            />
          ))}

          {/* Add Set Button - Updated color class */}
          <button
            onClick={addSet}
            disabled={sets.length >= 10}
            className="btn-primary w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed"
            style={{ minHeight: "48px" }}
          >
            <span className="inline-block">+ Add Set {sets.length < 10 ? `(${sets.length}/10)` : "(Max reached)"}</span>
          </button>
        </div>

        {/* Results */}
        <ResultsList results={results} totalCalories={totalCalories} />

        {/* Reset Button - Updated styling */}
        <button
          onClick={resetAll}
          className="w-full py-3 sm:py-4 text-base sm:text-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors mb-4"
          style={{ minHeight: "48px" }}
        >
          🔄 Reset All
        </button>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
          <p>
            Data source:{" "}
            <a
              href="https://www.topendsports.com/testing/treadmill-power.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline"
            >
              Top End Sports - ACSM Metabolic Equations
            </a>
          </p>
        </footer>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
