# Fruit Frenzy: Demo Experience Notes for Operators

Welcome to the SweepReel Studio demo experience. This sandbox environment simulates how our games integrate into your platform.

## What to Look For

### 1. Seamless Platform Embedding
The demo showcases the game running within a mock operator dashboard. Notice how the game scales to fit the container while maintaining high-fidelity graphics. This mimics our standard iframe/SDK integration.

### 2. Dual-Currency Support (Gold Coins & Sweeps Coins)
Our engine is built for the sweepstakes model. In the demo, you can toggle between virtual currencies to see how the UI and balance handling adapt.
- **Gold Coins:** For social, play-for-fun sessions.
- **Sweeps Coins:** For promotional play with bonus mechanics.

### 3. Expanding Wilds (The "Frenzy" Mechanic)
When a **Wild Starfruit** lands on the 3rd reel, it expands to cover the entire column. This is a high-engagement event designed to trigger "near-miss" psychology and big-win excitement.

### 4. Free Spins Bonus Round
Landing 3 or more **Scatter Stars** triggers the Free Spins mode. 
- Watch the background shift to the "Bonus" theme.
- Note the 2x multiplier applied to all wins during this phase.
- This is a primary retention driver for our players.

### 5. Performance on Mobile
If you are on a desktop, try resizing your browser or using "Inspect Element" to view the mobile layout. Our Canvas-based engine ensures 60fps performance even on mid-range mobile devices.

### 6. Backend Integration
The "Balance" you see is being updated via a secure REST API call to our backend for every spin. In a real integration, this would connect directly to your platform's wallet API.

---

## Technical Quick-Stats for Operators
- **RTP:** 96% (Configurable per operator)
- **Volatility:** Medium-High
- **Max Win:** 5000x Bet
- **Format:** HTML5 / Canvas (No plugins required)
