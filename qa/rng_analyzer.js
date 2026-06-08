/**
 * RNG Distribution Analyzer — Fruit Frenzy
 * 
 * Analyzes the randomness of slot reel outcomes by performing
 * a chi-squared goodness-of-fit test on symbol frequency.
 * 
 * This is designed to be run against the game engine once it's built.
 * For now, it runs against a simulated RNG and provides the framework.
 * 
 * Usage: node rng_analyzer.js [samples=10000] [api_url=http://localhost:3000]
 */

const API_URL = process.argv[3] || 'http://localhost:3000';
const NUM_SAMPLES = parseInt(process.argv[2] || '10000', 10);

// Fruit Frenzy symbol set (from game config)
const SYMBOLS = [
  { id: 'cherry', name: 'Cherry', weight: 25 },
  { id: 'lemon', name: 'Lemon', weight: 20 },
  { id: 'orange', name: 'Orange', weight: 18 },
  { id: 'plum', name: 'Plum', weight: 15 },
  { id: 'bell', name: 'Bell', weight: 10 },
  { id: 'seven', name: 'Seven', weight: 5 },
  { id: 'wild', name: 'Wild', weight: 4 },
  { id: 'scatter', name: 'Scatter', weight: 3 },
];

const totalWeight = SYMBOLS.reduce((s, sym) => s + sym.weight, 0); // 100

// Expected frequencies (based on weights)
const expectedFreq = SYMBOLS.map(sym => ({
  ...sym,
  expected: (sym.weight / totalWeight) * NUM_SAMPLES
}));

function simulateRNGSymbol() {
  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  for (const sym of SYMBOLS) {
    cumulative += sym.weight;
    if (rand < cumulative) return sym.id;
  }
  return SYMBOLS[SYMBOLS.length - 1].id;
}

function chiSquaredTest(observed, expected, numCategories) {
  let chi2 = 0;
  for (let i = 0; i < numCategories; i++) {
    if (expected[i] > 0) {
      chi2 += Math.pow(observed[i] - expected[i], 2) / expected[i];
    }
  }
  const degreesOfFreedom = numCategories - 1;
  // Approximate critical values for p=0.05
  // For df=7 (8 symbols - 1), critical value ≈ 14.067
  const criticalValues = {
    1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488,
    5: 11.070, 6: 12.592, 7: 14.067, 8: 15.507,
    9: 16.919, 10: 18.307
  };
  const criticalValue = criticalValues[degreesOfFreedom] || 18.307;

  return { chi2, degreesOfFreedom, criticalValue, passesRandom: chi2 < criticalValue };
}

