import prisma from '../utils/db';
import { AnalyticsService } from './analytics.service';
import { differenceInDays, startOfDay } from 'date-fns';

export interface DailyPlanItem {
    subject: string;
    start: string;
    end: string;
    duration: number;
    type: 'study' | 'break';
}

export interface PlannerResponse {
    todayPlan: DailyPlanItem[];
    focusSubject: string;
    recommendedHours: number;
    insight: string;
    performanceInsight: string;
    weakSubjectAlert: string | null;
}

export class PlannerService {
    static async generateDailyPlan(userId: number): Promise<PlannerResponse> {
        const subjects = await prisma.subject.findMany({
            where: { userId }
        });

        let totalPriorityScores = 0;
        const subjectScores: any[] = [];
        let focusSubject = 'None';
        let highestPriority = -1;

        let totalCompletedAll = 0;
        let totalTargetAll = 0;
        let weakSubjectAlert: string | null = null;
        let worstRatioProgressDiff = Number.MAX_SAFE_INTEGER;

        const maxAvailableStudyHours = 6; // Configurable, assumed 6 for now

        for (const subject of subjects) {
            // Need an exam date to schedule properly, if not, skip or assign low priority
            if (!subject.examDate) continue;

            const completedHours = await AnalyticsService.getCompletedHours(subject.id);
            const remainingHours = Math.max(subject.targetStudyHours - completedHours, 0);
            
            totalCompletedAll += completedHours;
            totalTargetAll += subject.targetStudyHours;

            // Wait, what if exam is today or passed?
            let daysUntilExam = differenceInDays(startOfDay(subject.examDate), startOfDay(new Date()));
            if (daysUntilExam <= 0) daysUntilExam = 1; // Prevent div by 0 and max urgency

            if (remainingHours > 0) {
                const priorityScore = (remainingHours * 0.5) + ((1 / daysUntilExam) * 50);
                totalPriorityScores += priorityScore;

                subjectScores.push({
                    subjectId: subject.id,
                    name: subject.name,
                    priorityScore,
                    remainingHours,
                    daysUntilExam,
                    completedHours,
                    targetHours: subject.targetStudyHours
                });

                if (priorityScore > highestPriority) {
                    highestPriority = priorityScore;
                    focusSubject = subject.name;
                }

                // Weak subject detection
                // Expected progress: how many days elapsed / total days. But we don't have createdAt easily accessible here unless we query it.
                // Let's use a simple progress ratio vs days left.
                // If a lot of days passed but progress is low.
                // Let's assume start date was creation date of subject.
                const createdDate = startOfDay(subject.createdAt);
                const totalDays = Math.max(1, differenceInDays(startOfDay(subject.examDate), createdDate));
                const daysElapsed = Math.max(0, differenceInDays(startOfDay(new Date()), createdDate));
                
                const expectedProgressRatio = daysElapsed / totalDays;
                const actualProgressRatio = subject.targetStudyHours > 0 ? completedHours / subject.targetStudyHours : 0;
                
                if (actualProgressRatio < expectedProgressRatio - 0.1) {
                    const diff = actualProgressRatio - expectedProgressRatio;
                    if (diff < worstRatioProgressDiff) {
                        worstRatioProgressDiff = diff;
                        weakSubjectAlert = `You are behind schedule in ${subject.name}.`;
                    }
                }
            }
        }

        // Time Allocation
        const allocatedSubjects: any[] = [];
        for (const sub of subjectScores) {
            const weight = sub.priorityScore / totalPriorityScores;
            // allocate time (in minutes)
            let allocatedMins = Math.round(weight * maxAvailableStudyHours * 60);
            
            // Don't allocate more than remaining hours + buffer
            const remainingMins = sub.remainingHours * 60;
            if (allocatedMins > remainingMins) {
                allocatedMins = remainingMins;
            }

            if (allocatedMins > 0) {
                allocatedSubjects.push({
                    name: sub.name,
                    allocatedMins
                });
            }
        }

        // Sort allocated subjects by priority score descending
        allocatedSubjects.sort((a, b) => {
            const scoreA = subjectScores.find(s => s.name === a.name)?.priorityScore || 0;
            const scoreB = subjectScores.find(s => s.name === b.name)?.priorityScore || 0;
            return scoreB - scoreA;
        });

        // Generate Schedule
        const todayPlan: DailyPlanItem[] = [];
        let currentHour = 10;
        let currentMinute = 0;

        const updateTime = (minsToAdd: number) => {
            currentMinute += minsToAdd;
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
        };

        const formatTime = (h: number, m: number) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        for (const sub of allocatedSubjects) {
            let minsRemaining = sub.allocatedMins;
            
            while (minsRemaining > 0) {
                const chunkMins = Math.min(minsRemaining, 60);
                const startStr = formatTime(currentHour, currentMinute);
                updateTime(chunkMins);
                const endStr = formatTime(currentHour, currentMinute);
                
                todayPlan.push({
                    subject: sub.name,
                    start: startStr,
                    end: endStr,
                    duration: chunkMins,
                    type: 'study'
                });

                minsRemaining -= chunkMins;

                // Smart break system
                if (minsRemaining > 0) {
                    const breakStart = formatTime(currentHour, currentMinute);
                    updateTime(10); // 10 min break
                    const breakEnd = formatTime(currentHour, currentMinute);
                    todayPlan.push({
                        subject: 'Break',
                        start: breakStart,
                        end: breakEnd,
                        duration: 10,
                        type: 'break'
                    });
                }
            }
            
            // Add a break between different subjects
            const breakStart = formatTime(currentHour, currentMinute);
            updateTime(15); // 15 min break between subjects
            const breakEnd = formatTime(currentHour, currentMinute);
            todayPlan.push({
                subject: 'Break',
                start: breakStart,
                end: breakEnd,
                duration: 15,
                type: 'break'
            });
        }
        
        // Remove trailing break if present
        if (todayPlan.length > 0 && todayPlan[todayPlan.length - 1].type === 'break') {
            todayPlan.pop();
        }

        const totalPlannedMins = todayPlan.filter(p => p.type === 'study').reduce((sum, p) => sum + p.duration, 0);
        const recommendedHours = Math.round((totalPlannedMins / 60) * 10) / 10;
        
        const insight = focusSubject !== 'None' 
            ? `⚡ Focus on ${focusSubject} today. Reason: priority score is highest based on remaining study load and exam date.`
            : `You have completed all planned subjects. Great job!`;
            
        // Get generic performance insight (e.g. look at yesterday or general progress)
        const totalProgressRatio = totalTargetAll > 0 ? totalCompletedAll / totalTargetAll : 0;
        const performanceInsight = totalProgressRatio > 0.5 
            ? `Study velocity is strong. You are over halfway through your total goals!` 
            : `Study velocity is stable. Keep consistent to reach your target hours.`;

        return {
            todayPlan,
            focusSubject: focusSubject,
            recommendedHours,
            insight,
            performanceInsight,
            weakSubjectAlert
        };
    }
}
