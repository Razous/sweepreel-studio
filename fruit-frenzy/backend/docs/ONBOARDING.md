# Operator Onboarding Flow

## 1. Credentials
Operators are assigned a `client_id` and `client_secret`.
These are used to sign requests and authenticate API calls.

## 2. API Key Generation
To generate an API key:
1. Log in to the SweepReel Partner Portal.
2. Navigate to "Settings" > "API Keys".
3. Click "Generate New Key".

## 3. Webhook Setup
To receive real-time balance updates and session events:
1. Provide a `webhook_url` in the Partner Portal.
2. The SweepReel backend will send POST requests to this URL for:
    -   `session.started`
    -   `session.ended`
    -   `balance.update` (for large wins)

### Example Webhook Payload
```json
{
  "event": "balance.update",
  "data": {
    "sessionId": "uuid",
    "playerId": "user_123",
    "amount": 5000,
    "reason": "JACKPOT"
  },
  "timestamp": "2023-10-27T10:00:00Z"
}
```
