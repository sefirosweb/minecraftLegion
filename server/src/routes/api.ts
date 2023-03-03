import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { isHttpError } from 'http-errors'
import { getIsAuthenticated, isAuthenticated } from '@/routes/login'

const router = express.Router()
router.use(isAuthenticated)

router.get('/login', getIsAuthenticated)
router.get('/', (req, res) => res.json({ message: 'Home API' }))
router.post('/', (req, res) => res.json({ success: true, message: 'Logged in!' }))
router.use('/', (req, res, next) => next(createHttpError(404, "Endpoint not found")))

router.use('/', (error: unknown, req: Request, res: Response, next: NextFunction) => {
    let errorMessage = "An unknow error ocurred"
    let statusCode = 500
    if (isHttpError(error)) {
        statusCode = error.status
        errorMessage = error.message
    }
    res.status(statusCode).json({ error: errorMessage })
})

export default router