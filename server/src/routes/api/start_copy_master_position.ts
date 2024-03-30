import { socketVariables } from '@/libs/socketVariables'
import express from 'express'
import createHttpError from 'http-errors'
import { io } from "@/server";

const router = express.Router()

router.post('/start_copy_master_position', (req, res, next) => {
    const socketId = req.body.socketId;
    const masterSocketId = req.body.masterSocketId;

    const bot = socketVariables.botsConnected.find(bot => bot.socketId === socketId)
    if (!bot) {
        return next(createHttpError(404, "Bot not found"))
    }

    const master = req.body.master

    io.timeout(5000).to(bot.socketId).emitWithAck("start_copy_master_position",
        {
            master,
            masterSocketId,
        })
        .then((data: [{
            error?: string
        }]) => {
            const response = data[0]

            if (response.error) {
                return next(createHttpError(500, response.error))
            }

            res.json(response)
        })
        .catch((error) => next(createHttpError(500, error)))
})

export default router