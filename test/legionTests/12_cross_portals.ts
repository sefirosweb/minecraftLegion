//@ts-nocheck
import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
import startTests from './plugins/startTests'


module.exports = () => async (bot) => {
  const tests = []
  function addTest(name, f) {
    tests.push({
      name,
      f: () => f(bot)
    })
  }

  bot.chat(`/fill -4 -60 13 0 -55 13 minecraft:obsidian`)
  bot.chat(`/fill -3 -59 13 -1 -56 13 minecraft:nether_portal`)
  bot.chat(`/fill 16 -60 -1 16 -60 1 minecraft:end_portal_frame[eye=true,facing=west]`)
  bot.chat(`/fill 20 -60 -1 20 -60 1 minecraft:end_portal_frame[eye=true,facing=west]`)
  bot.chat(`/fill 19 -60 2 17 -60 2 minecraft:end_portal_frame[eye=true,facing=north]`)
  bot.chat(`/fill 17 -60 -2 19 -60 -2 minecraft:end_portal_frame[eye=true,facing=north]`)
  bot.chat(`/fill 17 -60 -1 19 -60 1 minecraft:end_portal`)

  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  // TODO add go nether withouth chest..
  addTest('Cross overworld to nether', (bot) => {
    const minerCords = {
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

    const config = {
      ...botConfig.defaultConfig,
      job: 'miner',
      itemsToBeReady: [
        {
          item: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords,
      chests: [
        {
          name: "Input chest name",
          type: "withdraw",
          position: {
            x: -2,
            y: -35,
            z: 1,
            dimension: "minecraft:the_nether"
          },
          items: [
            {
              item: "iron_pickaxe",
              quantity: 1
            }
          ]
        }
      ],
    }


    botConfig.saveFullConfig(bot.username, config)
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

  addTest('Cross overworld to end', (bot) => {
    const minerCords = {
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

    const config = {
      ...botConfig.defaultConfig,
      job: 'miner',
      itemsToBeReady: [
        {
          item: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords,
      chests: [
        {
          name: "Input chest name",
          type: "withdraw",
          position: {
            x: -2,
            y: -35,
            z: 1,
            dimension: "minecraft:the_end"
          },
          items: [
            {
              item: "iron_pickaxe",
              quantity: 1
            }
          ]
        }
      ],
    }


    botConfig.saveFullConfig(bot.username, config)
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

  return startTests(tests)
}