async function analyzeRNG() {
  console.log('='.repeat(60));
  console.log('FRUIT FRENZY — RNG DISTRIBUTION ANALYZER');
  console.log(`Samples: ${NUM_SAMPLES} | API: ${API_URL}`);
  console.log('='.repeat(60));

  console.log('\n[1] Symbol Weights (configured):');
  console.log('  Symbol      | Weight | Expected %');
  console.log('  ' + '─'.repeat(35));
  for (const sym of SYMBOLS) {
    const pct = ((sym.weight / totalWeight) * 100).toFixed(1);
    console.log(`  ${sym.id.padEnd(11)} | ${String(sym.weight).padStart(6)} | ${pct}%`);
  }

  // Sample the RNG
  console.log(`\n[2] Generating ${NUM_SAMPLES} samples...`);
  const frequency = {};
  SYMBOLS.forEach(s => frequency[s.id] = 0);

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const symbol = simulateRNGSymbol();
    frequency[symbol]++;

    if ((i + 1) % 2500 === 0) {
      console.log(`  ${i + 1}/${NUM_SAMPLES} samples collected`);
    }
  }

  // Analysis
  console.log('\n[3] Frequency Distribution:');
  console.log('  Symbol      | Observed | Expected | Δ     | Std Dev');
  console.log('  ' + '─'.repeat(50));

  const observed = SYMBOLS.map(sym => frequency[sym.id]);
  const expected = expectedFreq.map(e => e.expected);
  const stdDev = Math.sqrt(NUM_SAMPLES * (1 / SYMBOLS.length) * (1 - 1 / SYMBOLS.length));

  for (let i = 0; i < SYMBOLS.length; i++) {
    const sym = SYMBOLS[i];
    const obs = frequency[sym.id];
    const exp = expected[i];
    const delta = (obs - exp).toFixed(1);
    const stdDevs = (Math.abs(obs - exp) / Math.sqrt(NUM_SAMPLES * (sym.weight / totalWeight) * (1 - sym.weight / totalWeight))).toFixed(2);
    console.log(`  ${sym.id.padEnd(11)} | ${String(obs).padStart(8)} | ${String(Math.round(exp)).padStart(8)} | ${delta.padStart(5)} | ${stdDevs}`);
  }

  // Run chi-squared
  console.log('\n[4] Chi-Squared Goodness-of-Fit Test');
  const result = chiSquaredTest(observed, expected, SYMBOLS.length);
  console.log(`  χ² = ${result.chi2.toFixed(4)}`);
  console.log(`  df = ${result.degreesOfFreedom}`);
  console.log(`  Critical value (α=0.05): ${result.criticalValue}`);

  console.log('\n[5] Verdict');
  console.log('  ' + '─'.repeat(40));

  let passed = 0;
  let failed = 0;

  // Check uniformity per symbol (should be within ~3 standard deviations)
  let hasOutliers = false;
  for (let i = 0; i < SYMBOLS.length; i++) {
    const sym = SYMBOLS[i];
    const obs = frequency[sym.id];
    const exp = expected[i];
    const se = Math.sqrt(NUM_SAMPLES * (sym.weight / totalWeight) * (1 - sym.weight / totalWeight));
    const z = Math.abs(obs - exp) / se;
    if (z > 3.5) {
      console.log(`  ✗ ${sym.id}: z=${z.toFixed(2)} — OUTLIER (>3.5σ)`);
      hasOutliers = true;
      failed++;
    }
  }

  if (!hasOutliers) {
    console.log('  ✓ All symbols within expected range: PASS');
    passed++;
  }

  if (result.passesRandom) {
    console.log(`  ✓ Chi-squared test PASS (χ²=${result.chi2.toFixed(2)} < ${result.criticalValue})`);
    passed++;
  } else {
    console.log(`  ✗ Chi-squared test FAIL (χ²=${result.chi2.toFixed(2)} >= ${result.criticalValue})`);
    failed++;
  }

  // Check for patterns (runs test - simple version)
  // Use the already-generated samples stored in frequency order
  // Generate a sequence and check runs
  const runSequence = [];
  for (let i = 0; i < Math.min(2000, NUM_SAMPLES); i++) {
    runSequence.push(simulateRNGSymbol());
  }
  let runs = 1;
  for (let i = 1; i < runSequence.length; i++) {
    if (runSequence[i] !== runSequence[i-1]) runs++;
  }
  // Expected runs for multinomial with unequal probabilities
  const pSumSq = SYMBOLS.reduce((s, sym) => s + Math.pow(sym.weight / totalWeight, 2), 0);
  const expectedRuns = runSequence.length * (1 - pSumSq) + pSumSq;
  const runsRatio = (runs / expectedRuns).toFixed(3);
  console.log(`\n  Runs test (first ${runSequence.length} samples): ${runs} runs (expected ~${expectedRuns.toFixed(0)})`);
  if (runsRatio >= 0.9 && runsRatio <= 1.1) {
    console.log('  ✓ Runs test PASS: no obvious patterns');
    passed++;
  } else {
    console.log('  ✗ Runs test FAIL: possible pattern detected (ratio=' + runsRatio + ')');
    failed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${passed}/${passed + failed} checks passed`);
  console.log(`STATUS: ${failed === 0 ? 'PASSED ✅' : 'WARNINGS ⚠️'}`);
  console.log('='.repeat(60));

  return { passed, failed, chi2: result.chi2, passesRandom: result.passesRandom };
}

// Run
analyzeRNG().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});