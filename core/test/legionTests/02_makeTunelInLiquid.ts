import { bot } from '../hooks'
import { Config, Jobs, MineCordsConfig } from 'base-types'
import { defaultConfig } from 'base-types'

describe('02 Make basic tunel in water & lava', function () {

  const minerCords: MineCordsConfig = {
    xStart: 2,
    yStart: -60,
    zStart: -1,
    xEnd: 20,
    yEnd: -59,
    zEnd: 0,
    orientation: "x+",
    reverse: false,
    tunel: "horizontally",
    world: "overworld"
  }


  before(async () => {
    const config: Config = {
      ...structuredClone(defaultConfig),
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
    bot.chat(`/give flatbot dirt 256`)

    bot.chat(`/fill 2 -56 -4 20 -63 3 glass`)
    bot.chat(`/fill 2 -63 -1 2 -59 0 dirt`)
    bot.chat(`/fill 3 -57 -3 7 -63 2 lava`)
    bot.chat(`/fill 8 -57 2 8 -63 -3 dirt`)
    bot.chat(`/fill 9 -57 -3 19 -63 2 water`)
    bot.chat(`/fill 11 -63 2 11 -57 -3 kelp`)
    bot.chat(`/fill 10 -63 2 10 -63 -3 soul_sand`)
    bot.chat(`/fill 12 -63 -3 12 -63 2 magma_block`)
    bot.chat(`/fill 13 -62 -1 13 -62 -1 dirt`)
    bot.chat(`/fill 13 -61 -1 13 -61 -1 seagrass`)
    bot.chat(`/fill 13 -61 -2 13 -61 -2 dirt`)
    bot.chat(`/fill 13 -60 -2 13 -60 -2 seagrass`)
    bot.chat(`/fill 13 -61 0 13 -61 0 dirt`)
    bot.chat(`/fill 13 -60 0 13 -60 0 seagrass`)
    bot.chat(`/fill 13 -59 -1 13 -59 -1 dirt`)
    bot.chat(`/fill 13 -58 -1 13 -58 -1 seagrass`)
    bot.chat(`/fill 21 -60 3 27 -56 3 glass`)
    bot.chat(`/fill 27 -56 -4 21 -60 -4 glass`)
    bot.chat(`/fill 27 -60 3 27 -56 -4 glass`)
    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    bot.config = config
    bot.emit('reloadBotConfig')
  })

  it('Making a Hole in Liquid', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

})
