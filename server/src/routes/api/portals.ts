import { socketVariables } from '@/libs/socketVariables'
import express from 'express'

const router = express.Router()

router.get('/portals', (req, res) => {
    res.json({ portals: socketVariables.portals })
})

export default router