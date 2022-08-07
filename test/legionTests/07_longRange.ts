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

  bot.chat(`/fill 50 -49 0 50 -49 0 minecraft:stone`)
  bot.chat(`/fill -50 -48 0 -50 -48 0 minecraft:stone`)
  bot.chat(`/teleport 50 -46 0`)
  bot.chat(`/give flatbot bow`)
  bot.chat(`/give flatbot minecraft:arrow 256`)
  bot.chat(`/summon creeper -50 -47 0 {PersistenceRequired:1}`)



  bot.creative.stopFlying()
  bot.test.becomeSurvival()


  const config = {
    ...botConfig.defaultConfig,
    job: 'guard',
    mode: 'pve',
    distance: 120,
    itemsToBeReady: [
      {
        item: "bow",
        quantity: 1
      }
    ],
    patrol: [
      {
        x: 50,
        y: -48,
        z: 0
      }
    ],
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  addTest('Fight with mob', (bot) => {
    return new Promise((resolve) => {
      bot.once('beatMob', () => resolve())
    })
  })

  return startTests(tests)
}
