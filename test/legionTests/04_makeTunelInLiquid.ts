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

  bot.chat(`/give flatbot minecraft:iron_pickaxe`)
  bot.chat(`/give flatbot minecraft:diamond_shovel`)
  bot.chat(`/give flatbot minecraft:dirt 256`)

  bot.chat(`/fill 2 -56 -4 20 -63 3 minecraft:glass`)
  bot.chat(`/fill 2 -63 -1 2 -59 0 minecraft:dirt`)
  bot.chat(`/fill 3 -57 -3 7 -63 2 minecraft:lava`)
  bot.chat(`/fill 8 -57 2 8 -63 -3 minecraft:dirt`)
  bot.chat(`/fill 9 -57 -3 19 -63 2 minecraft:water`)
  bot.chat(`/fill 11 -63 2 11 -57 -3 minecraft:kelp`)
  bot.chat(`/fill 10 -63 2 10 -63 -3 minecraft:soul_sand`)
  bot.chat(`/fill 12 -63 -3 12 -63 2 minecraft:magma_block`)
  bot.chat(`/fill 13 -62 -1 13 -62 -1 minecraft:dirt`)
  bot.chat(`/fill 13 -61 -1 13 -61 -1 minecraft:seagrass`)
  bot.chat(`/fill 13 -61 -2 13 -61 -2 minecraft:dirt`)
  bot.chat(`/fill 13 -60 -2 13 -60 -2 minecraft:seagrass`)
  bot.chat(`/fill 13 -61 0 13 -61 0 minecraft:dirt`)
  bot.chat(`/fill 13 -60 0 13 -60 0 minecraft:seagrass`)
  bot.chat(`/fill 13 -59 -1 13 -59 -1 minecraft:dirt`)
  bot.chat(`/fill 13 -58 -1 13 -58 -1 minecraft:seagrass`)
  bot.creative.stopFlying()
  bot.test.becomeSurvival()


  const minerCords = {
    xStart: 2,
    yStart: -60,
    zStart: -1,
    xEnd: 20,
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

  addTest('Making a Hole in Liquid', (bot) => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })


  return startTests(tests)
}
