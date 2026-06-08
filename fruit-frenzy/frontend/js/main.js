document.addEventListener('DOMContentLoaded', async () => {
    const engine = new GameEngine('game-canvas');
    engine.loadAssets();
    const logic = new SlotLogic();
    
    let balance = 1000;
    let sessionId = null;
    let currentBet = 20;
    const betStep = 20;
    const minBet = 20;
    const maxBet = 400;

    // Initialize Session
    async function initSession() {
        try {
            const session = await sweepAPI.initSession('player1', 'fruit-frenzy', balance);
            if (session.error) {
                console.error('Session init error:', session.error);
                return false;
            }
            sessionId = session.id;
            balance = session.balance;
            updateUI();
            return true;
        } catch (e) {
            console.error('Failed to init session', e);
            return false;
        }
    }

    await initSession();

    const balanceDisplay = document.getElementById('balance-amount');
    const betDisplay = document.getElementById('bet-amount');
    const spinButton = document.getElementById('spin-button');
    const betUp = document.getElementById('bet-up');
    const betDown = document.getElementById('bet-down');

    let freeSpinsRemaining = 0;
    let isFreeSpinMode = false;

    function updateUI() {
        balanceDisplay.textContent = Math.floor(balance);
        betDisplay.textContent = currentBet;
        spinButton.disabled = (balance < currentBet && !isFreeSpinMode) || engine.isSpinning;
        if (isFreeSpinMode) {
            spinButton.textContent = `FREE SPINS: ${freeSpinsRemaining}`;
        } else {
            spinButton.textContent = 'SPIN';
        }
    }

    betUp.addEventListener('click', () => {
        if (currentBet + betStep <= maxBet) {
            currentBet += betStep;
            updateUI();
        }
    });

    betDown.addEventListener('click', () => {
        if (currentBet - betStep >= minBet) {
            currentBet -= betStep;
            updateUI();
        }
    });

    function startFreeSpins(count) {
        freeSpinsRemaining += count;
        isFreeSpinMode = true;
        updateUI();
        
        // Auto-spin for free spins
        setTimeout(handleSpin, 1000);
    }

    async function handleSpin() {
        if (engine.isSpinning) return;
        
        const bet = isFreeSpinMode ? 0 : currentBet;
        if (balance < bet && !isFreeSpinMode) return;

        if (!isFreeSpinMode) {
            balance -= bet;
            if (sessionId) {
                try {
                    const result = await sweepAPI.adjustBalance(sessionId, -bet);
                    if (result.error) {
                        balance += bet; // Refund local balance
                        updateUI();
                        alert('Session expired, reconnecting...');
                        await initSession();
                        return;
                    }
                    if (result.balance !== undefined) {
                        balance = result.balance;
                    }
                } catch (e) {
                    console.error('Failed to update bet on backend', e);
                    balance += bet; // Refund
                    updateUI();
                    return;
                }
            }
        } else {
            freeSpinsRemaining--;
        }
        updateUI();
        
        engine.startSpin();
        
        const multiplier = isFreeSpinMode ? 2 : 1;
        let spinResultData;
        try {
            spinResultData = await sweepAPI.spin('fruit-frenzy', currentBet, multiplier);
            if (spinResultData.error) {
                engine.stopSpin(engine.currentReelState);
                alert('Session expired, reconnecting...');
                await initSession();
                return;
            }
        } catch (e) {
            console.error('Spin failed', e);
            engine.stopSpin(engine.currentReelState);
            return;
        }

        setTimeout(async () => {
            engine.stopSpin(spinResultData.reelState);
            
            engine.onSpinEnd = async () => {
                if (spinResultData.totalWin > 0) {
                    balance += spinResultData.totalWin;
                    engine.highlightLines(spinResultData.winningLines, spinResultData.totalWin);
                    
                    if (sessionId) {
                        try {
                            const result = await sweepAPI.adjustBalance(sessionId, spinResultData.totalWin);
                            if (result.balance !== undefined) {
                                balance = result.balance;
                            }
                        } catch (e) {
                            console.error('Failed to update win on backend', e);
                        }
                    }
                }
                
                if (spinResultData.freeSpinsWon > 0) {
                    freeSpinsRemaining += spinResultData.freeSpinsWon;
                    isFreeSpinMode = true;
                }
                
                if (isFreeSpinMode && freeSpinsRemaining > 0) {
                    setTimeout(handleSpin, 1500);
                } else if (isFreeSpinMode && freeSpinsRemaining === 0) {
                    isFreeSpinMode = false;
                }
                
                updateUI();
                engine.onSpinEnd = null;
            };
        }, 1000);
    }

    spinButton.addEventListener('click', handleSpin);

    // External API
    window.gameAPI = {
        startSpin: () => {
            if (!engine.isSpinning && !isFreeSpinMode) {
                handleSpin();
            }
        },
        getReelState: () => engine.currentReelState,
        getBalance: () => balance,
        setBalance: (val) => {
            balance = val;
            updateUI();
        }
    };

    updateUI();
});
