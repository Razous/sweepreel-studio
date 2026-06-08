# Fruit Frenzy — QA Test Plan

> **Game:** Fruit Frenzy  
> **Studio:** SweepReel Studio  
> **Version:** 1.0.0 (in development)  
> **Last Updated:** June 2025  
> **QA Lead:** Agent QA Engineer

---

## 1. Scope

This test plan covers the Fruit Frenzy slot machine game built for the sweepstakes casino model. The game is expected to include:

- 5-reel, 3-row slot grid
- Paylines (configurable, target: 20)
- Standard fruit-themed symbols (cherries, lemon, orange, plum, grapes, watermelon, lucky 7, BAR, bell)
- Special symbols: Wild (star fruit) and Scatter (star)
- Free spins bonus round (triggered by 3+ scatters)
- RNG-based payout with 96.5% RTP target

---

## 2. Test Categories

### 2.1 Functional Tests (Spin Mechanics)

| Test ID | Test Description | Expected Result |
|---------|-----------------|-----------------|
| F-01 | Click spin → reels animate → stop at random positions | All 5 reels stop, showing 3 symbols each |
| F-02 | Spin button is disabled during reel animation | Cannot re-spin while reels are spinning |
| F-03 | Reel stop delay is consistent across spins | No erratic stopping; ~200-400ms per reel stop |
| F-04 | Consecutive spins produce visibly different results | Reel positions differ across spins |
| F-05 | Auto-spin (if implemented) runs until stopped | Auto-spin completes configured number of spins |

### 2.2 Payout & Payline Verification

| Test ID | Test Description | Expected Result |
|---------|-----------------|-----------------|
| P-01 | 3 matching symbols on a payline → win credited | Correct payout from paytable added to balance |
| P-02 | 4 matching symbols → higher payout | Multiplier applied per paytable |
| P-03 | 5 matching symbols → max line payout | Maximum multiplier per paytable |
| P-04 | Non-consecutive matches on payline → no win | No payout credited |
| P-05 | Multiple winning paylines → all paid | Sum of all line wins added to balance |
| P-06 | No matching symbols → no win | Balance unchanged (bet already deducted) |
| P-07 | Payline highlight/indicator visible | Current paylines shown on spin result |

### 2.3 Wild Symbol Tests

| Test ID | Test Description | Expected Result |
|---------|-----------------|-----------------|
| W-01 | Wild substitutes for any regular symbol | Payline with wild counts as matching line |
| W-02 | Multiple wilds on a payline | Payout calculated with wild substitution |
| W-03 | Wild does not substitute for scatter | Scatter rules unaffected by wild |
| W-04 | Wild-only payline pays at wild's value | If wild has its own payout, it applies |

### 2.4 Scatter Symbol Tests

| Test ID | Test Description | Expected Result |
|---------|-----------------|-----------------|
| S-01 | 3 scatters anywhere → free spins triggered | Free spins bonus round begins |
| S-02 | 4 scatters → more free spins | Higher count of free spins (e.g., 15) |
| S-03 | 5 scatters → max free spins | Highest free spin count (e.g., 20) |
| S-04 | Scatter wins are added to line wins | Scatter payouts + line payouts both credited |
| S-05 | Scatter pays regardless of payline position | Scatter is position-independent |

### 2.5 Free Spins Bonus Round

| Test ID | Test Description | Expected Result |
|---------|-----------------|-----------------|
| B-01 | Free spins round starts with visual indicator | "Free Spins" banner/notification shown |
| B-02 | Free spins cost zero bet | Balance unchanged during free spins |
| B-03 | Free spins wins are real wins | Wins added to balance |
| B-04 | Free spin counter decrements correctly | Counter shows remaining free spins |
| B-05 | Retrigger during free spins | Additional free spins added to remaining count |
| B-06 | Free spins end, returns to base game | Normal gameplay resumes after count hits 0 |
| B-07 | All bets/balance states normal after free spins | Balance correctly reflects wins from free spins |

### 2.6 Betting & Balance

| Test ID | Test Description | Expected Result |
|---------|-----------------|-----------------|
| B-01 | Bet deducted from balance before spin | Balance decreases by bet amount |
| B-02 | Win credited to balance after spin | Balance increases by win amount |
| B-03 | Bet amount can be changed | Bet selector works, shows current bet |
| B-04 | Bet respects min/max limits | Cannot bet below min or above max |
| B-05 | Balance persists across sessions | Session management maintains balance |

### 2.7 Edge Cases

| Test ID | Test Description | Expected Result |
|---------|-----------------|-----------------|
| E-01 | Rapid spin clicking (10+ clicks in 1s) | Only one spin executes; button debounced |
| E-02 | Spin with zero balance | Spin prevented; "Insufficient balance" message |
| E-03 | Attempt negative bet | Bet cannot go below minimum |
| E-04 | Bet amount > balance | Bet capped to balance or prevented |
| E-05 | Multiple browser tabs, same session | Consistent behavior or clear error handling |
| E-06 | Page refresh mid-spin | Graceful recovery or session restore |
| E-07 | Disconnect/reconnect during spin | Network error shown; retry button |
| E-08 | Empty/undefined initial balance | Graceful default or error; no crash |

