import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/db';

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { userId: req.user.userId },
            include: { subject: true }
        });

        const now = new Date();
        const tasksWithOverdue = tasks.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed';
            return {
                ...task,
                isOverdue
            };
        });

        res.json({ success: true, data: tasksWithOverdue });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, subjectId, dueDate, priority } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                subjectId: parseInt(subjectId),
                userId: req.user.userId,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority || 'medium'
            }
        });
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create task' });
    }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, status, dueDate, priority } = req.body;
        const task = await prisma.task.update({
            where: { id: parseInt(id as string) },
            data: {
                title,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                priority
            }
        });
        res.json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ error: 'Failed to update task' });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({ where: { id: parseInt(id as string) } });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete task' });
    }
};
