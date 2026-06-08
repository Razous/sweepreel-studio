export interface Session {
  id: string;
  playerId: string;
  balance: number;
  currency: string;
  gameId: string;
  createdAt: Date;
  lastUpdate: Date;
}
