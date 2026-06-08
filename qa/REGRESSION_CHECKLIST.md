# Fruit Frenzy — Regression Test Checklist

> Run this checklist after every game build update to verify no regressions.

## Quick Smoke Test (5 min)
- [ ] Game loads without errors
- [ ] Initial balance displayed correctly
- [ ] Spin button is visible and clickable
- [ ] One spin completes (reels animate → stop)
- [ ] Balance deducted on spin
- [ ] Balance credited on win

## Core Mechanics (15 min)
- [ ] 10 manual spins produce different results
- [ ] All symbol types visible across 50 spins
- [ ] Wild symbol substitutes correctly (if wild on payline with another symbol)
- [ ] Scatter triggers free spins (3+ scatters)
- [ ] Free spins play without deducting balance
- [ ] Free spins counter works
- [ ] Retrigger adds more free spins
- [ ] Return to base game after free spins end

## Betting Controls (10 min)
- [ ] Bet up works
- [ ] Bet down works
- [ ] Min bet enforced
- [ ] Max bet enforced
- [ ] Bet > balance → warning or cap
- [ ] Zero balance → spin blocked

## Edge Cases (10 min)
- [ ] Rapid clicking spin (10 clicks in 1s)
- [ ] Refresh page mid-game
- [ ] Change bet during reel spin
- [ ] Tab away and back during spin
- [ ] Multiple tabs (same game session)

## Mobile (10 min)
- [ ] 320px width: no horizontal scrollbar
- [ ] Touch spin button works
- [ ] Buttons not overlapping
- [ ] Reels fit in viewport

## Performance (5 min)
- [ ] Load time < 3s on fast connection
- [ ] FPS stays above 55 during spin
- [ ] No memory spikes

---

## Regression Sign-off

| Area | Pass/Fail | Tester | Date |
|------|-----------|--------|------|
| Quick Smoke | | | |
| Core Mechanics | | | |
| Betting Controls | | | |
| Edge Cases | | | |
| Mobile | | | |
| Performance | | | |

**Overall:** [PASS / FAIL / BLOCKED]