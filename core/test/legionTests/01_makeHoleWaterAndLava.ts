import botConfigLoader from '@/modules/botConfig'
import { Config, MineCordsConfig } from 'types/index'
import { Jobs } from 'types/defaultTypes'
import { bot } from '../hooks'

describe('01 Make hole in liquid & lava', function () {

  const minerCords: MineCordsConfig = {
    xStart: -11,
    yStart: -50,
    zStart: -12,
    xEnd: -13,
    yEnd: -52,
    zEnd: -10,
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
    bot.chat(`/fill -16 -50 -7 -8 -60 -15 glass`)
    bot.chat(`/fill -9 -50 -14 -12 -60 -8 lava`)
    bot.chat(`/fill -15 -50 -14 -13 -60 -8 water`)
    bot.chat(`/fill -11 -50 -10 -13 -50 -12 dirt`)
    bot.chat(`/fill -12 -50 -10 -12 -60 -12 dirt`)
    bot.chat(`/fill -13 -60 -12 -13 -51 -12 kelp`)
    bot.chat(`/fill -13 -52 -11 -13 -52 -11 dirt`)
    bot.chat(`/fill -13 -51 -11 -13 -51 -11 seagrass`)
    bot.chat(`/teleport -12 -48 -11`)
    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')
  })

  it('Making a Hole in Liquid', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })
})
