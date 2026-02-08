import { useState, useEffect, useCallback } from 'react';
import { calculateTreadmillMetrics, validateWeight, validateSpeed, validateIncline, validateTime } from '../utils/calculations';

const STORAGE_KEY = 'treadmill-calc-data';

/**
 * Custom hook for managing treadmill calculator state and calculations
 */
export function useTreadmillCalc() {
  // Initialize state from localStorage or defaults
  const DEFAULT_WEIGHT = 85;

  const [weight, setWeight] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.weight ?? DEFAULT_WEIGHT;
      } catch (e) {
        return DEFAULT_WEIGHT;
      }
    }
    return DEFAULT_WEIGHT;
  });

  // Helper to create a set with unique ID (reset defaults: 3.5 km/h, 10% incline, 90 min)
  const createSet = (setData = {}) => ({
    id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
    incline: setData.incline ?? 10,
    speed: setData.speed ?? 3.5,
    timeMinutes: setData.timeMinutes ?? 90,
    timeSeconds: setData.timeSeconds ?? 0
  });

  const [sets, setSets] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Migrate old format (time) to new format (timeMinutes, timeSeconds)
        if (data.sets && data.sets.length > 0) {
          return data.sets.map(set => {
            const migratedSet = {
              id: set.id || `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Preserve or create ID
              incline: set.incline ?? 10,
              speed: set.speed ?? 3.5,
              timeMinutes: set.timeMinutes !== undefined ? set.timeMinutes : (set.time ? Math.floor(set.time) : 90),
              timeSeconds: set.timeSeconds !== undefined ? set.timeSeconds : (set.time ? Math.round((set.time % 1) * 60) : 0)
            };
            return migratedSet;
          });
        }
        return [createSet()];
      } catch (e) {
        return [createSet()];
      }
    }
    return [createSet()];
  });

  const [results, setResults] = useState([]);

  // Save to localStorage whenever weight or sets change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ weight, sets }));
  }, [weight, sets]);

  // Calculate results whenever inputs change
  useEffect(() => {
    // Use default weight if weight is empty or invalid
    const weightForCalc = (weight && !isNaN(weight) && weight >= 30 && weight <= 200) ? weight : DEFAULT_WEIGHT;
    
    // Safety check: ensure sets array is not empty and has valid data
    if (!sets || sets.length === 0) {
      setResults([]);
      return;
    }
    
    const newResults = sets.map(set => {
      // Ensure set has required properties with defaults
      const safeSet = {
        speed: set.speed ?? 3.5,
        incline: set.incline ?? 10,
        timeMinutes: set.timeMinutes !== undefined ? set.timeMinutes : (set.time ? Math.floor(set.time) : 90),
        timeSeconds: set.timeSeconds !== undefined ? set.timeSeconds : (set.time ? Math.round((set.time % 1) * 60) : 0)
      };
      
      // Convert minutes + seconds to total minutes (decimal)
      const totalMinutes = safeSet.timeMinutes + (safeSet.timeSeconds / 60);
      
      return calculateTreadmillMetrics(
        safeSet.speed,
        safeSet.incline,
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
      // Safety check: ensure index is valid
      if (index < 0 || index >= prev.length) {
        console.warn(`Invalid set index: ${index}`);
        return prev;
      }
      
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
      
      // Ensure the set exists before updating
      if (newSets[index]) {
        newSets[index] = { ...newSets[index], [field]: validValue };
      }
      return newSets;
    });
  }, []);

  const addSet = useCallback(() => {
    if (sets.length < 10) {
      setSets(prev => [...prev, createSet()]);
    }
  }, [sets.length]);

  const removeSet = useCallback((index) => {
    if (sets.length > 1) {
      setSets(prev => prev.filter((_, i) => i !== index));
    }
  }, [sets.length]);

  const resetAll = useCallback(() => {
    setWeight(DEFAULT_WEIGHT);
    setSets([createSet()]);
  }, []);

  // Calculate total calories - active and gross (with safety check)
  const totalCalories = results && results.length > 0 
    ? results.reduce((sum, result) => sum + (result?.calories || 0), 0)
    : 0;
  const totalCaloriesGross = results && results.length > 0 
    ? results.reduce((sum, result) => sum + (result?.caloriesGross || 0), 0)
    : 0;

  return {
    weight,
    sets,
    results,
    totalCalories,
    totalCaloriesGross,
    updateWeight,
    updateSet,
    addSet,
    removeSet,
    resetAll
  };
}