---

## 3. Mobile Responsiveness

| Test ID | Viewport Width | Test Description |
|---------|---------------|-----------------|
| M-01 | 320px (iPhone SE) | Full game playable, no horizontal scroll |
| M-02 | 375px (iPhone 13) | Reels visible, buttons tappable |
| M-03 | 414px (iPhone Plus/Max) | Comfortable layout |
| M-04 | 768px (iPad) | Game scales appropriately |
| M-05 | 1024px (iPad landscape) | No distortion |
| M-06 | 1440px-1920px (Desktop) | Centered, not stretched |

**Mobile-specific checks:**
- Touch events work (no double-tap issues)
- Buttons are ≥ 44px tall for touch targets
- No text overflow or cut-off UI
- Portrait and landscape orientations supported
- Pinch-zoom does not break layout
- Viewport meta tag is correct

---

## 4. Cross-Browser Testing

| Browser | Min Version | Priority |
|---------|------------|----------|
| Chrome | 120+ | Critical |
| Firefox | 115+ | Critical |
| Safari | 17+ | High |
| Edge | 120+ | High |

**Per-browser checklist:**
- Spin mechanics function identically
- Canvas/WebGL rendering matches
- No console errors
- Animation frame rates are consistent
- Audio plays correctly (if implemented)
- Font rendering is acceptable

---

## 5. Performance Tests

| Metric | Target | Test Method |
|--------|--------|-------------|
| Initial load time | < 3 seconds | Network tab timing (DevTools) |
| Spin animation FPS | 60fps | requestAnimationFrame profiling |
| Memory usage | < 200MB | Performance tab / heap snapshot |
| Asset loading | All assets < 5MB total | Network tab |
| Frame drops per spin | 0-2 drops | DevTools performance recording |

**Performance test procedure:**
1. Record a 60-second gameplay session
2. Note FPS during idle, spinning, and win animations
3. Take heap snapshot before and after 50 spins
4. Compare memory delta

---

## 6. UX/UI Consistency

| Check | Description |
|-------|-------------|
| Color scheme | Matches approved design palette |
| Typography | Consistent font family, size, weight |
| Button states | Hover, active, disabled all styled |
| Win animations | Smooth, not jarring |
| Paytable readability | Symbols identifiable, values clear |
| Loading states | Spinner/placeholder shown while loading |
| Sound hooks | If present, audio plays on correct events |
| Responsive breakpoints | No overlapping or clipped elements |

---

## 7. Sound Integration (if applicable)

| Test ID | Description |
|---------|-------------|
| A-01 | Reel spin sound plays on spin |
| A-02 | Win jingle on any payout > 0 |
| A-03 | Big win animation/sound for high payouts |
| A-04 | Free spins intro audio |
| A-05 | Mute button works |
| A-06 | Sound doesn't overlap/stack on rapid spins |

---

## 8. API / Backend Integration Tests

| Test ID | Test | Expected |
|---------|------|----------|
| API-01 | POST /api/session/init | Returns session with balance |
| API-02 | POST /api/session/{id}/adjust-balance | Balance updated correctly |
| API-03 | GET /api/games | Returns game configs |
| API-04 | POST invalid session ID | 404 error |
| API-05 | Missing required fields | 400 error |
| API-06 | Negative balance adjustment | Balance can go negative? (Clarify: should it?) |

---

## 9. Test Environment

| Config | Value |
|--------|-------|
| OS | Ubuntu 22.04 / macOS / Windows 11 |
| Browsers | Chrome 125, Firefox 128, Safari 17.5, Edge 125 |
| Mobile | iOS 17 (Safari), Android 14 (Chrome) |
| Network | Cable (zero latency), 3G throttled, offline |
| Dev Tools | Chrome DevTools, Puppeteer/Playwright |

---

## 10. Test Execution Log

| Date | Test Category | Result | Tester | Notes |
|------|---------------|--------|--------|-------|
| - | - | - | - | - |

---

## 11. Approval Criteria

To ship Fruit Frenzy, the game must pass:
- [ ] All **P-01 through P-07** payout tests pass
- [ ] All **F-01 through F-04** functional tests pass
- [ ] All **B-01 through B-05** bet/balance tests pass
- [ ] No **Severity 1 (Critical)** or **Severity 2 (High)** open bugs
- [ ] Mobile testing on **320px, 375px, 768px** all pass
- [ ] Cross-browser: Chrome + Firefox + Safari all pass
- [ ] Load time ≤ 3s on simulated 3G
- [ ] RTP within ±1% of target (96.5%) over 10,000 simulated spins