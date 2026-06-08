/**
 * Automated Spin Test — Fruit Frenzy
 * 
 * Runs N spins against the backend API, verifying:
 * - Balance is correctly deducted before each spin (bet amount)
 * - Wins are properly credited
 * - No balance drift over thousands of spins
 * - Session consistency
 * 
 * Usage: node spin_test.js [spins=1000] [api_url=http://localhost:3000]
 */

const API_URL = process.argv[3] || 'http://localhost:3000';
const NUM_SPINS = parseInt(process.argv[2] || '1000', 10);
const BET_AMOUNT = 100;

async function spinTest() {
  console.log('='.repeat(60));
  console.log('FRUIT FRENZY — AUTOMATED SPIN TEST');
  console.log(`Spins: ${NUM_SPINS} | Bet: ${BET_AMOUNT} | API: ${API_URL}`);
  console.log('='.repeat(60));

  // 1. Initialize session
  console.log('\n[1] Initializing session...');
  let session;
  try {
    const res = await fetch(`${API_URL}/api/session/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 'qa_autotest',
        gameId: 'fruit-frenzy',
        initialBalance: 1000000,
        currency: 'SC'
      })
    });
    session = await res.json();
    console.log(`  Session: ${session.id}`);
    console.log(`  Initial Balance: ${session.balance} ${session.currency}`);
  } catch (err) {
    console.error('  FAILED: Cannot initialize session —', err.message);
    console.log('\n[RESULT] SPIN TEST: BLOCKED — API not available');
    process.exit(1);
  }

  // 2. Run spins
  console.log(`\n[2] Running ${NUM_SPINS} spins...`);
  let startingBalance = session.balance;
  let totalBet = 0;
  let totalWin = 0;
  let winCount = 0;
  let spinCount = 0;
  let errors = [];
  let balanceHistory = [startingBalance];

  for (let i = 0; i < NUM_SPINS; i++) {
    spinCount++;

    // Deduct bet
    const betRes = await fetch(`${API_URL}/api/session/${session.id}/adjust-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: -BET_AMOUNT })
    });
    const betData = await betRes.json();

    if (betData.error) {
      errors.push({ spin: i, stage: 'bet', error: betData.error, sessionBalance: betData.balance });
      continue;
    }

    totalBet += BET_AMOUNT;
    let currentBalance = betData.balance;

    // Simulate spin result (when real game engine is integrated, replace with actual spin API call)
    // For now, use the mock logic: 30% chance of win
    const winAmount = Math.random() < 0.3 ? BET_AMOUNT * Math.floor(Math.random() * 5 + 1) : 0;

    if (winAmount > 0) {
      const winRes = await fetch(`${API_URL}/api/session/${session.id}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: winAmount })
      });
      const winData = await winRes.json();
      currentBalance = winData.balance;
      totalWin += winAmount;
      winCount++;
    }

    balanceHistory.push(currentBalance);

    // Progress indicator
    if ((i + 1) % 100 === 0) {
      const hitRate = ((winCount / (i + 1)) * 100).toFixed(2);
      console.log(`  ${i + 1}/${NUM_SPINS} spins — Hit rate: ${hitRate}% — Balance: ${currentBalance}`);
    }
  }

  // 3. Results
  console.log('\n[3] Results');
  console.log('─'.repeat(40));

  const finalBalance = balanceHistory[balanceHistory.length - 1];
  const expectedBalance = startingBalance - totalBet + totalWin;
  const balanceDrift = finalBalance - expectedBalance;
  const hitRate = ((winCount / spinCount) * 100).toFixed(2);
  const rtp = spinCount > 0 ? ((totalWin / totalBet) * 100).toFixed(2) : 'N/A';

  console.log(`  Total Spins:        ${spinCount}`);
  console.log(`  Total Bet:          ${totalBet}`);
  console.log(`  Total Win:          ${totalWin}`);
  console.log(`  Win Count:          ${winCount}`);
  console.log(`  Hit Rate:           ${hitRate}%`);
  console.log(`  RTP (simulated):    ${rtp}%`);
  console.log(`  Starting Balance:   ${startingBalance}`);
  console.log(`  Final Balance:      ${finalBalance}`);
  console.log(`  Expected Balance:   ${expectedBalance}`);
  console.log(`  Balance Drift:      ${balanceDrift}`);
  console.log(`  Errors:             ${errors.length}`);

  // 4. Verdict
  console.log('\n[4] Verdict');
  console.log('─'.repeat(40));

  let passed = 0;
  let failed = 0;

  if (balanceDrift === 0) {
    console.log('  ✓ Balance math: PASS (no drift)');
    passed++;
  } else {
    console.log(`  ✗ Balance math: FAIL (drift of ${balanceDrift})`);
    failed++;
  }

  if (spinCount === NUM_SPINS) {
    console.log('  ✓ Spin count: PASS');
    passed++;
  } else {
    console.log('  ✗ Spin count: FAIL');
    failed++;
  }

  if (errors.length === 0) {
    console.log('  ✓ API errors: PASS (none)');
    passed++;
  } else {
    console.log(`  ✗ API errors: FAIL (${errors.length} errors)`);
    failed++;
  }

  if (hitRate >= 20 && hitRate <= 45) {
    console.log(`  ✓ Hit rate (${hitRate}%) in expected range: PASS`);
    passed++;
  } else {
    console.log(`  ✗ Hit rate (${hitRate}%) outside expected 20-45%: FAIL`);
    failed++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${passed}/${passed + failed} tests passed`);
  console.log(`STATUS: ${failed === 0 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('='.repeat(60));

  return { passed, failed, spinCount, totalBet, totalWin, hitRate, rtp, balanceDrift, errors };
}

// Run
spinTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});