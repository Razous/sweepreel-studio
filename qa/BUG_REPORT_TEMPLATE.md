# Bug Report Template — Fruit Frenzy / SweepReel Studio

> Use this template for all bugs found during QA.

---

## BUG-{NNN}: {Short descriptive title}

### Severity
- [ ] **S1 — Critical**: Game crash, data loss, cannot play
- [ ] **S2 — High**: Major feature broken, wrong payouts, balance errors
- [ ] **S3 — Medium**: Non-critical feature broken, visual glitch
- [ ] **S4 — Low**: Cosmetic, text typo, minor alignment

### Environment
| Field | Value |
|-------|-------|
| Browser | {Chrome/Firefox/Safari/Edge} v{version} |
| OS | {Windows/macOS/iOS/Android} {version} |
| Viewport | {width} × {height} px |
| Device | {Desktop / iPhone 14 / Pixel 7 / iPad / etc.} |
| Game Version | {commit hash or version number} |
| Network | {WiFi / 3G / Offline} |

### Steps to Reproduce
1.
2.
3.
4.

### Expected Behavior
{What should happen}

### Actual Behavior
{What actually happens}

### Screenshots / Video
{Attach or link to evidence}

### Console Errors
{If applicable, paste from DevTools console}

### Additional Notes
{Any other context, frequency, workarounds}

---

## Example Filled Bug

```
BUG-001: Spin button remains active during reel animation

Severity: S3 — Medium

Environment:
- Browser: Chrome 125
- OS: macOS 14.5
- Viewport: 1440 × 900 px
- Device: Desktop MacBook Pro
- Game Version: v0.1.0

Steps:
1. Open Fruit Frenzy
2. Click SPIN rapidly 5 times in under 1 second
3. Observe the button state

Expected: After first click, spin button should be disabled until reels stop
Actual: All 5 clicks are registered; reels re-spin before previous ones finish

Console Errors: None

Additional: Happens ~80% of the time on rapid clicks
```

---

## Bug Tracking Log

| Bug ID | Title | Severity | Status | Reporter | Date |
|--------|-------|----------|--------|----------|------|
| - | - | - | - | - | - |