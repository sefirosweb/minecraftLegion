import botConfigLoader from '@/modules/botConfig'
import { Config, MineCordsConfig } from '@/types'
import { Jobs } from '@/types/defaultTypes'
const botConfig = botConfigLoader()
import { bot } from '../hooks'

describe('03 Make tunel in all directions', function () {

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_pickaxe`)
    bot.chat(`/give flatbot minecraft:diamond_shovel`)
    bot.chat(`/give flatbot minecraft:dirt 256`)

    bot.chat(`/fill 9 -60 -9 -9 -55 9 minecraft:glass`)
    bot.chat(`/fill -8 -56 8 8 -63 -8 minecraft:water`)
    bot.chat(`/fill -1 -61 -1 1 -61 1 minecraft:glass`)
    bot.chat(`/fill -1 -57 -1 1 -57 1 minecraft:glass`)
    bot.chat(`/fill -1 -60 1 1 -58 -1 minecraft:air`)

    bot.chat(`/fill 2 -60 -2 -2 -57 -2 minecraft:dirt`)
    bot.chat(`/fill 2 -60 -2 2 -57 2 minecraft:dirt`)
    bot.chat(`/fill 2 -60 2 -2 -57 2 minecraft:dirt`)
    bot.chat(`/fill -2 -60 2 -2 -57 -2 minecraft:dirt`)
    bot.creative.stopFlying()
    bot.test.becomeSurvival()
  })

  it('Making a Hole: X+', (): Promise<void> => {
    const minerCords: MineCordsConfig = {
      xStart: 2,
      yStart: -60,
      zStart: -1,
      xEnd: 6,
      yEnd: -59,
      zEnd: 0,
      orientation: "x+",
      reverse: false,
      tunel: "horizontally",
      world: "minecraft:overworld"
    }

    const config: Config = {
      ...botConfig.defaultConfig,
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')

    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  it('Making a Hole: X-', (): Promise<void> => {
    const minerCords: MineCordsConfig = {
      xStart: -2,
      yStart: -60,
      zStart: 1,
      xEnd: -6,
      yEnd: -59,
      zEnd: 0,
      orientation: "x-",
      reverse: true,
      tunel: "horizontally",
      world: "minecraft:overworld"
    }


    const config: Config = {
      ...botConfig.defaultConfig,
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')


    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  it('Making a Hole: Z+', (): Promise<void> => {
    const minerCords: MineCordsConfig = {
      xStart: 1,
      yStart: -60,
      zStart: 2,
      xEnd: 0,
      yEnd: -59,
      zEnd: 6,
      orientation: "z+",
      reverse: true,
      tunel: "horizontally",
      world: "minecraft:overworld"
    }


    const config: Config = {
      ...botConfig.defaultConfig,
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')

    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  it('Making a Hole: Z-', (): Promise<void> => {
    const minerCords: MineCordsConfig = {
      xStart: -1,
      yStart: -60,
      zStart: -2,
      xEnd: 0,
      yEnd: -59,
      zEnd: -6,
      orientation: "z-",
      reverse: true,
      tunel: "horizontally",
      world: "minecraft:overworld"
    }


    const config: Config = {
      ...botConfig.defaultConfig,
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')

    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

})
