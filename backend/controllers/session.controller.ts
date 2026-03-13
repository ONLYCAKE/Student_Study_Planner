import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/db';
import { NotificationService } from '../services/notification.service';
import { GoogleService } from '../services/google.service';

export const getSessions = async (req: AuthRequest, res: Response) => {
    try {
        const sessions = await prisma.studySession.findMany({
            where: { userId: req.user.userId },
            include: { subject: true },
            orderBy: { date: 'asc' }
        });
        res.json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};

export const createSession = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectId, date, startTime, endTime, status, syncWithGoogle } = req.body;
        const userId = req.user.userId;
        const sessionDate = new Date(date);

        // 1. Basic validation
        if (startTime >= endTime) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        // 2. Conflict detection
        const existingSessions = await prisma.studySession.findMany({
            where: {
                userId,
                date: {
                    equals: sessionDate
                }
            }
        });

        const overlap = existingSessions.some(s => {
            return (startTime < s.endTime && endTime > s.startTime);
        });

        if (overlap) {
            return res.status(400).json({ error: 'Session overlaps with an existing one' });
        }

        const session = await prisma.studySession.create({
            data: {
                subjectId: parseInt(subjectId),
                userId,
                date: sessionDate,
                startTime,
                endTime,
                status: status || 'scheduled',
                syncWithGoogle: !!syncWithGoogle
            },
            include: { subject: true }
        });

        // Sync with Google Calendar if requested
        if (syncWithGoogle) {
          const googleEventId = await GoogleService.createEvent(userId, session);
          if (googleEventId) {
            await prisma.studySession.update({
              where: { id: session.id },
              data: { googleEventId }
            });
          }
        }

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create session' });
    }
};

export const updateSession = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, startTime, endTime, date } = req.body;

        const session = await prisma.studySession.update({
            where: { id: parseInt(id as string) },
            include: { subject: true },
            data: {
                status,
                startTime,
                endTime,
                date: date ? new Date(date) : undefined
            }
        });

        // Update Google Event if synced
        if (session.googleEventId) {
            await GoogleService.updateEvent(req.user.userId, session);
        }

        if (status === 'completed') {
            await NotificationService.createNotification(
                session.userId,
                "Study Session Completed",
                `You completed a study session for ${session.subject.name}.`,
                "study_reminder"
            );
        }

        res.json({ success: true, data: session });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to update session' });
    }
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const session = await prisma.studySession.findUnique({
            where: { id: parseInt(id as string) }
        });

        if (session?.googleEventId) {
            await GoogleService.deleteEvent(req.user.userId, session.googleEventId);
        }

        await prisma.studySession.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ success: true, message: 'Session deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete session' });
    }
};
