import botConfigLoader from '@/modules/botConfig'
import { bot } from '../hooks'
import { Config, MineCordsConfig } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { Vec3 } from 'vec3'

describe('12 Cross the portals', function () {
  let botConfig: ReturnType<typeof botConfigLoader>

  before(async () => {
    botConfig = botConfigLoader(bot.username)
    await bot.test.resetState()

    bot.chat(`/fill -4 -60 13 0 -55 13 minecraft:obsidian`)
    bot.chat(`/fill -3 -59 13 -1 -56 13 minecraft:nether_portal`)
    bot.chat(`/fill 16 -60 -1 16 -60 1 minecraft:end_portal_frame[eye=true,facing=west]`)
    bot.chat(`/fill 20 -60 -1 20 -60 1 minecraft:end_portal_frame[eye=true,facing=west]`)
    bot.chat(`/fill 19 -60 2 17 -60 2 minecraft:end_portal_frame[eye=true,facing=north]`)
    bot.chat(`/fill 17 -60 -2 19 -60 -2 minecraft:end_portal_frame[eye=true,facing=north]`)
    bot.chat(`/fill 17 -60 -1 19 -60 1 minecraft:end_portal`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()
    bot.emit('reloadBotConfig')
  })

  // TODO add go nether withouth chest..
  it('Cross overworld to nether', (): Promise<void> => {
    const minerCords: MineCordsConfig = {
      xStart: -6,
      yStart: 34,
      zStart: -6,
      xEnd: -3,
      yEnd: 33,
      zEnd: -3,
      orientation: "x+",
      reverse: false,
      tunel: "vertically",
      world: "minecraft:the_nether"
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
      minerCords,
      chests: [
        {
          name: "Input chest name",
          type: "withdraw",
          position: new Vec3(-2, -35, 1),
          dimension: "minecraft:the_nether",
          items: [
            {
              name: "iron_pickaxe",
              quantity: 1
            }
          ]
        }
      ],
    }

    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')

    return new Promise((resolve) => {
      bot.once('spawn', () => {
        bot.chat(`/execute as flatbot in minecraft:overworld run teleport 0 -60 0`)
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    })
  })

  it('Cross overworld to end', (): Promise<void> => {
    const minerCords: MineCordsConfig = {
      xStart: -6,
      yStart: 34,
      zStart: -6,
      xEnd: -3,
      yEnd: 33,
      zEnd: -3,
      orientation: "x+",
      reverse: false,
      tunel: "vertically",
      world: "minecraft:the_end"
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
      minerCords,
      chests: [
        {
          name: "Input chest name",
          type: "withdraw",
          position: new Vec3(-2, -35, 1),
          dimension: "minecraft:the_end",
          items: [
            {
              name: "iron_pickaxe",
              quantity: 1
            }
          ]
        }
      ],
    }


    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')

    return new Promise((resolve) => {
      bot.once('spawn', () => {
        bot.chat(`/execute as flatbot in minecraft:overworld run teleport 0 -60 0`)
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    })
  })

})
