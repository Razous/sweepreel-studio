export interface Symbol {
  id: string;
  name: string;
  value: number;
  image: string;
}

export interface GameConfig {
  id: string;
  name: string;
  rtp: number;
  minBet: number;
  maxBet: number;
  paylines: number;
  symbols: Symbol[];
}

export interface OperatorConfig {
  gameId: string;
  operatorId: string;
  overrides: Partial<GameConfig>;
}
