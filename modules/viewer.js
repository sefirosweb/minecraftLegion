const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer



function start(bot, port = 4010) {
    mineflayerViewer(bot, { port: port })
    const path = [bot.entity.position.clone()]
    console.log("port", port)
    bot.on('move', () => {
        if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
            path.push(bot.entity.position.clone())
            bot.viewer.drawLine('path', path)
        }
    })
}

module.exports = start;