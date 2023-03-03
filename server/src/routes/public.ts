import express from 'express'
import path from 'path'

const router = express.Router()

router.use(express.static(path.join(__dirname, '..', 'public')))

router.use((req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

export default router