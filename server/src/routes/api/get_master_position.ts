import { socketVariables } from '@/libs/socketVariables'
import express from 'express'
import createHttpError from 'http-errors'
import { io } from "@/server";
import { Vec3 } from 'vec3';

const router = express.Router()

router.get('/get_master_position/:socketId/:master', (req, res, next) => {
    const socketId = req.params.socketId
    const bot = socketVariables.botsConnected.find(bot => bot.socketId === socketId)
    if (!bot) {
        return next(createHttpError(404, "Bot not found"))
    }

    const master = req.params.master

    io.timeout(5000).to(bot.socketId).emitWithAck("get_master_position",
        {
            master
        })
        .then((data: [{
            error?: string,
            pos?: Vec3
        }]) => {
            const response = data[0]

            if (response.error) {
                return next(createHttpError(500, response.error))
            }

            res.json(response.pos)
        })
        .catch((error) => next(createHttpError(500, error)))
})

export default router