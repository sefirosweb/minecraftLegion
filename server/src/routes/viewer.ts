import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';
const router = express.Router()

router.use('/state_machine/:id', createProxyMiddleware({
    target: 'http://localhost:4550',
    changeOrigin: true,
    pathRewrite: {
        '^/viewer/.*': '/',
    },
}));

router.use('/inventory_viewer/:id', createProxyMiddleware({
    target: 'http://localhost:4540',
    changeOrigin: true,
    pathRewrite: {
        '^/viewer/.*': '/',
    },
}));

router.use('/viewer/:id', createProxyMiddleware({
    target: 'http://localhost:4537 ',
    changeOrigin: true,
    pathRewrite: {
        '^/viewer/.*': '/',
    },
}));

export default router