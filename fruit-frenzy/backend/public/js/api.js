const API_BASE = '/api';

const gameAPI = {
    async initSession(playerId, gameId, initialBalance = 1000) {
        const response = await fetch(`${API_BASE}/session/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, gameId, initialBalance })
        });
        return response.json();
    },

    async getSession(sessionId) {
        const response = await fetch(`${API_BASE}/session/${sessionId}`);
        return response.json();
    },

    async adjustBalance(sessionId, amount) {
        const response = await fetch(`${API_BASE}/session/${sessionId}/adjust-balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        return response.json();
    },

    async getGameConfig(gameId) {
        const response = await fetch(`${API_BASE}/games/${gameId}`);
        return response.json();
    },

    async spin(gameId, bet, multiplier = 1) {
        const response = await fetch(`${API_BASE}/games/${gameId}/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bet, multiplier })
        });
        return response.json();
    }
};

window.sweepAPI = gameAPI;
