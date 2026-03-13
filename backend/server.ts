import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes';
import subjectRoutes from './routes/subject.routes';
import sessionRoutes from './routes/session.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import plannerRoutes from './routes/planner.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';
import googleRoutes from './routes/google.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/subjects', subjectRoutes);
app.use('/sessions', sessionRoutes);
app.use('/tasks', taskRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/planner', plannerRoutes);
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes);
app.use('/api/google', googleRoutes);

app.get('/', (req, res) => {
    res.send('StudySync API is running (TypeScript)...');
});

// Socket.io connection
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId.toString());
        console.log(`User ${userId} joined their notification room.`);
    }

    socket.on('disconnect', () => {
        if (userId) {
            console.log(`User ${userId} disconnected.`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
