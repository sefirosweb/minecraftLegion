import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import routerApi from "@/routes/api"
import routerPublic from "@/routes/public"
import { routerLogin } from '@/routes/login'
import http from 'http'
import { Server as WebSocketServer } from 'socket.io'
import { secretToken } from './config'
import session from 'express-session'
import FileStore from 'session-file-store';

const fileStore = FileStore(session);

const sessionMiddleware = session({
    store: new fileStore(),
    secret: secretToken,
    name: 'sid',
    resave: false,
    saveUninitialized: false
})

export const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(cors({
    credentials: true
}));

export const httpServer = http.createServer(app);
app.use(sessionMiddleware);

export const io = new WebSocketServer(httpServer, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
});

io.use((socket, next) => {
    sessionMiddleware(socket.request as Request, {} as Response, next as NextFunction);
});

io.use((socket, next) => {
    const logedIn = socket.request.session.logedIn;
    if (logedIn) {
        console.log(`New client connected => ${socket.id}`)
        next();
    } else {
        console.log('Error on auth')
        next(new Error('Unauthorized'));
    }
});

app.use("/", routerLogin)
app.use("/api", routerApi)
app.use("/", routerPublic)