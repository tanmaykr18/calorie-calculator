import { useState, useEffect, useCallback } from 'react';
import { calculateTreadmillMetrics, validateWeight, validateSpeed, validateIncline, validateTime } from '../utils/calculations';

const STORAGE_KEY = 'treadmill-calc-data';

/**
 * Custom hook for managing treadmill calculator state and calculations
 */
export function useTreadmillCalc() {
  // Initialize state from localStorage or defaults
  const [weight, setWeight] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.weight || 95;
      } catch (e) {
        return 95;
      }
    }
    return 95;
  });

  const [sets, setSets] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Migrate old format (time) to new format (timeMinutes, timeSeconds)
        if (data.sets) {
          return data.sets.map(set => {
            if (set.time !== undefined && set.timeMinutes === undefined) {
              return {
                ...set,
                timeMinutes: Math.floor(set.time),
                timeSeconds: Math.round((set.time % 1) * 60)
              };
            }
            return {
              incline: set.incline || 0,
              speed: set.speed || 5,
              timeMinutes: set.timeMinutes || 30,
              timeSeconds: set.timeSeconds || 0
            };
          });
        }
        return [{ incline: 0, speed: 5, timeMinutes: 30, timeSeconds: 0 }];
      } catch (e) {
        return [{ incline: 0, speed: 5, timeMinutes: 30, timeSeconds: 0 }];
      }
    }
    return [{ incline: 0, speed: 5, timeMinutes: 30, timeSeconds: 0 }];
  });

  const [results, setResults] = useState([]);

  // Save to localStorage whenever weight or sets change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ weight, sets }));
  }, [weight, sets]);

  // Calculate results whenever inputs change
  useEffect(() => {
    // Use default weight of 95 if weight is empty or invalid
    const weightForCalc = (weight && !isNaN(weight) && weight >= 30 && weight <= 200) ? weight : 95;
    
    const newResults = sets.map(set => {
      // Convert minutes + seconds to total minutes (decimal)
      const totalMinutes = (set.timeMinutes !== undefined ? set.timeMinutes : (set.time ? Math.floor(set.time) : 30)) + 
                          ((set.timeSeconds !== undefined ? set.timeSeconds : (set.time ? Math.round((set.time % 1) * 60) : 0)) / 60);
      return calculateTreadmillMetrics(
        set.speed,
        set.incline,
        totalMinutes,
        weightForCalc
      );
    });
    setResults(newResults);
  }, [weight, sets]);

  // Weight handlers
  const updateWeight = useCallback((newWeight) => {
    // Allow empty string for typing
    if (newWeight === '' || newWeight === null || newWeight === undefined) {
      setWeight('');
      return;
    }
    
    const numValue = Number(newWeight);
    if (!isNaN(numValue)) {
      // Round to 1 decimal place
      const rounded = Math.round(numValue * 10) / 10;
      // Clamp between 30 and 200
      const clamped = Math.max(30, Math.min(200, rounded));
      setWeight(clamped);
    } else {
      // If not a valid number, allow partial input (e.g., "7" when typing "75")
      setWeight(newWeight);
    }
  }, []);

  // Set handlers
  const updateSet = useCallback((index, field, value) => {
    setSets(prev => {
      const newSets = [...prev];
      let validValue = Number(value);
      
      // Validate based on field
      switch (field) {
        case 'incline':
          validValue = Math.round(validateIncline(validValue)); // Integer only
          break;
        case 'speed':
          validValue = validateSpeed(validValue);
          break;
        case 'timeMinutes':
          validValue = Math.max(0, Math.min(120, Math.round(validValue))); // Integer, 0-120
          break;
        case 'timeSeconds':
          validValue = Math.max(0, Math.min(59, Math.round(validValue))); // Integer, 0-59
          break;
        default:
          break;
      }
      
      newSets[index] = { ...newSets[index], [field]: validValue };
      return newSets;
    });
  }, []);

  const addSet = useCallback(() => {
    if (sets.length < 10) {
      setSets(prev => [...prev, { incline: 0, speed: 5, timeMinutes: 30, timeSeconds: 0 }]);
    }
  }, [sets.length]);

  const removeSet = useCallback((index) => {
    if (sets.length > 1) {
      setSets(prev => prev.filter((_, i) => i !== index));
    }
  }, [sets.length]);

  const resetAll = useCallback(() => {
    setWeight(95);
    setSets([{ incline: 0, speed: 5, timeMinutes: 30, timeSeconds: 0 }]);
  }, []);

  // Calculate total calories
  const totalCalories = results.reduce((sum, result) => sum + result.calories, 0);

  return {
    weight,
    sets,
    results,
    totalCalories,
    updateWeight,
    updateSet,
    addSet,
    removeSet,
    resetAll
  };
}
