import { Symbol, GameConfig } from '../models/game.js';

export class SlotService {
  private symbols: Record<string, Symbol>;
  private weights: Record<string, number>;
  private reelStrips: string[][];
  private reels = 5;
  private rows = 3;
  private paylines: number[][];

  constructor(symbols: Symbol[], paylines: number[][] = []) {
    this.symbols = symbols.reduce((acc, sym) => ({ ...acc, [sym.id.toUpperCase()]: sym }), {});
    this.paylines = paylines;
    this.weights = {
      cherry: 20, lemon: 18, orange: 15, plum: 13, grapes: 10,
      watermelon: 8, bell: 6, seven: 3.5, bar_single: 4, bar_triple: 1.5,
      wild_starfruit: 0.5, scatter_star: 0.5
    };
    this.reelStrips = this.generateReelStrips();
  }

  private generateReelStrips() {
    const strips = [];
    const baseStrip: string[] = [];
    for (const [id, weight] of Object.entries(this.weights)) {
      for (let i = 0; i < weight * 2; i++) {
        baseStrip.push(id.toUpperCase());
      }
    }

    for (let i = 0; i < this.reels; i++) {
      const strip = [...baseStrip].sort(() => Math.random() - 0.5);
      strips.push(strip);
    }
    return strips;
  }

  public getRandomReelState(): Symbol[][] {
    const state: Symbol[][] = [];
    for (let i = 0; i < this.reels; i++) {
      const strip = this.reelStrips[i];
      const stopIndex = Math.floor(Math.random() * strip.length);
      const reel: Symbol[] = [];
      for (let j = 0; j < this.rows; j++) {
        const symbolId = strip[(stopIndex + j) % strip.length];
        const symbol = this.symbols[symbolId];
        reel.push(symbol || this.symbols['CHERRY']); // Fallback
      }
      state.push(reel);
    }
    return state;
  }

  public calculateWins(reelState: Symbol[][], betPerLine: number, multiplier: number = 1) {
    let totalWin = 0;
    const winningLines: any[] = [];
    const scatterPositions: any[] = [];
    let wildExpanded = false;

    // Check Wild Expansion (middle reel - index 2)
    const middleReel = reelState[2];
    let hasWildOnMiddle = false;
    for (let j = 0; j < this.rows; j++) {
      if ((middleReel[j] as any).isWild) {
        hasWildOnMiddle = true;
        break;
      }
    }

    const effectiveState = JSON.parse(JSON.stringify(reelState));
    if (hasWildOnMiddle) {
      wildExpanded = true;
      for (let j = 0; j < this.rows; j++) {
        effectiveState[2][j] = this.symbols['WILD_STARFRUIT'];
      }
    }

    // Check Paylines
    this.paylines.forEach((line, index) => {
      let matchCount = 1;
      let firstSymbol = effectiveState[0][line[0]];

      let targetSymbol = firstSymbol;
      if ((firstSymbol as any).isWild) {
        for (let i = 1; i < this.reels; i++) {
          const sym = effectiveState[i][line[i]];
          if (!(sym as any).isWild && !(sym as any).isScatter) {
            targetSymbol = sym;
            break;
          }
        }
      }

      if ((targetSymbol as any).isScatter) return;

      for (let i = 1; i < this.reels; i++) {
        const sym = effectiveState[i][line[i]];
        if (sym.id === targetSymbol.id || (sym as any).isWild) {
          matchCount++;
        } else {
          break;
        }
      }

      const payout = (targetSymbol as any).payout;
      if (payout && payout[matchCount - 1] > 0) {
        const winAmount = payout[matchCount - 1] * betPerLine * multiplier;
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
        if ((reelState[i][j] as any).isScatter) {
          scatterCount++;
          scatterPositions.push({ reel: i, row: j });
        }
      }
    }

    let freeSpinsWon = 0;
    if (scatterCount >= 3) {
      freeSpinsWon = 10;
      const scatterPayouts = [0, 0, 10, 25, 100, 500];
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
