import createHttpError from 'http-errors'
import { socketVariables } from '@/libs/socketVariables'
import express from 'express'
import { io } from "@/server";

const router = express.Router()

router.post('/copy_chest_to_all_bots', async (req, res, next) => {
    const chests = req.body.chests

    socketVariables.botsConnected.forEach(bot => {
        io.timeout(5000).to(bot.socketId).emitWithAck("getConfig", {})
            .then((data) => {
                const botConfig = data[0]
                botConfig.chests = chests
                io.timeout(5000).to(bot.socketId).emitWithAck("saveConfig", { botConfig })
            })
            .catch((error) => next(createHttpError(500, error)))
    })


    res.json({ success: true })
})

export default router