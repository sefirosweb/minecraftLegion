import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import routerApi from "@/routes/api"
import routerPublic from "@/routes/public"
import session from 'express-session'
import { login, logout } from './routes/login'
import { secretToken } from '@/config'

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
    credentials: true
}));

app.use(session({
    secret: secretToken,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
}))

app.post('/api/login', login)
app.all('/api/logout', logout)

app.use("/api", routerApi)
app.use("/", routerPublic)


export default app