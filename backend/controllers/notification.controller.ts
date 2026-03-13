import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const notifications = await NotificationService.getNotificationsForUser(userId);
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const count = await NotificationService.getUnreadCount(userId);
        res.json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        await NotificationService.markAsRead(id);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};
