# QA Status Report — Fruit Frenzy v1.0.0 (Full Test Results)

**Date:** June 2025  
**QA Lead:** Agent QA Engineer  
**Status:** 🔴 Multiple Bugs Found — Requires Fixes

---

## 1. Test Summary

| Test Category | Result | Notes |
|--------------|--------|-------|
| ✅ Game loads & renders | PASS | Canvas game renders at localhost:3000 |
| ✅ Spin mechanics work | PASS | Spins animate, reels stop, win animation plays |
| ✅ Bet controls work | PASS | Bet up/down increments correctly (20-400 range) |
| ✅ Balance deducted | PASS | Bet correctly deducted from balance on spin |
| ✅ Win crediting | PASS | Wins credited correctly (verified 975 after win of 15) |
| ❌ Balance goes to NaN | FAIL | After ~3 spins with stale session, shows NaN (S2) |
| ❌ Missing asset file | FAIL | `lucky_7.png` missing — engine falls back to colored circles (S3) |
| ❌ API BASE hardcoded | FAIL | `localhost:3000` hardcoded in api.js (S3) |
| ⚠️ Session persistence | WARN | In-memory sessions lost on server restart |
| ⚠️ Asset sizes | WARN | PNGs are 1-1.5MB — will cause slow load times |
| ⚠️ CORS wide open | WARN | No CORS restrictions |

---

## 2. Bug Reports

### BUG-100: Missing asset file `lucky_7.png` (severity: S3)
**Environment:** Chrome 125, localhost:3000
**Steps:**
1. Open http://localhost:3000/
2. Check console for asset loading errors
**Expected:** All 12 symbols load from assets/symbols/
**Actual:** symbolMap in engine.js maps `seven` → `lucky_7.png` but file is named `sevens.png`. Fallback draws colored circles instead.
**Fix:** Rename `sevens.png` to `lucky_7.png` or update symbolMap to `seven: 'sevens'`

---

### BUG-101: Balance displays NaN after session expiry (severity: S2)
**Environment:** Chrome 125, localhost:3000
**Steps:**
1. Open http://localhost:3000/ (balance: 1000)
2. Spin 1-2 times (balance updates correctly)
3. Restart the backend server
4. Click SPIN again
**Expected:** Graceful error handling, session refresh, or re-init
**Actual:** Balance displays "NaN". User cannot continue playing.
**Root Cause:** API sessions are in-memory. After server restart, `sweepAPI.adjustBalance()` returns `{ error: 'Session not found' }` instead of `{ balance: N }`. The code does `balance = result.balance` where `result.balance` is undefined, making balance NaN.
**Fix:** Check for `result.error` before updating balance. If error, re-init session or show error message.

---

### BUG-102: API_BASE hardcoded to localhost:3000 (severity: S3)
**File:** `/home/team/shared/fruit-frenzy/frontend/js/api.js`
```javascript
const API_BASE = 'http://localhost:3000/api';
```
**Fix:** Make API_BASE configurable via environment variable or page URL parameter.

---

### BUG-103: No negative balance check on backend (severity: S2)
**File:** `/home/team/shared/fruit-frenzy/backend/src/controllers/sessionController.ts`
**Steps:**
1. POST to `/api/session/{id}/adjust-balance` with `{"amount": -999999}`
**Expected:** Balance cannot go below 0
**Actual:** Balance goes negative. Not checked.
**Impact:** In sweepstakes model, players should not be able to bet more than their balance.

---

## 3. Functional Test Results

### F-01 to F-04: Spin Mechanics
| Test | Result | Notes |
|------|--------|-------|
| F-01: Click spin → reels animate | ✅ PASS | Reels spin then stop at staggered intervals |
| F-02: Spin disabled during animation | ✅ PASS | `engine.isSpinning` flag prevents re-spin |
| F-03: Reel stop delay consistent | ✅ PASS | ~300ms stagger between reels |
| F-04: Consecutive spins differ | ✅ PASS | Each spin produces different symbol positions |

### P-01 to P-07: Payout Logic
| Test | Result | Notes |
|------|--------|-------|
| P-01: 3 matching → win | ✅ PASS | Verified win of 15 with bet 20 (balance 975) |
| P-05: Multiple winning paylines | ✅ PASS | Sum of all line wins added (verified in code logic.js) |
| P-06: No match → no win | ✅ PASS | Balance only deducted by bet amount |
| P-07: Payline highlight | ✅ PASS | `engine.highlightLines()` draws lines on win |

### B-01 to B-05: Betting & Balance
| Test | Result | Notes |
|------|--------|-------|
| B-01: Bet deducted before spin | ✅ PASS | balance -= currentBet executed before spin |
| B-02: Win credited after spin | ✅ PASS | balance += winResult.totalWin in callback |
| B-03: Bet amount can be changed | ✅ PASS | +/- buttons adjust by 20 steps |
| B-04: Bet min/max enforced | ✅ PASS | Min 20, Max 400 (in code main.js:26-28) |

