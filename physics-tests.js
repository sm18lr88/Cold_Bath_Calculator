// physics-tests.js
// Simple numeric regression tests for the Cold Bath calculator physics model.
// This file is independent of the UI and can be run with `node physics-tests.js`
// or included in a browser and observed via the console.

const CONST = {
  shWater: 4181,          // J/(kg·°C)
  lhIce: 333500,          // J/kg
  dWater: 1.0,            // kg/L
  dIce: 0.917,            // kg/L
  galToL: 3.78541,
  lbsToKg: 0.453592,
  BTU_TO_WATT: 0.29307107,
  chillers: {
    "0.1": { btu: 1000, watts: 190 },
    "0.25": { btu: 2800, watts: 460 },
    "0.5": { btu: 3400, watts: 520 },
    "1.0": { btu: 8000, watts: 1100 },
  },
  // Simplified U-values for maintenance load check (W/m^2 K)
  uValues: {
    poor: 10.0,
    decent: 3.5,
    good: 0.8,
  },
};

function approxEqual(actual, expected, relTol = 1e-3, label = "") {
  const diff = Math.abs(actual - expected);
  const tol = Math.max(1, Math.abs(expected)) * relTol;
  if (diff > tol) {
    throw new Error(
      `${label ? label + ': ' : ''}expected ${expected}, got ${actual} (diff=${diff}, tol=${tol})`
    );
  }
}

function testUnitConversions() {
  const gal = 100;
  const L = gal * CONST.galToL;
  approxEqual(L, 378.541, 1e-6, "gal→L");
  const lbs = 100;
  const kg = lbs * CONST.lbsToKg;
  approxEqual(kg, 45.3592, 1e-4, "lb→kg");
}

function testIceMassScenario() {
  // Scenario: 100 gal water, 20→10 °C, target in the typical recovery range.
  const volumeL = 100 * CONST.galToL;
  const startC = 20;
  const targetC = 10;
  const deltaT = startC - targetC;

  const waterMassKg = volumeL * CONST.dWater;
  const energyJ = waterMassKg * CONST.shWater * deltaT;

  const energyPerKgIce = CONST.lhIce + CONST.shWater * targetC;
  const iceKg = energyJ / energyPerKgIce;
  const iceLb = iceKg * (1 / CONST.lbsToKg);

  // Reference numbers computed once using the same physics:
  approxEqual(energyJ, 15826799.21, 1e-6, "ice: energyJ");
  approxEqual(energyPerKgIce, 375310.0, 1e-6, "ice: energyPerKgIce");
  approxEqual(iceKg, 42.16993741173963, 1e-6, "ice: kg");
  approxEqual(iceLb, 92.96887381554266, 1e-6, "ice: lb");
}

function testMaintenanceLoad() {
  // Maintenance load sanity check:
  // 100 gal (~378 L) tub, poor insulation, ambient 30 C, target 5 C.
  // U = 10 W/m^2K, surface area estimated from volume (piecewise fit).
  const volumeL = 100 * CONST.galToL;
  const estSA = volumeL < 300
    ? 1.8 + 0.0085 * volumeL
    : 2.5 + 0.0062 * volumeL;
  const u = CONST.uValues.poor;
  const deltaT = 25; // 30 - 5
  const heatGain = u * estSA * deltaT; // Watts

  const capacityW = CONST.chillers["0.25"].btu * CONST.BTU_TO_WATT; // 2800 BTU/hr
  const duty = (heatGain / capacityW) * 100;

  approxEqual(estSA, 4.848, 1e-2, "maint: SA estimate");
  approxEqual(heatGain, 1212.0, 2.0, "maint: passive heat gain W");
  approxEqual(duty, 147.7, 1.0, "maint: duty cycle %");
}

function testBodyDisplacement() {
  // 80 kg person, avg composition, 75% immersion.
  const weightKg = 80;
  const density = 0.985; // matches app's avg band
  const immersion = 0.75;

  const bodyVolL = (weightKg / density) * immersion;
  approxEqual(bodyVolL, 60.91370558375635, 1e-6, "body displacement L");
}

function testIceLargeDelta() {
  // 150 gal, 25→5 °C; checks larger delta-T and ice volume.
  const volumeL = 150 * CONST.galToL;
  const deltaT = 20;
  const targetC = 5;

  const energyJ = volumeL * CONST.dWater * CONST.shWater * deltaT;
  const energyPerKgIce = CONST.lhIce + CONST.shWater * targetC;
  const iceKg = energyJ / energyPerKgIce;
  const iceLb = iceKg * (1 / CONST.lbsToKg);
  const iceVolL = iceKg / CONST.dIce;

  approxEqual(energyJ, 47480397.63, 1e-6, "ice-large: energyJ");
  approxEqual(energyPerKgIce, 354405, 1e-6, "ice-large: energyPerKgIce");
  approxEqual(iceKg, 133.97214381851273, 1e-6, "ice-large: kg");
  approxEqual(iceLb, 295.3582598866663, 1e-6, "ice-large: lb");
  approxEqual(iceVolL, 146.0983029645722, 1e-6, "ice-large: volume L");
}

function testIceMildDelta() {
  // 40 gal, 15→10 °C; modest delta to confirm lower bound behavior.
  const volumeL = 40 * CONST.galToL;
  const deltaT = 5;
  const targetC = 10;

  const energyJ = volumeL * CONST.dWater * CONST.shWater * deltaT;
  const energyPerKgIce = CONST.lhIce + CONST.shWater * targetC;
  const iceKg = energyJ / energyPerKgIce;
  const iceLb = iceKg * (1 / CONST.lbsToKg);

  approxEqual(energyJ, 3165359.842, 1e-6, "ice-mild: energyJ");
  approxEqual(energyPerKgIce, 375310.0, 1e-6, "ice-mild: energyPerKgIce");
  approxEqual(iceKg, 8.433987482347927, 1e-6, "ice-mild: kg");
  approxEqual(iceLb, 18.593774763108534, 1e-6, "ice-mild: lb");
}

function runAll() {
  const tests = [
    ["unit conversions", testUnitConversions],
    ["ice mass", testIceMassScenario],
    ["maintenance load", testMaintenanceLoad],
    ["body displacement", testBodyDisplacement],
    ["ice large delta", testIceLargeDelta],
    ["ice mild delta", testIceMildDelta],
  ];

  for (const [name, fn] of tests) {
    fn();
    if (typeof console !== "undefined") {
      console.log(`✓ ${name} passed`);
    }
  }

  if (typeof console !== "undefined") {
    console.log("All physics tests passed.");
  }
}

if (typeof require === "undefined" || require.main === module) {
  // Browser (no require) or direct node execution
  runAll();
}

if (typeof module !== "undefined") {
  module.exports = {
    CONST,
    approxEqual,
    testUnitConversions,
    testIceMassScenario,
    testMaintenanceLoad,
    testBodyDisplacement,
    testIceLargeDelta,
    testIceMildDelta,
  };
}
