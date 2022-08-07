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

  bot.chat(`/give flatbot minecraft:iron_pickaxe`)
  bot.chat(`/give flatbot minecraft:diamond_shovel`)
  bot.chat(`/give flatbot minecraft:dirt 256`)
  bot.chat(`/fill -1 -60 4 10 -56 14 minecraft:glass`)
  bot.chat(`/fill 0 -60 5 9 -56 13 water`)
  bot.chat(`/teleport -1 -55 4`)

  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const minerCords = {
    xStart: 2,
    yStart: -56,
    zStart: 7,
    xEnd: 7,
    yEnd: -58,
    zEnd: 11,
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


  return startTests(tests)
}
