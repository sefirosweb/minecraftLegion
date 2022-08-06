const assert = require('assert')
const { once } = require('events')
const botConfig = require('@modules/botConfig')

module.exports = () => async (bot) => {
  await bot.chat(`/give flatbot minecraft:iron_pickaxe`)
  await bot.chat(`/give flatbot minecraft:iron_shovel`)
  await bot.chat(`/give flatbot minecraft:cobblestone 64`)
  await bot.chat(`/fill 4 -60 4 -2 -55 10 minecraft:stone`)
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
      zStart: 4,
      xEnd: 4,
      yEnd: -60,
      zEnd: 10,
      orientation: "x+",
      tunel: "vertically",
      reverse: false,
      world: "minecraft:overworld"
    }
  }

  botConfig.saveFullConfig(bot.username, config)

  bot.emit('reloadBotConfig')

  await bot.test.wait(100000)
  assert.strictEqual(true, true)
}
