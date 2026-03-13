import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/db';
import { AnalyticsService } from '../services/analytics.service';
import { startOfDay } from 'date-fns';

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;

        // 1. Basic Counts
        const totalSubjects = await prisma.subject.count({ where: { userId } });
        const completedTasks = await prisma.task.count({ where: { userId, status: 'completed' } });
        const pendingTasks = await prisma.task.count({ where: { userId, status: 'pending' } });

        // 2. Advanced Analytics via AnalyticsService
        const studyStreak = await AnalyticsService.getStudyStreak(userId);
        const weeklyStudyHours = await AnalyticsService.getWeeklyHours(userId);
        const focusScore = await AnalyticsService.getFocusScore(userId);
        const avgDailyHours = Math.round((weeklyStudyHours / 7) * 10) / 10;
        const weeklyTrends = await AnalyticsService.getWeeklyTrends(userId);

        // 3. Upcoming Sessions (Active or Scheduled)
        const upcomingSessions = await prisma.studySession.findMany({
            where: {
                userId,
                status: { in: ['scheduled', 'active'] },
                date: { gte: startOfDay(new Date()) }
            },
            include: { subject: true },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' }
            ],
            take: 5
        });

        res.json({
            success: true,
            data: {
                totalSubjects,
                weeklyStudyHours: Math.round(weeklyStudyHours * 10) / 10,
                studyStreak,
                focusScore,
                avgDailyHours,
                pendingTasks,
                completedTasks,
                upcomingSessions,
                weeklyTrends
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
