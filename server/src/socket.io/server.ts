import http from 'http'
import { originCors } from '@/config';
import { Server as WebSocketServer } from 'socket.io'
import app from '@/app';

export const httServer = http.createServer(app);

export const io = new WebSocketServer(httServer, {
    cors: {
        origin: originCors,
    },
});

