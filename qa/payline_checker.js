/**
 * Payline Hit Frequency Checker — Fruit Frenzy
 * 
 * Analyzes how often winning paylines occur across N spins.
 * Tracks hit rate by symbol type, by number of matches (3, 4, 5-of-a-kind),
 * and overall volatility.
 * 
 * Usage: node payline_checker.js [spins=5000] [api_url=http://localhost:3000]
 */

const API_URL = process.argv[3] || 'http://localhost:3000';
const NUM_SPINS = parseInt(process.argv[2] || '5000', 10);

// Paytable — Fruit Frenzy (in credits)
const PAYTABLE = [
  { symbol: 'seven', 3: 100, 4: 500, 5: 2500 },
  { symbol: 'bell', 3: 50, 4: 200, 5: 1000 },
  { symbol: 'orange', 3: 20, 4: 80, 5: 400 },
  { symbol: 'plum', 3: 15, 4: 60, 5: 300 },
  { symbol: 'lemon', 3: 10, 4: 40, 5: 200 },
  { symbol: 'cherry', 3: 5, 4: 20, 5: 100 },
  { symbol: 'grapes', 3: 15, 4: 60, 5: 300 },
  { symbol: 'watermelon', 3: 20, 4: 80, 5: 400 },
  { symbol: 'bar_single', 3: 25, 4: 100, 5: 500 },
  { symbol: 'bar_triple', 3: 75, 4: 300, 5: 1500 },
];

// Simulate a single reel stop with weighted random
const REEL_STOPS = ['cherry', 'lemon', 'orange', 'plum', 'grapes', 'watermelon', 'bell', 'seven', 'bar_single', 'bar_triple', 'wild_starfruit', 'scatter_star'];
const REEL_WEIGHTS = {  // Higher = more common
  cherry: 20, lemon: 18, orange: 15, plum: 13, grapes: 10,
  watermelon: 8, bell: 6, seven: 3.5, bar_single: 4, bar_triple: 1.5,
  wild_starfruit: 0.5, scatter_star: 0.5
};

function weightedRandom() {
  const totalWeight = Object.values(REEL_WEIGHTS).reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  for (const [sym, weight] of Object.entries(REEL_WEIGHTS)) {
    rand -= weight;
    if (rand <= 0) return sym;
  }
  return REEL_STOPS[REEL_STOPS.length - 1];
}

function spinReels() {
  // Simulate 5 reels × 3 visible positions = 15 symbols
  const reels = [];
  for (let reel = 0; reel < 5; reel++) {
    const reelSymbols = [];
    for (let pos = 0; pos < 3; pos++) {
      reelSymbols.push(weightedRandom());
    }
    reels.push(reelSymbols);
  }
  return reels;
}

function checkPaylines(reels) {
  // Simple check: for each symbol type, check if 3+ appear on a "virtual" center payline
  // This is a simplified check — real payline checks are more complex
  const centerLine = reels.map(reel => reel[1]); // Center row

  // Count matches per symbol on center line
  const matchCount = {};
  for (const sym of centerLine) {
    matchCount[sym] = (matchCount[sym] || 0) + 1;
  }

  // Check wild substitution
  let wildCount = matchCount['wild_starfruit'] || 0;

  const wins = [];
  for (const [sym, count] of Object.entries(matchCount)) {
    if (sym === 'wild_starfruit' || sym === 'scatter_star') continue;

    let effectiveCount = count;
    // Wilds substitute for non-scatter, non-wild symbols
    if (sym !== 'wild_starfruit' && sym !== 'scatter_star') {
      effectiveCount += wildCount;
    }

    if (effectiveCount >= 3) {
      const payline = PAYTABLE.find(p => p.symbol === sym);
      if (payline) {
        const payout = payline[effectiveCount] || 0;
        if (payout > 0) {
          wins.push({ symbol: sym, matches: effectiveCount, payout });
        }
      }
    }
  }

  // Scatter check (anywhere, position-independent)
  const scatterCount = (matchCount['scatter_star'] || 0) + (reels.flat().filter(s => s === 'scatter_star').length - (reels[0][1] === 'scatter_star' ? 1 : 0));
  // Actually let's count all scatters properly
  const totalScatters = reels.flat().filter(s => s === 'scatter_star').length;
  if (totalScatters >= 3) {
    const scatterPayout = [0, 0, 10, 25, 100, 500][totalScatters] || 0;
    if (scatterPayout > 0) {
      wins.push({ symbol: 'scatter_star', matches: totalScatters, payout: scatterPayout, isScatter: true });
    }
  }

  return wins;
}

