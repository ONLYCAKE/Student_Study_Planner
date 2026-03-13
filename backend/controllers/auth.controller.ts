import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        console.log('Signup attempt:', { name, email });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        console.log('User created:', user.id);
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error: any) {
        console.error('Signup error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        res.status(400).json({ error: 'Signup failed: ' + (error.message || 'Unknown error') });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
