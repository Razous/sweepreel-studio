import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { Session } from '../models/session.js';

const SESSION_FILE = path.join(process.cwd(), 'sessions.json');
let sessions: Record<string, Session> = {};

// Load sessions from file on startup
if (fs.existsSync(SESSION_FILE)) {
  try {
    const data = fs.readFileSync(SESSION_FILE, 'utf8');
    sessions = JSON.parse(data);
    console.log(`Loaded ${Object.keys(sessions).length} sessions from persistence`);
  } catch (e) {
    console.error('Failed to load sessions from file', e);
  }
}

const saveSessions = () => {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
  } catch (e) {
    console.error('Failed to save sessions to file', e);
  }
};

export const initSession = (req: Request, res: Response) => {
  const { playerId, gameId, initialBalance, currency } = req.body;

  if (!playerId || !gameId) {
    return res.status(400).json({ error: 'playerId and gameId are required' });
  }

  const sessionId = uuidv4();
  const session: Session = {
    id: sessionId,
    playerId,
    gameId,
    balance: initialBalance || 10000,
    currency: currency || 'SC', // Sweep Coins
    createdAt: new Date(),
    lastUpdate: new Date(),
  };

  sessions[sessionId] = session;
  saveSessions();
  res.json(session);
};

export const getSession = (req: Request, res: Response) => {
  const { id } = req.params;
  const session = sessions[id as string];

  if (!session) {
    return res.status(404).json({ error: 'Session not found', balance: 0 });
  }

  res.json(session);
};

export const adjustBalance = (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (amount === undefined) {
    return res.status(400).json({ error: 'amount is required', balance: 0 });
  }

  const session = sessions[id as string];
  if (!session) {
    // BUG-101 Fix: Return a 404 but include a balance of 0 to avoid NaN in naive frontends
    return res.status(404).json({ error: 'Session not found', balance: 0 });
  }

  // BUG-103 Fix: Negative balance protection
  if (session.balance + amount < 0) {
    return res.status(400).json({ error: 'Insufficient balance', balance: session.balance });
  }

  session.balance += amount;
  session.lastUpdate = new Date();

  saveSessions();
  res.json({ balance: session.balance, lastUpdate: session.lastUpdate });
};
