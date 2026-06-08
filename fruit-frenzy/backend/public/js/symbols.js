const SYMBOLS = {
    CHERRY: { id: 'cherry', value: 1, payout: [0, 0, 5, 20, 100] },
    LEMON: { id: 'lemon', value: 2, payout: [0, 0, 10, 40, 200] },
    ORANGE: { id: 'orange', value: 3, payout: [0, 0, 20, 80, 400] },
    PLUM: { id: 'plum', value: 4, payout: [0, 0, 15, 60, 300] },
    GRAPES: { id: 'grapes', value: 5, payout: [0, 0, 15, 60, 300] },
    WATERMELON: { id: 'watermelon', value: 6, payout: [0, 0, 20, 80, 400] },
    BELL: { id: 'bell', value: 7, payout: [0, 0, 50, 200, 1000] },
    BAR_SINGLE: { id: 'bar_single', value: 8, payout: [0, 0, 25, 100, 500] },
    BAR_TRIPLE: { id: 'bar_triple', value: 9, payout: [0, 0, 75, 300, 1500] },
    SEVEN: { id: 'seven', value: 10, payout: [0, 0, 100, 500, 2500] },
    WILD_STARFRUIT: { id: 'wild_starfruit', value: 11, isWild: true },
    SCATTER_STAR: { id: 'scatter_star', value: 12, isScatter: true }
};

const SYMBOL_LIST = Object.values(SYMBOLS);
