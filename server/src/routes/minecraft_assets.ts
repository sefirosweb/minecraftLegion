import express from 'express'

//@ts-ignore
import mcAssetsLoader from 'minecraft-assets'

const router = express.Router()

let blockModels: Record<string, any> = {}

const getBlocKModels = (version: string) => {
    if (blockModels[version]) return blockModels[version]
    const mcAssets = mcAssetsLoader(version)
    blockModels[version] = mcAssets
    return blockModels[version]
}

router.get('/:block/:version?', (req, res) => {
    try {
        const block = req.params.block;
        const version = req.params.version || '1.19.1'

        const mcAssets = getBlocKModels(version)

        if (!mcAssets.textureContent[block]) {
            res.status(404).end()
            return;
        }

        const base64Image = mcAssets.textureContent[block].texture.replace(/^data:image\/png;base64,/, '');

        const img = Buffer.from(base64Image, 'base64');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });

        res.end(img);
    } catch (e) {
        res.sendStatus(500).end()
    }
})

export default router