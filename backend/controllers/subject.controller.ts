import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/db';
import { AnalyticsService } from '../services/analytics.service';

export const getSubjects = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const subjects = await prisma.subject.findMany({
            where: { userId },
            include: {
                sessions: {
                    where: { status: 'completed' }
                }
            }
        });

        const subjectsWithProgress = await Promise.all(subjects.map(async (subject) => {
            const completedHours = await AnalyticsService.getCompletedHours(subject.id);
            const progressPercentage = subject.targetStudyHours > 0
                ? Math.min((completedHours / subject.targetStudyHours) * 100, 100)
                : 0;
            const remainingStudyHours = Math.max(subject.targetStudyHours - completedHours, 0);

            return {
                id: subject.id,
                name: subject.name,
                targetStudyHours: subject.targetStudyHours,
                examDate: subject.examDate,
                completedStudyHours: Math.round(completedHours * 100) / 100,
                remainingStudyHours: Math.round(remainingStudyHours * 100) / 100,
                progressPercentage: Math.round(progressPercentage)
            };
        }));

        res.json({ success: true, data: subjectsWithProgress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};

export const createSubject = async (req: AuthRequest, res: Response) => {
    try {
        console.log('=== CREATE SUBJECT CONTROLLER ===');
        console.log('Request body:', req.body);
        console.log('User from token:', req.user);
        
        const { name, targetHours, examDate } = req.body;
        
        // Basic validation
        if (!name) {
            console.log('Validation failed: missing name');
            return res.status(400).json({ 
                success: false, 
                error: 'Subject name is required' 
            });
        }
        
        if (!targetHours) {
            console.log('Validation failed: missing targetHours');
            return res.status(400).json({ 
                success: false, 
                error: 'Target hours is required' 
            });
        }
        
        if (!req.user?.userId) {
            console.log('Validation failed: missing user ID');
            return res.status(401).json({ 
                success: false, 
                error: 'User authentication required' 
            });
        }
        
        console.log('Creating subject with data:', {
            name,
            targetStudyHours: parseInt(targetHours),
            examDate: examDate ? new Date(examDate) : null,
            userId: req.user.userId
        });
        
        const subject = await prisma.subject.create({
            data: {
                name,
                targetStudyHours: parseInt(targetHours),
                examDate: examDate ? new Date(examDate) : null,
                userId: req.user.userId
            }
        });
        
        console.log('Subject created successfully:', subject);
        res.status(201).json({ success: true, data: subject });
        
    } catch (error: any) {
        console.error('=== CREATE SUBJECT ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(400).json({ 
            success: false, 
            error: 'Failed to create subject: ' + error.message 
        });
    }
};

export const updateSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, targetStudyHours, examDate } = req.body;
        const subject = await prisma.subject.update({
            where: { id: parseInt(id as string) },
            data: {
                name,
                targetStudyHours: targetStudyHours ? parseInt(targetStudyHours) : undefined,
                examDate: examDate ? new Date(examDate) : undefined
            }
        });
        res.json({ success: true, data: subject });
    } catch (error) {
        res.status(400).json({ error: 'Failed to update subject' });
    }
};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.subject.delete({ where: { id: parseInt(id as string) } });
        res.json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete subject' });
    }
};
