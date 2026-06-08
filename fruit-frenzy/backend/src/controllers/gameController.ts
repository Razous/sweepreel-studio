import { Request, Response } from 'express';
import { GameConfig, Symbol } from '../models/game.js';
import { SlotService } from '../services/slotService.js';

const FRUIT_FRENZY_SYMBOLS: Symbol[] = [
  { id: 'cherry', name: 'Cherry', value: 1, image: '/assets/symbols/cherries.png', payout: [0, 0, 5, 20, 100] } as any,
  { id: 'lemon', name: 'Lemon', value: 2, image: '/assets/symbols/lemon.png', payout: [0, 0, 10, 40, 200] } as any,
  { id: 'orange', name: 'Orange', value: 3, image: '/assets/symbols/orange.png', payout: [0, 0, 20, 80, 400] } as any,
  { id: 'plum', name: 'Plum', value: 4, image: '/assets/symbols/plum.png', payout: [0, 0, 15, 60, 300] } as any,
  { id: 'grapes', name: 'Grapes', value: 5, image: '/assets/symbols/grapes.png', payout: [0, 0, 15, 60, 300] } as any,
  { id: 'watermelon', name: 'Watermelon', value: 6, image: '/assets/symbols/watermelon.png', payout: [0, 0, 20, 80, 400] } as any,
  { id: 'bell', name: 'Bell', value: 7, image: '/assets/symbols/bell.png', payout: [0, 0, 50, 200, 1000] } as any,
  { id: 'bar_single', name: 'Bar Single', value: 8, image: '/assets/symbols/bar_single.png', payout: [0, 0, 25, 100, 500] } as any,
  { id: 'bar_triple', name: 'Bar Triple', value: 9, image: '/assets/symbols/bar_triple.png', payout: [0, 0, 75, 300, 1500] } as any,
  { id: 'seven', name: 'Seven', value: 10, image: '/assets/symbols/seven.png', payout: [0, 0, 100, 500, 2500] } as any,
  { id: 'wild_starfruit', name: 'Wild Starfruit', value: 11, image: '/assets/symbols/wild_starfruit.png', isWild: true } as any,
  { id: 'scatter_star', name: 'Scatter Star', value: 12, image: '/assets/symbols/scatter_star.png', isScatter: true } as any,
];

const FRUIT_FRENZY_PAYLINES = [
  [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 2, 2, 2, 1], [1, 0, 0, 0, 1], [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1], [0, 1, 1, 1, 0], [2, 1, 1, 1, 2], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
  [1, 1, 0, 1, 1], [1, 1, 2, 1, 1], [0, 0, 2, 0, 0], [2, 2, 0, 2, 2], [0, 2, 0, 2, 0]
];

const slotService = new SlotService(FRUIT_FRENZY_SYMBOLS, FRUIT_FRENZY_PAYLINES);

const GAMES: GameConfig[] = [
  {
    id: 'fruit-frenzy',
    name: 'Fruit Frenzy',
    rtp: 96.5,
    minBet: 20,
    maxBet: 400,
    paylines: 20,
    symbols: FRUIT_FRENZY_SYMBOLS,
  },
];

const operatorOverrides: Record<string, Partial<GameConfig>> = {};

export const getAllGames = (req: Request, res: Response) => {
  res.json(GAMES);
};

export const getGameById = (req: Request, res: Response) => {
  const { id } = req.params;
  const operatorId = req.query.operatorId as string;
  
  const game = GAMES.find(g => g.id === id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const overrides = operatorId ? operatorOverrides[`${operatorId}:${id}`] : null;
  const config = overrides ? { ...game, ...overrides } : game;

  res.json(config);
};

export const configureGame = (req: Request, res: Response) => {
  const { id } = req.params;
  const { operatorId, overrides } = req.body;

  if (!operatorId || !overrides) {
    return res.status(400).json({ error: 'operatorId and overrides are required' });
  }

  operatorOverrides[`${operatorId}:${id}`] = overrides;
  res.json({ message: 'Configuration saved', config: { ...GAMES.find(g => g.id === id), ...overrides } });
};

export const spin = (req: Request, res: Response) => {
  const { id } = req.params;
  const { bet, multiplier = 1 } = req.body;

  if (id !== 'fruit-frenzy') {
    return res.status(404).json({ error: 'Game not found' });
  }

  const reelState = slotService.getRandomReelState();
  const winResult = slotService.calculateWins(reelState, bet / 20, multiplier);

  res.json(winResult);
};
