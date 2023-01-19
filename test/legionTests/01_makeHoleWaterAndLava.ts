import botConfigLoader from '@/modules/botConfig'
import { Config, MineCordsConfig } from '@/types'
import { Jobs } from '@/types/defaultTypes'
const botConfig = botConfigLoader()
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

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_pickaxe`)
    bot.chat(`/give flatbot minecraft:diamond_shovel`)
    bot.chat(`/give flatbot minecraft:dirt 64`)
    bot.chat(`/fill -16 -50 -7 -8 -60 -15 minecraft:glass`)
    bot.chat(`/fill -9 -50 -14 -12 -60 -8 lava`)
    bot.chat(`/fill -15 -50 -14 -13 -60 -8 minecraft:water`)
    bot.chat(`/fill -11 -50 -10 -13 -50 -12 minecraft:dirt`)
    bot.chat(`/fill -12 -50 -10 -12 -60 -12 dirt`)
    bot.chat(`/fill -13 -60 -12 -13 -51 -12 minecraft:kelp`)
    bot.chat(`/fill -13 -52 -11 -13 -52 -11 minecraft:dirt`)
    bot.chat(`/fill -13 -51 -11 -13 -51 -11 minecraft:seagrass`)
    bot.chat(`/teleport -12 -48 -11`)
    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')
  })

  it('Making a Hole in Liquid', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })
})
