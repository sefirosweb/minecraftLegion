import { findBotBySocketId } from '@/libs/botStore';
import { io } from '@/server';
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware';
const router = express.Router()

const createBotProxy = (address: string, port: number, path: string) => {
    const pathRewrite = `^/viewer/[^/]+/${path}`;
    return createProxyMiddleware({
        target: `http://[${address}]:${port}`,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
            [pathRewrite]: ''
        }
    });
}

const requestPort = (socketId: string, app: string): Promise<number> => {
    return new Promise((resolve) => {
        io.timeout(5000).to(socketId).emitWithAck("action", { type: app })
            .then((response) => {
                resolve(response[0].port)
            })
    })
}

router.all('/:id/state_machine', (req, res, next) => {
    if (req.originalUrl.endsWith('state_machine')) {
        res.redirect(301, req.originalUrl + '/');
    } else {
        next();
    }
});

router.use('/:id/state_machine', async (req, res, next) => {
    const bot = findBotBySocketId(req.params.id);

    if (!bot) {
        res.status(404).send('Bot not found');
        return;
    }

    const port = bot.stateMachinePort ? bot.stateMachinePort : await requestPort(bot.socketId, 'startStateMachine');
    if (!bot.stateMachinePort) {
        bot.stateMachinePort = port;
    }

    const proxyRequest = createBotProxy(bot.address, port, 'state_machine')
    proxyRequest(req, res, next)
});


router.all('/:id/inventory_viewer', (req, res, next) => {
    if (req.originalUrl.endsWith('inventory_viewer')) {
        res.redirect(301, req.originalUrl + '/');
    } else {
        next();
    }
});

router.use('/:id/inventory_viewer', async (req, res, next) => {
    const bot = findBotBySocketId(req.params.id);

    if (!bot) {
        res.status(404).send('Bot not found');
        return;
    }

    const port = bot.inventoryPort ? bot.inventoryPort : await requestPort(bot.socketId, 'startInventory');
    if (!bot.inventoryPort) {
        bot.inventoryPort = port;
    }

    const proxyRequest = createBotProxy(bot.address, port, 'inventory_viewer')
    proxyRequest(req, res, next)
});


router.all('/:id/world', (req, res, next) => {
    if (req.originalUrl.endsWith('world')) {
        res.redirect(301, req.originalUrl + '/');
    } else {
        next();
    }
});

router.use('/:id/world', async (req, res, next) => {
    const bot = findBotBySocketId(req.params.id);

    if (!bot) {
        res.status(404).send('Bot not found');
        return;
    }

    const port = bot.viewerPort ? bot.viewerPort : await requestPort(bot.socketId, 'startViewer');
    if (!bot.viewerPort) {
        bot.viewerPort = port;
    }

    const proxyRequest = createBotProxy(bot.address, port, 'world')
    proxyRequest(req, res, next)
});

export default router