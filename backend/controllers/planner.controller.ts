import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/db';
import { AnalyticsService } from '../services/analytics.service';
import { PlannerService } from '../services/planner.service';
import { differenceInDays, startOfDay } from 'date-fns';

export const getRecommendations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const subjects = await prisma.subject.findMany({
            where: { userId },
            include: {
                sessions: { where: { status: 'completed' } }
            }
        });

        const recommendations = [];

        for (const subject of subjects) {
            const completedHours = await AnalyticsService.getCompletedHours(subject.id);
            const remainingHours = Math.max(subject.targetStudyHours - completedHours, 0);

            if (remainingHours > 0 && subject.examDate) {
                const daysUntilExam = differenceInDays(startOfDay(new Date(subject.examDate)), startOfDay(new Date()));
                const progressPercentage = subject.targetStudyHours > 0 
                    ? Math.round((completedHours / subject.targetStudyHours) * 100) 
                    : 0;
                
                if (daysUntilExam >= 0) {
                    const divisor = daysUntilExam === 0 ? 1 : daysUntilExam;
                    const recommendedDailyHours = Math.ceil((remainingHours / divisor) * 10) / 10;
                    
                    recommendations.push({
                        subjectId: subject.id,
                        subjectName: subject.name,
                        remainingHours: Math.round(remainingHours * 10) / 10,
                        daysUntilExam,
                        recommendedDailyHours,
                        progressPercentage,
                        urgency: daysUntilExam < 7 ? 'high' : daysUntilExam < 14 ? 'medium' : 'low'
                    });
                }
            }
        }

        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
};

export const generatePlan = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const plan = await PlannerService.generateDailyPlan(userId);
        res.json(plan);
    } catch (error) {
        console.error('Planner Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate daily plan' });
    }
};
