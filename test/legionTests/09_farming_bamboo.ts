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

  bot.chat(`/give flatbot minecraft:iron_axe`)
  bot.chat(`/give flatbot minecraft:iron_hoe`)
  bot.chat(`/give flatbot minecraft:iron_sword`)
  bot.chat(`/gamerule randomTickSpeed 500`)

  bot.chat(`/give flatbot minecraft:bamboo 1`)

  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const config = {
    ...botConfig.defaultConfig,
    job: 'farmer',
    pickUpItems: true,
    itemsCanBeEat: [],
    itemsToBeReady: [],
    plantAreas: [
      {
        plant: "bamboo",
        yLayer: -61,
        xStart: 10,
        xEnd: 20,
        zStart: 0,
        zEnd: 0
      }
    ],
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  addTest('Farming bamboo', (bot) => {
    return new Promise((resolve) => {

      const clearItemsInterval = setInterval(() => {
        bot.test.sayEverywhere('/kill @e[type=!player]')
      }, 20000)

      const { getResumeInventory } = require("@modules/inventoryModule")(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind = [
          {
            name: 'bamboo', quantity: 20
          }
        ]

        itemsToFind.every((itemToFind) => {
          const item = getResumeInventory().find(i => i.name === itemToFind.name && i.quantity >= itemToFind.quantity)
          if (!item) {
            foundAll = false
            return false
          }
          return true
        })

        if (foundAll) {
          clearInterval(clearItemsInterval)
          clearInterval(interval)
          resolve()
        }
      }, 400)

    })
  })

  return startTests(tests)
}
