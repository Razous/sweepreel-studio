# Sweepstakes Compliance & RNG Documentation

## Random Number Generation (RNG)
Our games utilize a cryptographically secure pseudo-random number generator (CSPRNG) to ensure fair outcomes.
-   **Algorithm:** `crypto.getRandomValues()` (or equivalent Node.js `crypto` module).
-   **Seeding:** Each spin request generates a new seed to prevent predictability.
-   **Certification:** Our RNG logic is designed to meet GLI-19 standards (Certification in progress).

## Sweepstakes Model Compliance
Fruit Frenzy is built specifically for the US/Global sweepstakes model:
1.  **Virtual Currencies:** The game operates using Gold Coins (GC) or Sweep Coins (SC).
2.  **No Real Money Wagering:** Players use bonus credits obtained through "no purchase necessary" mechanics.
3.  **Transparency:** All winning combinations and probabilities are clearly listed in the in-game paytable.

## Data Privacy
-   No PII (Personally Identifiable Information) is required by the SweepReel backend. 
-   Operators use an opaque `playerId` to link sessions to their internal systems.
