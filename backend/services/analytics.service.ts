import prisma from '../utils/db';
import { differenceInDays, startOfDay, endOfDay, subDays, isSameDay } from 'date-fns';

export class AnalyticsService {
    static async getCompletedHours(subjectId: number) {
        const sessions = await prisma.studySession.findMany({
            where: { subjectId, status: 'completed' }
        });

        return sessions.reduce((total, session) => {
            const [startHour, startMin] = session.startTime.split(':').map(Number);
            const [endHour, endMin] = session.endTime.split(':').map(Number);
            const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
            return total + duration;
        }, 0);
    }

    static async getStudyStreak(userId: number) {
        const sessions = await prisma.studySession.findMany({
            where: { userId, status: 'completed' },
            orderBy: { date: 'desc' },
            select: { date: true }
        });

        if (sessions.length === 0) return 0;

        const uniqueDays = Array.from(new Set(sessions.map(s => s.date.toISOString().split('T')[0])))
            .map(dateStr => new Date(dateStr));

        let streak = 0;
        let today = startOfDay(new Date());

        // Check if the most recent session was today or yesterday
        if (differenceInDays(today, uniqueDays[0]) > 1) return 0;

        let currentDate = uniqueDays[0];
        streak = 1;

        for (let i = 1; i < uniqueDays.length; i++) {
            if (differenceInDays(uniqueDays[i - 1], uniqueDays[i]) === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    static async getWeeklyHours(userId: number) {
        const sevenDaysAgo = subDays(new Date(), 7);
        const sessions = await prisma.studySession.findMany({
            where: {
                userId,
                status: 'completed',
                date: { gte: sevenDaysAgo }
            }
        });

        return sessions.reduce((total, session) => {
            const [startHour, startMin] = session.startTime.split(':').map(Number);
            const [endHour, endMin] = session.endTime.split(':').map(Number);
            const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
            return total + duration;
        }, 0);
    }

    static async getFocusScore(userId: number) {
        // FocusScore = (TaskCompletionRate * 40) + (SessionCompletionRate * 30) + (StudyHoursTargetRate * 30)
        
        // 1. Task Completion Rate
        const totalTasks = await prisma.task.count({ where: { userId } });
        const completedTasks = await prisma.task.count({ where: { userId, status: 'completed' } });
        const taskRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

        // 2. Session Completion Rate
        const totalSessions = await prisma.studySession.count({ where: { userId } });
        const completedSessions = await prisma.studySession.count({ where: { userId, status: 'completed' } });
        const sessionRate = totalSessions > 0 ? (completedSessions / totalSessions) : 0;

        // 3. Study Hours Target Rate
        const subjects = await prisma.subject.findMany({ where: { userId } });
        let totalTarget = 0;
        let totalCompleted = 0;

        for (const subject of subjects) {
            totalTarget += subject.targetStudyHours;
            totalCompleted += await this.getCompletedHours(subject.id);
        }

        const targetRate = totalTarget > 0 ? Math.min(totalCompleted / totalTarget, 1) : 0;

    const focusScore = (taskRate * 40) + (sessionRate * 30) + (targetRate * 30);
        return Math.round(focusScore);
    }

    static async getWeeklyTrends(userId: number) {
        const trends = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const start = startOfDay(date);
            const end = endOfDay(date);

            const sessions = await prisma.studySession.findMany({
                where: {
                    userId,
                    status: 'completed',
                    date: {
                        gte: start,
                        lte: end
                    }
                }
            });

            const hours = sessions.reduce((total, session) => {
                const [startHour, startMin] = session.startTime.split(':').map(Number);
                const [endHour, endMin] = session.endTime.split(':').map(Number);
                const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
                return total + duration;
            }, 0);

            trends.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: start.toISOString().split('T')[0],
                hours: Math.round(hours * 10) / 10
            });
        }
        return trends;
    }
}
