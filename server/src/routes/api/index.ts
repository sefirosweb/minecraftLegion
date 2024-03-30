import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { isHttpError } from 'http-errors'
import { getIsAuthenticated, isAuthenticated } from '@/routes/login'
import portals from './portals'
import chests from './chests'
import get_bot_config from './get_bot_config'
import get_master_position from './get_master_position'
import start_copy_master_position from './start_copy_master_position'

const router = express.Router()
router.use(isAuthenticated)

router.get('/login', getIsAuthenticated)
router.get('/', (req, res) => res.json({ message: 'Home API' }))
router.post('/', (req, res) => res.json({ success: true, message: 'Logged in!' }))
router.use("/", portals)
router.use("/", chests)
router.use("/", get_bot_config)
router.use("/", get_master_position)
router.use("/", start_copy_master_position)

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