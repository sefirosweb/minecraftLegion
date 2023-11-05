import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';
const router = express.Router()

router.all('/:id/state_machine', (req, res, next) => {
    if (req.originalUrl.endsWith('state_machine')) {
        res.redirect(301, req.originalUrl + '/');
    } else {
        next();
    }
});

router.use('/:id/state_machine', createProxyMiddleware({
    target: 'http://localhost:4550',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/viewer/[^/]+/state_machine': ''
    }
}));


router.all('/:id/inventory_viewer', (req, res, next) => {
    if (req.originalUrl.endsWith('inventory_viewer')) {
        res.redirect(301, req.originalUrl + '/');
    } else {
        next();
    }
});

router.use('/:id/inventory_viewer', createProxyMiddleware({
    target: 'http://localhost:4550',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/viewer/[^/]+/inventory_viewer': ''
    }
}));

router.all('/:id/world', (req, res, next) => {
    if (req.originalUrl.endsWith('world')) {
        res.redirect(301, req.originalUrl + '/');
    } else {
        next();
    }
});

router.use('/:id/world', createProxyMiddleware({
    target: 'http://localhost:4550',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/viewer/[^/]+/world': ''
    }
}));

export default router