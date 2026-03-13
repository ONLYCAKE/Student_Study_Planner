import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/db';
import bcrypt from 'bcrypt';

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                googleAccessToken: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = {
            ...user,
            googleConnected: !!user.googleAccessToken
        };
        delete (userData as any).googleAccessToken;

        res.json({ success: true, data: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { name, email } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};
