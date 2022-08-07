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

  bot.chat(`/give flatbot minecraft:iron_axe`)
  bot.chat(`/gamerule randomTickSpeed 500`)
  bot.chat(`/give flatbot minecraft:wheat 128`)
  bot.chat(`/fill -6 -59 6 6 -60 -6 minecraft:stone`)
  bot.chat(`/fill -5 -59 5 5 -60 -5 minecraft:air`)
  bot.chat(`/summon cow 3 -60 -3`)
  bot.chat(`/summon cow 3 -60 3`)

  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const config = {
    ...botConfig.defaultConfig,
    job: 'breeder',
    pickUpItems: true,
    itemsToBeReady: [],
    farmAnimal: {
      ...botConfig.defaultConfig.farmAnimal,
      cow: 1, // Pending to fix
    },
    farmAreas: [
      {
        yLayer: -61,
        xStart: 5,
        xEnd: -5,
        zStart: -5,
        zEnd: 5
      }
    ],
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  addTest('Farming vegetables', (bot) => {
    return new Promise((resolve) => {

      const { getResumeInventory } = require("@modules/inventoryModule")(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind = [
          {
            name: 'sugar_cane', quantity: 2
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
          clearInterval(interval)
          resolve()
        }
      }, 400)

    })
  })

  return startTests(tests)
}
