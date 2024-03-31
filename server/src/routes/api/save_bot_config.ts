import createHttpError from 'http-errors'
import { socketVariables } from '@/libs/socketVariables'
import express from 'express'
import { io } from "@/server";

const router = express.Router()

router.post('/save_bot_config/:socketId', async (req, res, next) => {
    const socketId = req.params.socketId

    const bot = socketVariables.botsConnected.find(bot => bot.socketId === socketId)
    if (!bot) {
        return next(createHttpError(404, "Bot not found"))
    }

    const botConfig = req.body.botConfig

    io.timeout(5000).to(bot.socketId).emitWithAck("saveConfig", { botConfig })
        .then((data) => {
            res.json(data[0])
        })
        .catch((error) => next(createHttpError(500, error)))

})

export default router