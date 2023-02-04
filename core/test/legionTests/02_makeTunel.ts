import botConfigLoader from '@/modules/botConfig'
import { Config, MineCordsConfig } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { bot } from '../hooks'

describe('02 Make basic tunel', function () {
  let xStart = -15
  let yStart = -60
  let zStart = -9

  let xEnd = -10
  let yEnd = -57
  let zEnd = -14

  const minerCords: MineCordsConfig = {
    xStart: -10,
    yStart: -60,
    zStart: -11,
    xEnd: -12,
    yEnd: -59,
    zEnd: -12,
    orientation: "x-",
    reverse: false,
    tunel: "horizontally",
    world: "minecraft:overworld"
  }

  let config: Config
  let botConfig: ReturnType<typeof botConfigLoader>

  before(async () => {
    botConfig = botConfigLoader(bot.username)
    config = {
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

    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_pickaxe`)
    bot.chat(`/give flatbot minecraft:diamond_shovel`)
    bot.chat(`/give flatbot minecraft:dirt 64`)
    bot.chat(`/fill ${xStart} ${yStart} ${zStart} ${xEnd} ${yEnd} ${zEnd} minecraft:dirt`)
    bot.chat(`/teleport -2 -60 -9`)
    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')
  })

  it('Making a Tunnel X- Normal', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  it('Making a Tunnel X+ Normal', (): Promise<void> => {

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      xStart: -15,
      xEnd: -13,
      orientation: "x+"
    }

    const newConfig = {
      ...config,
      minerCords: newMinerCords
    }

    botConfig.saveFullConfig(newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  it('Making a Tunnel Z+ Normal', (): Promise<void> => {

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      xStart: -12,
      xEnd: -13,
      zStart: -14,
      zEnd: -12,
      orientation: "z+"
    }

    const newConfig = {
      ...config,
      minerCords: newMinerCords
    }

    botConfig.saveFullConfig(newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  it('Making a Tunnel Z- Normal', (): Promise<void> => {

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      xStart: -12,
      xEnd: -13,
      zStart: -9,
      zEnd: -11,
      orientation: "z-"
    }

    const newConfig = {
      ...config,
      minerCords: newMinerCords
    }

    botConfig.saveFullConfig(newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

})
