//@ts-nocheck
const assert = require('assert')
import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
const startTests = require('./plugins/startTests')

module.exports = () => async (bot) => {
  const tests = []
  function addTest(name, f) {
    tests.push({
      name,
      f: () => f(bot)
    })
  }

  let xStart = -10
  let yStart = -50
  let zStart = -10

  let xEnd = -12
  let yEnd = -60
  let zEnd = -12


  bot.chat(`/give flatbot minecraft:iron_pickaxe`)
  bot.chat(`/give flatbot minecraft:diamond_shovel`)
  bot.chat(`/give flatbot minecraft:dirt 64`)
  bot.chat(`/fill ${xStart} ${yStart} ${zStart} ${xEnd} ${yEnd} ${zEnd} minecraft:dirt`)
  bot.chat(`/teleport ${xStart} ${yStart + 2} ${zStart}`)
  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const minerCords = {
    yStart: yStart,
    yEnd: yStart,
    xStart,
    zStart,
    xEnd,
    zEnd,
    orientation: "x+",
    reverse: false,
    tunel: "vertically",
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

  addTest('Making a Hole X+ Normal', (bot) => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole X+ Reverse', (bot) => {
    yStart--;

    const newMinerCords = {
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

    botConfig.saveFullConfig(bot.username, newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole X- Normal', (bot) => {
    yStart--;

    const newMinerCords = {
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

    botConfig.saveFullConfig(bot.username, newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole X- Reverse', (bot) => {
    yStart--;

    const newMinerCords = {
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

    botConfig.saveFullConfig(bot.username, newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole Z+ Normal', (bot) => {
    yStart--;

    const newMinerCords = {
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

    botConfig.saveFullConfig(bot.username, newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole Z+ Reverse', (bot) => {
    yStart--;

    const newMinerCords = {
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

    botConfig.saveFullConfig(bot.username, newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole Z- Normal', (bot) => {
    yStart--;

    const newMinerCords = {
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

    botConfig.saveFullConfig(bot.username, newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

  addTest('Making a Hole Z- Reverse', (bot) => {
    yStart--;

    const newMinerCords = {
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

    botConfig.saveFullConfig(bot.username, newConfig)
    bot.emit('reloadBotConfig')
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })



  return startTests(tests)
}
