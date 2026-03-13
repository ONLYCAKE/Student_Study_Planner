import { Router } from 'express';
import { connect, callback, disconnect } from '../controllers/google.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// Route to initiate Google connect
router.get('/connect', connect);

// Google OAuth 2.0 callback
router.get('/callback', callback);

// Disconnect Google Calendar
router.delete('/disconnect', authMiddleware, disconnect);

export default router;