### W-01 to W-04: Wild Symbol
| Test | Result | Notes |
|------|--------|-------|
| W-01: Wild substitutes on payline | ✅ PASS | Verified in logic.js `calculateWins()` |
| W-02: Wild expansion on middle reel | ✅ PASS | Code confirms middle reel wild → full reel wild |

### S-01 to S-05: Scatter & Free Spins
| Test | Result | Notes |
|------|--------|-------|
| S-01: 3 scatters → free spins | ✅ COVERED | Trigger 10 free spins with 2x multiplier (logic.js) |
| B-01 to B-07: Free spin behavior | ✅ COVERED | Auto-advances, no balance cost, 2x multiplier |

---

## 4. API Integration Tests

| Test | Result | Notes |
|------|--------|-------|
| POST /api/session/init | ✅ PASS | Returns session with balance |
| POST /adjust-balance (bet) | ✅ PASS | Balance deducted correctly |
| POST /adjust-balance (win) | ✅ PASS | Win credited correctly |
| GET /api/games | ✅ PASS | Returns game config with RTP 96.5% |
| Invalid session ID | ✅ PASS | Returns 404 { error: 'Session not found' } |
| Missing fields | ✅ PASS | Returns 400 with error message |

---

## 5. Code Review Findings

### Strengths
- Clean separation of concerns: engine.js (render), logic.js (game rules), main.js (controller)
- 20 paylines with varied patterns
- Wild expansion mechanic creates excitement
- Responsive CSS with `@media (max-width: 600px)`
- Canvas resize handling via window resize listener

### Issues Found
1. **Frontend API_BASE hardcoded** — won't work in production deployment
2. **No error handling for API failures** — uses `try/catch` but doesn't handle errors gracefully
3. **Balance update race condition** — local `balance` var and API `balance` can get out of sync
4. **No loading state** — canvas renders before assets load; asset loading errors silently ignored
5. **Console log leaks** — win amounts, spin states logged to console (security concern for production)
6. **No bet value display in credits** — bet shown as raw number without currency unit

---

## 6. Performance Notes

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Load time | TBD (large PNG assets) | < 3s | ⚠️ Needs measurement |
| Canvas rendering | ✅ requestAnimationFrame | 60fps | ✅ Good |
| Asset count | 15 PNGs | - | ⚠️ PNGs are 1-1.5MB, optimize with WebP |

---

## 7. Mobile Responsiveness Check

| Viewport | Status | Notes |
|----------|--------|-------|
| 320px (iPhone SE) | ⚠️ | Canvas resizes via scale() but UI elements may overlap |
| 375px (iPhone 13) | ⚠️ | CSS media query at 600px handles layout change |
| 768px (iPad) | ✅ | Good — canvas fills screen |
| 1920px (Desktop) | ✅ | Canvas centered, max 1280px |

**Issue:** The CSS media query breakpoint at 600px may not be low enough for very small screens.

---

## 8. Overall Verdict

### ✅ Passed (Must-have)
- Game loads and renders a 5-reel slot machine with Canvas
- Spin mechanics work correctly with staggered reel stops
- Bet controls adjust in 20-credit increments
- Balance is deducted correctly on each spin
- 20 paylines with complex patterns
- Wild symbol substitution and expansion on middle reel
- Scatter detection and free spins trigger (10 free spins, 2x multiplier)
- Win animation with line highlights and overlay
- Responsive layout for desktop/tablet

### ❌ Failed (Must fix before ship)
- **BUG-100: Missing asset file `lucky_7.png`** — 1 symbol falls back to colored circle
- **BUG-101: Balance NaN on session expiry** — breaks the game after server restart
- **BUG-102: API_BASE hardcoded** — won't work in production

### ⚠️ Warning (Should fix)
- **BUG-103: No negative balance protection** — risk in sweepstakes model
- Asset sizes too large (1-1.5MB per PNG)
- No loading state / error handling for API failures
- Console.log leaks game state

---

## 9. Recommended Fix Priority

1. **P0 (BLOCKING):** Fix BUG-101 (NaN balance) — session/API error handling
2. **P0 (BLOCKING):** Fix BUG-100 (missing lucky_7.png asset)
3. **P1 (HIGH):** Fix BUG-102 (API_BASE hardcoded)
4. **P1 (HIGH):** Fix BUG-103 (negative balance check in API)
5. **P2 (MEDIUM):** Optimize asset sizes (WebP)
6. **P2 (MEDIUM):** Add loading state and error UI
7. **P3 (LOW):** Remove console.log leaks
8. **P3 (LOW):** Adjust mobile breakpoint for < 600px screens