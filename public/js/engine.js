class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 1280;
        this.height = 720;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.reels = 5;
        this.rows = 3;
        this.reelWidth = 200;
        this.reelHeight = 450;
        this.symbolSize = 150;
        
        this.reelX = (this.width - (this.reels * this.reelWidth)) / 2;
        this.reelY = 100;
        
        this.reelPositions = [0, 0, 0, 0, 0];
        this.reelSpeeds = [0, 0, 0, 0, 0];
        this.isSpinning = false;
        this.spinStates = ['idle', 'idle', 'idle', 'idle', 'idle']; // idle, spinning, stopping
        
        this.symbols = SYMBOL_LIST;
        this.currentReelState = this.getInitialReelState();
        this.targetReelState = null;
        
        this.assets = {};
        this.placeholders = true;

        this.winningLines = [];
        this.showWinAnimation = false;
        this.winAnimationTimer = 0;

        this.loading = true;
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.animate();
    }

    getInitialReelState() {
        const state = [];
        for (let i = 0; i < this.reels; i++) {
            const reel = [];
            for (let j = 0; j < this.rows + 2; j++) { // Extra for overlap
                reel.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
            }
            state.push(reel);
        }
        return state;
    }

    resize() {
        const container = this.canvas.parentElement;
        const w = container.clientWidth;
        const h = container.clientHeight;
        
        const scale = Math.min(w / this.width, h / this.height);
        this.canvas.style.width = (this.width * scale) + 'px';
        this.canvas.style.height = (this.height * scale) + 'px';
    }

    async loadAssets() {
        const symbolMap = {
            cherry: 'cherries',
            lemon: 'lemon',
            orange: 'orange',
            plum: 'plum',
            grapes: 'grapes',
            watermelon: 'watermelon',
            bell: 'bell',
            seven: 'lucky_7',
            bar_single: 'bar_single',
            bar_triple: 'bar_triple',
            wild_starfruit: 'wild_starfruit',
            scatter_star: 'scatter_star'
        };
        const bgFiles = ['game_bg', 'reel_bg', 'bonus_bg'];
        
        const load = (path, id) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.assets[id] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load asset: ${id} at ${path}`);
                    resolve();
                };
                img.src = path;
            });
        };

        const promises = [
            ...Object.entries(symbolMap).map(([id, file]) => load(`assets/symbols/${file}.png`, id)),
            ...bgFiles.map(id => load(`assets/backgrounds/${id}.png`, id))
        ];
        
        await Promise.all(promises);
        this.loading = false;
    }

    highlightLines(lines, winAmount) {
        this.winningLines = lines;
        this.lastWinAmount = winAmount;
        this.showWinAnimation = true;
        this.winAnimationTimer = Date.now();
    }

    clearHighlights() {
        this.winningLines = [];
        this.showWinAnimation = false;
    }

    startSpin() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.clearHighlights();
        for (let i = 0; i < this.reels; i++) {
            this.spinStates[i] = 'spinning';
            this.reelSpeeds[i] = 20 + Math.random() * 10;
        }
    }

    stopSpin(targetState) {
        this.targetReelState = targetState;
        this.currentReelState = JSON.parse(JSON.stringify(targetState));
        // Add extra symbols for overlap animation
        for (let i = 0; i < this.reels; i++) {
            this.currentReelState[i].unshift(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
            this.currentReelState[i].push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
        }

        for (let i = 0; i < this.reels; i++) {
            setTimeout(() => {
                this.spinStates[i] = 'idle';
                this.reelPositions[i] = 0;
                if (i === this.reels - 1) {
                    this.isSpinning = false;
                    if (this.onSpinEnd) this.onSpinEnd();
                }
            }, i * 300 + 500);
        }
    }

    update() {
        for (let i = 0; i < this.reels; i++) {
            if (this.spinStates[i] === 'spinning' || this.spinStates[i] === 'stopping') {
                this.reelPositions[i] += this.reelSpeeds[i];
                
                if (this.reelPositions[i] >= this.symbolSize) {
                    this.reelPositions[i] -= this.symbolSize;
                    this.currentReelState[i].pop();
                    const nextSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                    this.currentReelState[i].unshift(nextSymbol);
                }
            }
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.loading) {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LOADING...', this.width / 2, this.height / 2);
            return;
        }

        if (this.assets['game_bg']) {
            this.ctx.drawImage(this.assets['game_bg'], 0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        for (let i = 0; i < this.reels; i++) {
            const x = this.reelX + (i * this.reelWidth);
            
            if (this.assets['reel_bg']) {
                this.ctx.drawImage(this.assets['reel_bg'], x + 5, this.reelY, this.reelWidth - 10, this.reelHeight);
            } else {
                this.ctx.fillStyle = '#222';
                this.ctx.fillRect(x + 5, this.reelY, this.reelWidth - 10, this.reelHeight);
            }
            
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(x, this.reelY, this.reelWidth, this.reelHeight);
            this.ctx.clip();
            
            for (let j = 0; j < this.currentReelState[i].length; j++) {
                const y = this.reelY + (j - 1) * this.symbolSize + this.reelPositions[i];
                this.drawSymbol(this.currentReelState[i][j], x + this.reelWidth / 2, y + this.symbolSize / 2);
            }
            this.ctx.restore();
        }
        
        this.ctx.strokeStyle = '#ffcc00';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(this.reelX, this.reelY, this.reels * this.reelWidth, this.reelHeight);

        if (this.showWinAnimation) {
            this.drawWinningLines();
            this.drawWinAmount();
        }
    }

    drawWinAmount() {
        const now = Date.now();
        if (!this.lastWinAmount || now - this.winAnimationTimer > 5000) return;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.width / 2 - 200, this.height / 2 - 50, 400, 100);
        
        this.ctx.strokeStyle = '#ffcc00';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(this.width / 2 - 200, this.height / 2 - 50, 400, 100);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(`WIN: ${this.lastWinAmount}`, this.width / 2, this.height / 2 + 15);
        this.ctx.restore();
    }

    drawWinningLines() {
        const now = Date.now();
        const cycle = Math.floor((now - this.winAnimationTimer) / 500) % (this.winningLines.length + 1);
        
        this.winningLines.forEach((win, index) => {
            if (cycle === 0 || cycle === index + 1) {
                const line = PAYLINES[win.lineIndex];
                this.ctx.beginPath();
                this.ctx.lineWidth = 8;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                
                for (let i = 0; i < win.count; i++) {
                    const x = this.reelX + (i * this.reelWidth) + this.reelWidth / 2;
                    const y = this.reelY + (line[i] * this.symbolSize) + this.symbolSize / 2;
                    if (i === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
                this.ctx.stroke();
                
                for (let i = 0; i < win.count; i++) {
                    const x = this.reelX + (i * this.reelWidth) + this.reelWidth / 2;
                    const y = this.reelY + (line[i] * this.symbolSize) + this.symbolSize / 2;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 70, 0, Math.PI * 2);
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.lineWidth = 3;
                    this.ctx.stroke();
                }
            }
        });
    }

    drawSymbol(symbol, x, y) {
        if (this.assets[symbol.id]) {
            this.ctx.drawImage(this.assets[symbol.id], x - 60, y - 60, 120, 120);
        } else {
            this.ctx.fillStyle = this.getSymbolColor(symbol.id);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 60, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(symbol.id.toUpperCase(), x, y + 10);
        }
    }

    getSymbolColor(id) {
        const colors = {
            cherry: '#ff0000',
            lemon: '#ffff00',
            orange: '#ffa500',
            plum: '#800080',
            grapes: '#4b0082',
            watermelon: '#008000',
            bell: '#ffd700',
            bar_single: '#c0c0c0',
            bar_triple: '#808080',
            seven: '#ff4500',
            wild_starfruit: '#00ffff',
            scatter_star: '#ff00ff'
        };
        return colors[id] || '#fff';
    }
}
