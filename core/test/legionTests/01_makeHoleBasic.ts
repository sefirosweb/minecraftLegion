import botConfigLoader from '@/modules/botConfig'
import { Jobs, Config, MineCordsConfig } from 'base-types'
import { bot } from '../hooks'

describe('01 Basic Mining', function () {
  let xStart = -10
  let yStart = -50
  let zStart = -10

  let xEnd = -12
  let yEnd = -60
  let zEnd = -12

  const minerCords: MineCordsConfig = {
    yStart: yStart,
    yEnd: yStart,
    xStart,
    zStart,
    xEnd,
    zEnd,
    orientation: "x+",
    reverse: false,
    tunel: "vertically",
    world: "overworld"
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
    bot.chat(`/give flatbot iron_pickaxe`)
    bot.chat(`/give flatbot diamond_shovel`)
    bot.chat(`/give flatbot dirt 64`)
    bot.chat(`/fill ${xStart} ${yStart} ${zStart} ${xEnd} ${yEnd} ${zEnd} dirt`)
    bot.chat(`/teleport ${xStart} ${yStart + 2} ${zStart}`)
    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')
  })

  it('Making a Hole X+ Normal', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  it('Making a Hole X+ Reverse', (): Promise<void> => {
    yStart--;

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      yStart: yStart,
      yEnd: yStart,
      orientation: "x+",
      reverse: true,
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

  it('Making a Hole X- Normal', (): Promise<void> => {
    yStart--;

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      yStart: yStart,
      yEnd: yStart,
      orientation: "x-",
      reverse: false,
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

  it('Making a Hole X- Reverse', (): Promise<void> => {
    yStart--;

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      yStart: yStart,
      yEnd: yStart,
      orientation: "x-",
      reverse: true,
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

  it('Making a Hole Z+ Normal', (): Promise<void> => {
    yStart--;

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      yStart: yStart,
      yEnd: yStart,
      orientation: "z+",
      reverse: false,
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

  it('Making a Hole Z+ Reverse', (): Promise<void> => {
    yStart--;

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      yStart: yStart,
      yEnd: yStart,
      orientation: "z+",
      reverse: true,
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

  it('Making a Hole Z- Normal', (): Promise<void> => {
    yStart--;

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      yStart: yStart,
      yEnd: yStart,
      orientation: "z-",
      reverse: false,
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

  it('Making a Hole Z- Reverse', (): Promise<void> => {
    yStart--;

    const newMinerCords: MineCordsConfig = {
      ...minerCords,
      yStart: yStart,
      yEnd: yStart,
      orientation: "z-",
      reverse: true,
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
