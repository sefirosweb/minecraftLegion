const assert = require('assert')
const { once } = require('events')
const botConfig = require('@modules/botConfig')
const startTests = require('./plugins/startTests')

module.exports = () => async (bot) => {
  const tests = []
  function addTest(name, f) {
    tests.push({
      name,
      f: () => f(bot)
    })
  }

  bot.chat(`/give flatbot minecraft:iron_pickaxe`)
  bot.chat(`/give flatbot minecraft:diamond_shovel`)
  bot.chat(`/give flatbot minecraft:dirt 256`)

  bot.chat(`/fill 9 -60 -9 -9 -55 9 minecraft:glass`)
  bot.chat(`/fill -8 -56 8 8 -63 -8 minecraft:water`)
  bot.chat(`/fill -1 -61 -1 1 -61 1 minecraft:glass`)
  bot.chat(`/fill -1 -57 -1 1 -57 1 minecraft:glass`)
  bot.chat(`/fill -1 -60 1 1 -58 -1 minecraft:air`)

  bot.chat(`/fill 2 -60 -2 -2 -57 -2 minecraft:dirt`)
  bot.chat(`/fill 2 -60 -2 2 -57 2 minecraft:dirt`)
  bot.chat(`/fill 2 -60 2 -2 -57 2 minecraft:dirt`)
  bot.chat(`/fill -2 -60 2 -2 -57 -2 minecraft:dirt`)
  bot.creative.stopFlying()
  bot.test.becomeSurvival()


  addTest('Making a Hole: X+', (bot) => {
    const minerCords = {
      xStart: 2,
      yStart: -60,
      zStart: -1,
      xEnd: 6,
      yEnd: -59,
      zEnd: 0,
      orientation: "x+",
      reverse: false,
      tunel: "horizontally",
      world: "minecraft:overworld"
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
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')

    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole: X-', (bot) => {
    const minerCords = {
      xStart: -2,
      yStart: -60,
      zStart: 1,
      xEnd: -6,
      yEnd: -59,
      zEnd: 0,
      orientation: "x-",
      reverse: true,
      tunel: "horizontally",
      world: "minecraft:overworld"
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
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')


    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole: Z+', (bot) => {
    const minerCords = {
      xStart: 1,
      yStart: -60,
      zStart: 2,
      xEnd: 0,
      yEnd: -59,
      zEnd: 6,
      orientation: "z+",
      reverse: true,
      tunel: "horizontally",
      world: "minecraft:overworld"
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
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')


    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole: Z-', (bot) => {
    const minerCords = {
      xStart: -1,
      yStart: -60,
      zStart: -2,
      xEnd: 0,
      yEnd: -59,
      zEnd: -6,
      orientation: "z-",
      reverse: true,
      tunel: "horizontally",
      world: "minecraft:overworld"
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
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')


    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })


  return startTests(tests)
}
