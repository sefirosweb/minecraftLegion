import { Config, Jobs, MineCordsConfig } from 'base-types'
import { bot } from '../hooks'
import { defaultConfig } from 'base-types'
import _ from 'lodash'

describe('03 Make tunnel in all directions', function () {

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot iron_pickaxe`)
    bot.chat(`/give flatbot diamond_shovel`)
    bot.chat(`/give flatbot dirt 256`)

    bot.chat(`/fill 9 -60 -9 -9 -55 9 glass`)
    bot.chat(`/fill -8 -56 8 8 -63 -8 water`)
    bot.chat(`/fill -1 -61 -1 1 -61 1 glass`)
    bot.chat(`/fill -1 -57 -1 1 -57 1 glass`)
    bot.chat(`/fill -1 -60 1 1 -58 -1 air`)

    bot.chat(`/fill 2 -60 -2 -2 -57 -2 dirt`)
    bot.chat(`/fill 2 -60 -2 2 -57 2 dirt`)
    bot.chat(`/fill 2 -60 2 -2 -57 2 dirt`)
    bot.chat(`/fill -2 -60 2 -2 -57 -2 dirt`)
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
      tunnel: "horizontally",
      world: "overworld"
    }

    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    Object.assign(bot.config, config)
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
      tunnel: "horizontally",
      world: "overworld"
    }


    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    Object.assign(bot.config, config)
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
      tunnel: "horizontally",
      world: "overworld"
    }


    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    Object.assign(bot.config, config)
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
      tunnel: "horizontally",
      world: "overworld"
    }


    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    Object.assign(bot.config, config)
    bot.emit('reloadBotConfig')

    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

})
