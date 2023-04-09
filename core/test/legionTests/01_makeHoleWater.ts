import botConfigLoader from '@/modules/botConfig'
import { Jobs, Config, MineCordsConfig } from 'base-types'
import { bot } from '../hooks'

describe('01 Mining in water', function () {
  before(async () => {
    const botConfig = botConfigLoader(bot.username)
    await bot.test.resetState()
    bot.chat(`/give flatbot iron_pickaxe`)
    bot.chat(`/give flatbot diamond_shovel`)
    bot.chat(`/give flatbot dirt 256`)
    bot.chat(`/fill -1 -60 4 10 -56 14 glass`)
    bot.chat(`/fill 0 -60 5 9 -56 13 water`)
    bot.chat(`/teleport -1 -55 4`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    const minerCords: MineCordsConfig = {
      xStart: 2,
      yStart: -56,
      zStart: 7,
      xEnd: 7,
      yEnd: -58,
      zEnd: 11,
      orientation: "x+",
      reverse: false,
      tunel: "vertically",
      world: "overworld"
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

    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')
  })

  it('Making a Hole in water', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

})
