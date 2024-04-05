import { socketVariables } from '@/libs/socketVariables'
import express from 'express'
import { sendChests } from '@/socketEmit';

const router = express.Router()

router.get('/chests', (req, res) => {
    res.json({ chests: socketVariables.chests })
})

router.delete('/chest/:uuid', (req, res) => {
    const uuid = req.params.uuid
    delete socketVariables.chests[uuid]
    sendChests()

    res.json({ success: true})
})

export default router