import { Entity } from 'prismarine-entity'
import { sleep } from '@/modules/utils'
import mcDataLoader from 'minecraft-data'
import mineflayerPathfinder from 'mineflayer-pathfinder'
import { Bot } from 'mineflayer'

const custom = (bot: Bot) => {
  const start = (): Promise<void> => {
    return new Promise(async (resolve) => {
      // Login
      // await sleep(500)
      // bot.chat('/register password password') // First time for register to the server
      await sleep(500)
      bot.chat('/login password')
      await sleep(500)
      bot.chat('Hello World')
      resolve()
      return
      /*
      await goPosition()

      await sleep(500)

      // Click To
      const filter = (e: Entity) => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 3
      const entity = bot.nearestEntity(filter)
      if (entity) {
        bot.useOn(entity)
      }
      await sleep(500)
      */
    })
  }

  const goPosition = (): Promise<void> => {
    const mcData = mcDataLoader(bot.version)
    const { pathfinder, Movements, goals } = mineflayerPathfinder
    bot.loadPlugin(pathfinder)
    bot.pathfinder.setMovements(new Movements(bot, mcData))
    bot.pathfinder.setGoal(new goals.GoalBlock(37, 51, 11))

    return new Promise((resolve) => {
      bot.on('goal_reached', () => {
        resolve()
      })
    })
  }

  return {
    start
  }
}


export default custom