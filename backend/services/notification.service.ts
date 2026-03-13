import prisma from '../utils/db';
import { io } from '../server';

export class NotificationService {
    static async createNotification(userId: number, title: string, message: string, type: string) {
        // 1 Insert notification into database
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });

        // 2 Emit Socket.IO event
        io.to(userId.toString()).emit('notification:new', notification);

        return notification;
    }

    static async getNotificationsForUser(userId: number) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    static async getUnreadCount(userId: number) {
        return prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });
    }

    static async markAsRead(notificationId: string) {
        return prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
    }
}
