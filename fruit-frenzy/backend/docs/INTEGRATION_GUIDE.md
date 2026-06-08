# Fruit Frenzy - Operator Integration Guide

Welcome to the Fruit Frenzy integration guide. This document provides step-by-step instructions for operators to integrate our slot game into their sweepstakes platform.

## Architecture

The integration follows a standard client-server pattern:
1.  **Operator Backend** initializes a session with SweepReel.
2.  **Operator Frontend** embeds the SweepReel game client (iframe/canvas).
3.  **SweepReel Server** handles game logic and RNG.
4.  **Balance Updates** are communicated via the Session API.

## API Endpoints

### 1. Game Configuration
`GET /api/games`
Lists all available games.

`GET /api/games/:id?operatorId={id}`
Returns configuration for a specific game, including symbol values and bet limits. Supports operator-specific overrides.

### 2. Session Management
`POST /api/session/init`
Initialize a new game session for a player.
**Request Body:**
```json
{
  "playerId": "string",
  "gameId": "string",
  "initialBalance": number,
  "currency": "string"
}
```

`POST /api/session/:id/adjust-balance`
Adjust player balance (used for bets and wins).
**Request Body:**
```json
{
  "amount": number
}
```

## White-label Configuration
Operators can override game settings (RTP, bet limits) using:
`POST /api/games/:id/configure`
**Request Body:**
```json
{
  "operatorId": "string",
  "overrides": {
    "rtp": 97.0,
    "maxBet": 500
  }
}
```
