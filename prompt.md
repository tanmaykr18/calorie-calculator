**Detailed Prompt for Cursor AI (Updated - Body Weight Clarification):**

Build a complete, mobile-responsive Vite + React treadmill calorie burn calculator app designed exclusively for phone use. The app supports single or multiple workout sets, calculates accurate calories burned using ACSM-validated metabolic equations, and displays per-set and total results in a clean, touch-optimized interface targeting portrait phone usage.

### Core Features & Inputs:
- **Global Input**: "Your Body Weight (kg)" (30-200kg, number input + validation) - clearly labeled as person's body weight only  [topendsports](https://www.topendsports.com/testing/treadmill-power.htm)
- **Per Set Inputs** (dynamic 1-10 sets):
  - Incline % (0-25%, slider + number input, 0.1 precision)
  - Speed km/h (1-20 km/h, slider + number input, 0.1 precision) 
  - Time minutes (1-120 min, number input)
- **Controls**: "Add Set" button, "Remove Set" (× button per set), "Reset All"
- **Outputs**: 
  - Per set: Calories burned, Distance (km), METs value
  - Grand total calories (prominently displayed)
  - Live calculation on input change

### Accurate ACSM Metabolic Formulas  [topendsports](https://www.topendsports.com/testing/treadmill-power.htm):
```
1. Convert units:
   speed_m_per_s = speed_kmh / 3.6
   grade_fraction = incline_percent / 100  
   time_hours = time_minutes / 60

2. VO2 (ml/kg/min) = 3.5 + 12 × speed_m_per_s + 54 × speed_m_per_s × grade_fraction

3. METs = VO2 / 3.5

4. Calories burned = METs × body_weight_kg × time_hours
```

**Distance**: `speed_kmh × (time_minutes / 60)`  [42.195km](https://42.195km.net/e/treadsim/)

### UI/UX Requirements (Mobile-First):
```
Layout (100vh, safe-area aware):
├── Header: "🏃 Treadmill Calorie Calculator" + Dark/Light toggle
├── Weight Input: "Your Body Weight (kg)" [large input]
├── Sets Section: 
│   ├── Set 1: [Incline Slider][Number] [Speed Slider][Number] [Time Input] [×]
│   ├── Set 2: [same pattern] [×]  (dynamic)
│   └── [+ Add Set] button
└── Results: 
    ├── Set 1: 🔥 245 kcal | 2.1km | 7.2 METs
    ├── Set 2: 🔥 180 kcal | 1.5km | 6.1 METs
    └── 💰 TOTAL: 425 kcal (large green bold)
```

**Styling**: Tailwind CSS, mobile-first
- Colors: bg-gradient-to-b from-slate-50 to-white, primary-blue (#3b82f6), success-green (#10b981)
- Touch targets: min 48px height
- Sliders: Full-width, large thumbs, track colored by value
- Cards: Subtle shadows, rounded, spaced 1rem
- Typography: Large readable fonts (min 16px)

### Tech Stack & File Structure:
```
treadmill-calc/
├── src/
│   ├── App.jsx                 # Main container
│   ├── components/
│   │   ├── SetInput.jsx        # Single set form
│   │   ├── ResultsList.jsx     # Results display
│   │   └── WeightInput.jsx     # Global weight
│   ├── hooks/
│   │   └── useTreadmillCalc.js # All state + calculations
│   ├── utils/
│   │   └── calculations.js     # Pure calc functions
│   └── App.css (Tailwind)
├── tailwind.config.js
├── vite.config.js
└── index.html
```

### Implementation Details:
```
**useTreadmillCalc hook:**
- state: { weight, sets: [{incline, speed, time}], results: [] }
- useEffect: recalculate() on any change
- validateInputs(): clamp values, show errors

**Validation:**
- Weight: 30-200kg
- Speed: 1-20 km/h  
- Incline: 0-25%
- Time: 1-120 min
- Red error text for invalid inputs

**Responsive:**
- Portrait: Vertical stack
- Landscape: Inputs horizontal where possible
- Safe area insets for notch phones
- PWA-ready (manifest.json)
```

### Production Requirements:
- Zero console errors/warnings
- Real-time calculation (<100ms lag)
- LocalStorage persistence (weight + last sets)
- Offline capable (service worker optional)
- Install instructions in README
- Test on iOS/Android Chrome/Safari

### Accuracy Disclaimer (Footer):
*"±5-10% estimate using ACSM metabolic equations. Individual metabolism varies."*  [topendsports](https://www.topendsports.com/testing/treadmill-power.htm)

### Expected User Flow:
1. Enter body weight → Set 1 auto-populates
2. Adjust sliders/numbers → Live results update
3. Tap "+ Add Set" → Duplicate form appears
4. See per-set + total calories instantly
5. "Reset All" clears everything

**Generate FULL working code** for entire Vite project. Single `npx create-vite` command + all files. Zero bugs, production-ready, mobile-tested. Include `npm install && npm run dev` instructions.

This creates your exact treadmill calorie calculator with ACSM-accurate formulas and perfect mobile UX. [topendsports](https://www.topendsports.com/testing/treadmill-power.htm)