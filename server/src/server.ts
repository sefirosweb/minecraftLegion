import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import routerApi from "@/routes/api"
import minecraftAssets from "@/routes/minecraft_assets"
import viewer from "@/routes/viewer"
import routerPublic from "@/routes/public"
import { routerLogin } from '@/routes/login'
import http from 'http'
import { Server as WebSocketServer } from 'socket.io'
import { secretToken, debugMode } from '@/config'
import session from 'express-session'
import SequelizeStoresession from 'connect-session-sequelize';
import { sequelize } from '@/models/sequalize'

const SequelizeStore = SequelizeStoresession(session.Store)

const sessionMiddleware = session({
    store: new SequelizeStore({
        db: sequelize,
    }),
    secret: secretToken,
    name: 'sid',
    resave: false,
    saveUninitialized: false
})

export const app = express()

if (debugMode) {
    app.use(morgan('dev'))
}

app.use(express.json())
app.use(cors({
    credentials: true
}));

export const httpServer = http.createServer(app);
app.use(sessionMiddleware);

export const io = new WebSocketServer(httpServer);

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
app.use("/minecraft-assets", minecraftAssets)
app.use("/viewer", viewer)
app.use("/api", routerApi)
app.use("/", routerPublic)
