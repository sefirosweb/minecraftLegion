const mineflayerViewer = require('prismarine-viewer').mineflayer

function start (bot, port = 4000) {
  mineflayerViewer(bot, { port: port })
  const path = [bot.entity.position.clone()]
  bot.on('move', () => {
    if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
      path.push(bot.entity.position.clone())
      bot.viewer.drawLine('path', path)
    }
  })
}

module.exports = {
  start
}
