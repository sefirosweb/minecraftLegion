import express, { NextFunction, Request, RequestHandler, Response } from "express"
import createHttpError, { isHttpError } from "http-errors"
import { adminPassword } from "@/config"
import { io } from "@/socket.io/server"
interface LoginBody {
    password?: string
}

export const isAuthenticated: RequestHandler = (req, _, next) => {
    if (req.session.logedIn === true) {
        next()
    } else {
        next(createHttpError(401, 'Not authenticated'))

    }
}

export const getIsAuthenticated: RequestHandler = async (_, res) => {
    res.sendStatus(200)
}

const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (req, res, next) => {
    const password = req.body.password

    try {
        if (!password) {
            throw createHttpError(400, 'Parameters missing')
        }

        if (password !== adminPassword) {
            throw createHttpError(401, 'Invalid credentials"')
        }

        req.session.logedIn = true
        res.sendStatus(200)
    } catch (error) {
        next(error)
    }

}

const logout: RequestHandler<unknown, unknown, LoginBody, unknown> = async (req, res, next) => {
    const sessionId = req.session.id;

    try {
        req.session.destroy((err) => {
            if (err) {
                throw createHttpError(400, err)
            }

            // io.in(sessionId).disconnectSockets();
            res.sendStatus(200)
        })
    } catch (error) {
        next(error)
    }
}

export const routerLogin = express.Router()
routerLogin.post('/api/login', login)
routerLogin.all('/api/logout', logout)

routerLogin.use('/', (error: unknown, _: Request, res: Response, __: NextFunction) => {
    let errorMessage = "An unknow error ocurred"
    let statusCode = 500
    if (isHttpError(error)) {
        statusCode = error.status
        errorMessage = error.message
    }
    res.status(statusCode).json({ error: errorMessage })
})
