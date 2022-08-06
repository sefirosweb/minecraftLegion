const assert = require('assert')
const { once } = require('events')
const botConfig = require('@modules/botConfig')

module.exports = () => async (bot) => {
  await bot.chat(`/give flatbot minecraft:iron_pickaxe`)
  await bot.chat(`/give flatbot minecraft:iron_shovel`)
  await bot.chat(`/give flatbot minecraft:cobblestone 64`)
  await bot.chat(`/fill 3 -60 3 -2 -55 7 minecraft:stone`)
  await bot.chat(`/teleport 1 -53 7`)
  await bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const config = {
    ...botConfig.defaultConfig,
    job: 'miner',
    itemsToBeReady: [
      {
        item: "iron_pickaxe",
        quantity: 1
      }
    ],
    minerCords: {
      xStart: -2,
      yStart: -55,
      zStart: 3,
      xEnd: 3,
      yEnd: -55,
      zEnd: 7,
      orientation: "x+",
      tunel: "vertically",
      reverse: false,
      world: "minecraft:overworld"
    }
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  return new Promise((resolve) => {
    bot.once('finishedJob', (job) => {
      resolve()
    })
  })
}
