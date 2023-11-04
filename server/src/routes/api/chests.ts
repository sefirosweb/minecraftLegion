import { socketVariables } from '@/libs/socketVariables'
import express from 'express'

const router = express.Router()

router.get('/chests', (req, res) => {
    res.json({ chests: socketVariables.chests })
})

export default router