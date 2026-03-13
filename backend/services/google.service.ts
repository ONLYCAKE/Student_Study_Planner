import { google } from 'googleapis';
import prisma from '../utils/db';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export class GoogleService {
  static getAuthUrl(state?: string) {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state,
    });
  }

  static async exchangeCodeForTokens(code: string, userId: number) {
    const { tokens } = await oauth2Client.getToken(code);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    });

    return tokens;
  }

  static async disconnect(userId: number) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
      },
    });
  }

  static async getClientForUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true, googleRefreshToken: true }
    });

    if (!user?.googleAccessToken) return null;

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    // Handle token refresh
    client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await prisma.user.update({
          where: { id: userId },
          data: { googleAccessToken: tokens.access_token },
        });
      }
    });

    return client;
  }

  static async createEvent(userId: number, session: any) {
    const auth = await this.getClientForUser(userId);
    if (!auth) return null;

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: `Study - ${session.subject.name}`,
      description: 'Study session created from StudySync',
      start: {
        dateTime: new Date(`${session.date.toISOString().split('T')[0]}T${session.startTime}:00`).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(`${session.date.toISOString().split('T')[0]}T${session.endTime}:00`).toISOString(),
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data.id;
  }

  static async updateEvent(userId: number, session: any) {
    const auth = await this.getClientForUser(userId);
    if (!auth || !session.googleEventId) return null;

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: `Study - ${session.subject.name}`,
      description: 'Study session updated from StudySync',
      start: {
        dateTime: new Date(`${session.date.toISOString().split('T')[0]}T${session.startTime}:00`).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(`${session.date.toISOString().split('T')[0]}T${session.endTime}:00`).toISOString(),
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId: session.googleEventId,
      requestBody: event,
    });
  }

  static async deleteEvent(userId: number, googleEventId: string) {
    const auth = await this.getClientForUser(userId);
    if (!auth) return;

    const calendar = google.calendar({ version: 'v3', auth });
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });
    } catch (error) {
      console.error('Error deleting google event:', error);
    }
  }
}
