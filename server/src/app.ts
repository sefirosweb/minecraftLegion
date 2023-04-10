import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import routerApi from "@/routes/api"
import routerPublic from "@/routes/public"
import session from 'express-session'
import { routerLogin } from './routes/login'
import { secretToken } from '@/config'

const app = express()

export const sessionMiddleware = session({
    secret: secretToken,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
})

app.use(morgan('dev'))
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
    credentials: true
}));

app.use(sessionMiddleware)

app.use("/", routerLogin)
app.use("/api", routerApi)
app.use("/", routerPublic)


export default app