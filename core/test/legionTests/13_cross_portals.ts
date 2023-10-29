import botConfigLoader from '@/modules/botConfig'
import { bot } from '../hooks'
import { Jobs, Config, MineCordsConfig } from 'base-types'
import { Vec3 } from 'vec3'

describe('12 Cross the portals', function () {
  let botConfig: ReturnType<typeof botConfigLoader>

  before(async () => {
    botConfig = botConfigLoader(bot.username)
    await bot.test.resetState()

    bot.chat(`/fill -4 -60 13 0 -55 13 obsidian`)
    bot.chat(`/fill -3 -59 13 -1 -56 13 nether_portal`)
    bot.chat(`/fill 16 -60 -1 16 -60 1 end_portal_frame[eye=true,facing=west]`)
    bot.chat(`/fill 20 -60 -1 20 -60 1 end_portal_frame[eye=true,facing=west]`)
    bot.chat(`/fill 19 -60 2 17 -60 2 end_portal_frame[eye=true,facing=north]`)
    bot.chat(`/fill 17 -60 -2 19 -60 -2 end_portal_frame[eye=true,facing=north]`)
    bot.chat(`/fill 17 -60 -1 19 -60 1 end_portal`)

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
      world: "the_nether"
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
          dimension: "the_nether",
          items: [
            {
              name: "iron_pickaxe",
              quantity: 1
            }
          ]
        }
      ],
    }

    bot.once('checkPortalsOnSpawn', async () => {
      botConfig.saveFullConfig(config)
      bot.emit('reloadBotConfig')
    })


    return new Promise((resolve) => {
      bot.once('spawn', async () => {
        bot.once('checkPortalsOnSpawn', async () => {

          botConfig.saveFullConfig(botConfig.defaultConfig)
          bot.emit('reloadBotConfig')

          setTimeout(() => {
            bot.chat(`/execute as flatbot in overworld run teleport 0 -60 0`)
            setTimeout(() => {
              resolve()
            }, 2000);
          }, 2000)
        })
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
      world: "the_end"
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
          dimension: "the_end",
          items: [
            {
              name: "iron_pickaxe",
              quantity: 1
            }
          ]
        }
      ],
    }


    bot.once('checkPortalsOnSpawn', async () => {
      botConfig.saveFullConfig(config)
      bot.emit('reloadBotConfig')
    })

    return new Promise((resolve) => {
      bot.once('spawn', () => {
        bot.once('checkPortalsOnSpawn', async () => {
          botConfig.saveFullConfig(botConfig.defaultConfig)
          bot.emit('reloadBotConfig')

          setTimeout(() => {
            bot.chat(`/execute as flatbot in overworld run teleport 0 -60 0`)
            setTimeout(() => {
              resolve()
            }, 2000);
          }, 2000)
        })
      })
    })
  })

})
