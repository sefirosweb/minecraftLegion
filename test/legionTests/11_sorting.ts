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

  bot.chat(`/setblock 0 -60 -5 chest{Items:[{Slot:0,id:acacia_chest_boat,Count:1},{Slot:1,id:iron_block,Count:11}]} replace`)
  bot.chat(`/setblock -6 -60 -5 chest{Items:[{Slot:0,id:oak_log,Count:13},{Slot:1,id:iron_block,Count:11},{Slot:2,id:iron_shovel,Count:1}]} replace`)
  bot.chat(`/setblock -3 -60 -5 chest[type=right]{Items:[{Slot:0,id:carrot,Count:16},{Slot:1,id:carrot,Count:7},{Slot:2,id:iron_shovel,Count:1}]} replace`)
  bot.chat(`/setblock -4 -60 -5 chest[type=left]{Items:[{Slot:0,id:carrot,Count:16},{Slot:1,id:carrot,Count:7},{Slot:2,id:iron_shovel,Count:1}]} replace`)


  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const config = {
    ...botConfig.defaultConfig,
    job: 'sorter',
    itemsToBeReady: [],
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  addTest('Farming vegetables', (bot) => {
    return new Promise((resolve) => {

    })
  })

  return startTests(tests)
}
