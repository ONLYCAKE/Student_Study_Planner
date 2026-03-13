import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead } from '../controllers/notification.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications as any);
router.get('/unread-count', getUnreadCount as any);
router.patch('/:id/read', markAsRead as any);

export default router;
