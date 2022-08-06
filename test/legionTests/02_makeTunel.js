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

  let xStart = -15
  let yStart = -60
  let zStart = -9

  let xEnd = -10
  let yEnd = -57
  let zEnd = -14


  bot.chat(`/give flatbot minecraft:iron_pickaxe`)
  bot.chat(`/give flatbot minecraft:diamond_shovel`)
  bot.chat(`/give flatbot minecraft:dirt 64`)
  bot.chat(`/fill ${xStart} ${yStart} ${zStart} ${xEnd} ${yEnd} ${zEnd} minecraft:dirt`)
  bot.chat(`/teleport -2 -60 -9`)
  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const minerCords = {
    xStart: -10,
    yStart: -60,
    zStart: -11,
    xEnd: -12,
    yEnd: -59,
    zEnd: -12,
    orientation: "x-",
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

  addTest('Making a Hole X- Normal', (bot) => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })


  addTest('Making a Hole X+ Normal', (bot) => {

    const newMinerCords = {
      ...minerCords,
      xStart: -15,
      xEnd: -13,
      orientation: "x+"
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

    const newMinerCords = {
      ...minerCords,
      xStart: -12,
      xEnd: -13,
      zStart: -14,
      zEnd: -12,
      orientation: "z+"
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

    const newMinerCords = {
      ...minerCords,
      xStart: -12,
      xEnd: -13,
      zStart: -9,
      zEnd: -11,
      orientation: "z-"
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
