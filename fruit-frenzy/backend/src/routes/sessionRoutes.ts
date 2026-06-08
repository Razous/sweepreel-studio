import { Router } from 'express';
import { initSession, getSession, adjustBalance } from '../controllers/sessionController.js';

const router = Router();

router.post('/init', initSession);
router.get('/:id', getSession);
router.post('/:id/adjust-balance', adjustBalance);

export default router;
