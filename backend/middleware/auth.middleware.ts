import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

export interface AuthRequest extends Request {
    user?: any;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: any) => {
        if (err) return res.sendStatus(403);
        
        try {
            // Verify that the user still exists in the database
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (!user) {
                return res.status(401).json({ error: 'User no longer exists. Please log in again.' });
            }

            req.user = decoded;
            next();
        } catch (dbError) {
            return res.status(500).json({ error: 'Database error during authentication validation.' });
        }
    });
};

export default authenticateToken;
