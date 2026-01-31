/**
 * ACSM-validated metabolic equations for treadmill calorie calculations
 * Source: https://www.topendsports.com/testing/treadmill-power.htm
 */

/**
 * Calculate VO2, METs, Calories, and Distance for a treadmill workout
 * @param {number} speedKmh - Speed in km/h (1-20)
 * @param {number} inclinePercent - Incline in % (0-25)
 * @param {number} timeMinutes - Time in minutes (1-120)
 * @param {number} bodyWeightKg - Body weight in kg (30-200)
 * @returns {object} { vo2, mets, calories (NET - excluding BMR), distance }
 */
export function calculateTreadmillMetrics(speedKmh, inclinePercent, timeMinutes, bodyWeightKg) {
  // Step 1: Convert units
  const speedMPerS = speedKmh / 3.6;
  const gradeFraction = inclinePercent / 100;
  const timeHours = timeMinutes / 60;

  // Step 2: Calculate VO2 (ml/kg/min) using ACSM formula
  const vo2 = 3.5 + (12 * speedMPerS) + (54 * speedMPerS * gradeFraction);

  // Step 3: Calculate METs
  const mets = vo2 / 3.5;

  // Step 4: Calculate NET calories burned (excluding BMR)
  // Subtract 1 MET (resting metabolism) to get active calories only
  const netMets = mets - 1;
  const calories = netMets * bodyWeightKg * timeHours;

  // Step 5: Calculate distance (km)
  const distance = speedKmh * timeHours;

  // Calculate calories per minute
  const caloriesPerMinute = timeMinutes > 0 ? calories / timeMinutes : 0;

  return {
    vo2: parseFloat(vo2.toFixed(2)),
    mets: parseFloat(mets.toFixed(2)),
    calories: parseFloat(calories.toFixed(1)),
    caloriesPerMinute: parseFloat(caloriesPerMinute.toFixed(1)),
    distance: parseFloat(distance.toFixed(2))
  };
}

/**
 * Validate and clamp input values
 */
export function validateWeight(weight) {
  return Math.max(30, Math.min(200, weight));
}

export function validateSpeed(speed) {
  return Math.max(1, Math.min(20, speed));
}

export function validateIncline(incline) {
  return Math.max(0, Math.min(25, incline));
}

export function validateTime(time) {
  return Math.max(1, Math.min(120, time));
}

/**
 * Check if a value is within valid range
 */
export function isValidWeight(weight) {
  return weight >= 30 && weight <= 200;
}

export function isValidSpeed(speed) {
  return speed >= 1 && speed <= 20;
}

export function isValidIncline(incline) {
  return incline >= 0 && incline <= 25;
}

export function isValidTime(time) {
  return time >= 1 && time <= 120;
}
