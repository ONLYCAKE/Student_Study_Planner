import { Request, Response } from 'express';
import { GoogleService } from '../services/google.service';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.middleware';

export const connect = async (req: AuthRequest, res: Response) => {
  try {
    let userId = req.user?.userId;

    // If no user on request (no middleware), check for token in query
    if (!userId && req.query.token) {
      const decoded = jwt.verify(req.query.token as string, process.env.JWT_SECRET as string) as any;
      userId = decoded.userId;
    }

    if (!userId) {
      return res.status(401).send('Unauthorized: No authentication provided');
    }

    const state = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
    const authUrl = GoogleService.getAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Connect Error:', error);
    res.status(401).send('Unauthorized: Invalid token');
  }
};

export const callback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }

    const decoded = jwt.verify(state as string, process.env.JWT_SECRET as string) as { userId: number };
    const userId = decoded.userId;

    await GoogleService.exchangeCodeForTokens(code as string, userId);

    // Redirect back to frontend settings page
    res.redirect('http://localhost:4200/settings?google=connected');
  } catch (error) {
    console.error('Google Callback Error:', error);
    res.status(500).send('Google connection failed. Please try again.');
  }
};

export const disconnect = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    await GoogleService.disconnect(userId);
    res.json({ success: true, message: 'Disconnected from Google Calendar' });
  } catch (error) {
    console.error('Disconnect Error:', error);
    res.status(500).json({ error: 'Failed to disconnect from Google Calendar' });
  }
};
