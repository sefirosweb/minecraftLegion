import { Bot } from 'mineflayer'
// @ts-ignore
import mineflayerViewer from 'prismarine-viewer'

export const startPrismarineViewer = (bot: Bot, port: number = 4000) => {

  mineflayerViewer.mineflayer(bot, { port })
  const path = [bot.entity.position.clone()]
  bot.on('move', () => {
    if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
      path.push(bot.entity.position.clone())
      // @ts-ignore
      bot.viewer.drawLine('path', path)
    }
  })
}