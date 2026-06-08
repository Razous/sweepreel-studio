class SlotLogic {
    constructor() {
        this.reels = 5;
        this.rows = 3;
        this.paylines = PAYLINES;
        this.symbols = SYMBOLS;
        this.rtp = 0.965;
        
        // REEL_WEIGHTS from QA
        // cherry: 20, lemon: 18, orange: 15, plum: 13, grapes: 10,
        // watermelon: 8, bell: 6, seven: 3.5, bar_single: 4, bar_triple: 1.5,
        // wild_starfruit: 0.5, scatter_star: 0.5
        
        this.weights = {
            cherry: 20, lemon: 18, orange: 15, plum: 13, grapes: 10,
            watermelon: 8, bell: 6, seven: 3.5, bar_single: 4, bar_triple: 1.5,
            wild_starfruit: 0.5, scatter_star: 0.5
        };

        this.reelStrips = this.generateReelStrips();
    }

    generateReelStrips() {
        const strips = [];
        const baseStrip = [];
        for (const [id, weight] of Object.entries(this.weights)) {
            // Scale weights to total 200 for more variety
            for (let i = 0; i < weight * 2; i++) {
                baseStrip.push(id.toUpperCase());
            }
        }

        for (let i = 0; i < this.reels; i++) {
            // Shuffle baseStrip for each reel
            const strip = [...baseStrip].sort(() => Math.random() - 0.5);
            strips.push(strip);
        }
        return strips;
    }

    getRandomReelState() {
        const state = [];
        for (let i = 0; i < this.reels; i++) {
            const strip = this.reelStrips[i];
            const stopIndex = Math.floor(Math.random() * strip.length);
            const reel = [];
            for (let j = 0; j < this.rows; j++) {
                const symbolId = strip[(stopIndex + j) % strip.length];
                reel.push(this.symbols[symbolId]);
            }
            state.push(reel);
        }
        return state;
    }

    calculateWins(reelState, betPerLine, multiplier = 1) {
        let totalWin = 0;
        const winningLines = [];
        const scatterPositions = [];
        let wildExpanded = false;

        // Check Wild Expansion (middle reel - index 2)
        const middleReel = reelState[2];
        let hasWildOnMiddle = false;
        for (let j = 0; j < this.rows; j++) {
            if (middleReel[j].isWild) {
                hasWildOnMiddle = true;
                break;
            }
        }

        const effectiveState = JSON.parse(JSON.stringify(reelState));
        if (hasWildOnMiddle) {
            wildExpanded = true;
            for (let j = 0; j < this.rows; j++) {
                effectiveState[2][j] = this.symbols.WILD_STARFRUIT;
            }
        }

        // Check Paylines
        this.paylines.forEach((line, index) => {
            let matchCount = 1;
            let firstSymbol = effectiveState[0][line[0]];
            
            let targetSymbol = firstSymbol;
            if (firstSymbol.isWild) {
                for (let i = 1; i < this.reels; i++) {
                    const sym = effectiveState[i][line[i]];
                    if (!sym.isWild && !sym.isScatter) {
                        targetSymbol = sym;
                        break;
                    }
                }
            }

            if (targetSymbol.isScatter) return;

            for (let i = 1; i < this.reels; i++) {
                const sym = effectiveState[i][line[i]];
                if (sym.id === targetSymbol.id || sym.isWild) {
                    matchCount++;
                } else {
                    break;
                }
            }

            if (targetSymbol.payout && targetSymbol.payout[matchCount - 1] > 0) {
                const winAmount = targetSymbol.payout[matchCount - 1] * betPerLine * multiplier;
                totalWin += winAmount;
                winningLines.push({
                    lineIndex: index,
                    symbolId: targetSymbol.id,
                    count: matchCount,
                    win: winAmount
                });
            }
        });

        // Check Scatters
        let scatterCount = 0;
        for (let i = 0; i < this.reels; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (reelState[i][j].isScatter) {
                    scatterCount++;
                    scatterPositions.push({ reel: i, row: j });
                }
            }
        }

        let freeSpinsWon = 0;
        if (scatterCount >= 3) {
            freeSpinsWon = 10;
            // Scatters also pay
            const scatterPayouts = [0, 0, 10, 25, 100, 500]; // From payline_checker
            const scatterWin = (scatterPayouts[scatterCount] || 500) * betPerLine * multiplier;
            totalWin += scatterWin;
        }

        return {
            totalWin,
            winningLines,
            freeSpinsWon,
            scatterPositions,
            wildExpanded,
            reelState: effectiveState
        };
    }
}