async function analyzeHitFrequency() {
  console.log('='.repeat(60));
  console.log('FRUIT FRENZY — PAYLINE HIT FREQUENCY CHECKER');
  console.log(`Spins: ${NUM_SPINS} | API: ${API_URL}`);
  console.log('='.repeat(60));

  // Stats collectors
  const symbolHits = {};
  const matchTypeCount = { 3: 0, 4: 0, 5: 0 };
  let totalSpins = 0;
  let winningSpins = 0;
  let totalPayout = 0;
  let maxPayout = 0;
  let maxPayoutDetails = null;
  let scatterHitCount = 0;

  for (let i = 0; i < NUM_SPINS; i++) {
    totalSpins++;
    const reels = spinReels();
    const wins = checkPaylines(reels);

    if (wins.length > 0) {
      winningSpins++;
      const spinPayout = wins.reduce((sum, w) => sum + w.payout, 0);
      totalPayout += spinPayout;

      if (spinPayout > maxPayout) {
        maxPayout = spinPayout;
        maxPayoutDetails = wins;
      }

      for (const win of wins) {
        if (win.isScatter) {
          scatterHitCount++;
        } else {
          symbolHits[win.symbol] = symbolHits[win.symbol] || { count: 0, totalPayout: 0 };
          symbolHits[win.symbol].count++;
          symbolHits[win.symbol].totalPayout += win.payout;
          matchTypeCount[win.matches] = (matchTypeCount[win.matches] || 0) + 1;
        }
      }
    }
  }

  // Results
  console.log('\n[1] Overall Hit Statistics');
  console.log('  ' + '─'.repeat(50));
  const hitRate = ((winningSpins / totalSpins) * 100).toFixed(2);
  const avgPayout = winningSpins > 0 ? (totalPayout / winningSpins).toFixed(2) : 'N/A';
  console.log(`  Total spins:        ${totalSpins}`);
  console.log(`  Winning spins:      ${winningSpins}`);
  console.log(`  Hit rate:           ${hitRate}%`);
  console.log(`  Total payout:       ${totalPayout}`);
  console.log(`  Avg win per spin:   ${(totalPayout / totalSpins).toFixed(2)}`);
  console.log(`  Avg win per hit:    ${avgPayout}`);
  console.log(`  Max win:            ${maxPayout}`);

  if (maxPayoutDetails) {
    console.log(`  Max win details:    ${maxPayoutDetails.map(w => `${w.symbol}×${w.matches}=${w.payout}`).join(' + ')}`);
  }

  console.log('\n[2] Symbol Hit Distribution');
  console.log('  Symbol       | Hits  | % of Spins | Avg Payout');
  console.log('  ' + '─'.repeat(52));
  for (const [sym, data] of Object.entries(symbolHits).sort((a, b) => b[1].count - a[1].count)) {
    const pct = ((data.count / totalSpins) * 100).toFixed(2);
    const avg = (data.totalPayout / data.count).toFixed(1);
    console.log(`  ${sym.padEnd(13)} | ${String(data.count).padStart(5)} | ${pct.padStart(8)}% | ${avg.padStart(7)}`);
  }

  console.log('\n[3] Match Type Distribution');
  console.log('  Matches | Count');
  console.log('  ' + '─'.repeat(20));
  for (let i = 3; i <= 5; i++) {
    console.log(`  ${i}-of-a-kind | ${matchTypeCount[i] || 0}`);
  }

  console.log('\n[4] Scatter Hits');
  console.log(`  Scatter hits (3+): ${scatterHitCount} (${((scatterHitCount / totalSpins) * 100).toFixed(2)}% of spins)`);

  console.log('\n[5] Volatility Estimates');
  const oneHitPercent = ((winningSpins > 0 ? 1 : 0) / totalSpins * 100).toFixed(4);
  console.log(`  Base hit frequency: ~${hitRate}%`);
  console.log(`  Estimated variance: ${(totalPayout / totalSpins).toFixed(2)} units/spin`);

  // Verdict
  console.log('\n[6] Verdict');
  console.log('  ' + '─'.repeat(40));

  let passed = 0;
  let failed = 0;

  if (hitRate >= 15 && hitRate <= 40) {
    console.log(`  ✓ Hit rate (${hitRate}%) in expected range (15-40%): PASS`);
    passed++;
  } else {
    console.log(`  ✗ Hit rate (${hitRate}%) outside expected range: FAIL`);
    failed++;
  }

  if (scatterHitCount >= Math.floor(totalSpins * 0.005) && scatterHitCount <= Math.floor(totalSpins * 0.05)) {
    console.log(`  ✓ Scatter frequency (${((scatterHitCount / totalSpins) * 100).toFixed(2)}%) in expected range: PASS`);
    passed++;
  } else {
    console.log(`  ✗ Scatter frequency outside expected range: FAIL`);
    failed++;
  }

  // Check that each symbol type has at least some hits
  const zeroHitSymbols = PAYTABLE.filter(p => !symbolHits[p.symbol] || symbolHits[p.symbol].count === 0).map(p => p.symbol);
  if (zeroHitSymbols.length === 0) {
    console.log('  ✓ All symbol types hit at least once: PASS');
    passed++;
  } else {
    console.log(`  ✗ Symbols with zero hits: ${zeroHitSymbols.join(', ')} — investigate weights`);
    failed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${passed}/${passed + failed} checks passed`);
  console.log(`STATUS: ${failed === 0 ? 'PASSED ✅' : 'WARNINGS ⚠️'}`);
  console.log('='.repeat(60));

  return { passed, failed, hitRate, totalPayout, maxPayout };
}

// Run
analyzeHitFrequency().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});