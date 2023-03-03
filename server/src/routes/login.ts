import { RequestHandler } from "express"
import createHttpError from "http-errors"
import config from "@/config"

const { adminPassword } = config

interface LoginBody {
    password?: string
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.session.logedIn === true) {
        next()
    } else {
        next(createHttpError(401, 'Not authenticated'))

    }
}

export const getIsAuthenticated: RequestHandler = async (req, res) => {
    res.sendStatus(200)
}

export const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (req, res, next) => {
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

export const logout: RequestHandler<unknown, unknown, LoginBody, unknown> = async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                throw createHttpError(400, err)
            }

            res.sendStatus(200)
        })
    } catch (error) {
        next(error)
    }
}


