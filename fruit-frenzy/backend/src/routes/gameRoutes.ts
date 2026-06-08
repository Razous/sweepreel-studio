import { Router } from 'express';
import { getAllGames, getGameById, configureGame, spin } from '../controllers/gameController.js';

const router = Router();

router.get('/', getAllGames);
router.get('/:id', getGameById);
router.post('/:id/configure', configureGame);
router.post('/:id/spin', spin);

export default router;
