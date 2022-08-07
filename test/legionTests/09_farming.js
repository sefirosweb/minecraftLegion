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
  bot.chat(`/give flatbot minecraft:iron_hoe`)
  bot.chat(`/fill 1 -61 -1 23 -61 -1 minecraft:water`)
  bot.chat(`/fill 11 -59 0 11 -59 0 minecraft:cobblestone_slab[type=top]`)
  bot.chat(`/gamerule randomTickSpeed 500`)

  bot.chat(`/give flatbot minecraft:pumpkin_seeds 1`)
  bot.chat(`/give flatbot minecraft:melon_seeds 1`)
  bot.chat(`/give flatbot minecraft:carrot 1`)
  bot.chat(`/give flatbot minecraft:potato 1`)
  bot.chat(`/give flatbot minecraft:beetroot_seeds 1`)
  bot.chat(`/give flatbot minecraft:wheat_seeds 1`)
  bot.chat(`/give flatbot minecraft:sweet_berries 1`)
  bot.chat(`/give flatbot minecraft:sugar_cane 1`)




  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const config = {
    ...botConfig.defaultConfig,
    job: 'farmer',
    pickUpItems: true,
    itemsCanBeEat: [],
    itemsToBeReady: [
      {
        item: "iron_axe",
        quantity: 1
      }
    ],
    plantAreas: [
      {
        plant: "pumpkin",
        yLayer: -61,
        xStart: 2,
        xEnd: 2,
        zStart: 0,
        zEnd: 0
      },
      {
        plant: "melon",
        yLayer: -61,
        xStart: 4,
        xEnd: 4,
        zStart: 0,
        zEnd: 0
      },
      {
        plant: "carrot",
        yLayer: -61,
        xStart: 6,
        xEnd: 6,
        zStart: 0,
        zEnd: 0
      },
      {
        plant: "potato",
        yLayer: -61,
        xStart: 7,
        xEnd: 7,
        zStart: 0,
        zEnd: 0
      },
      {
        plant: "beetroot",
        yLayer: -61,
        xStart: 8,
        xEnd: 8,
        zStart: 0,
        zEnd: 0
      },
      {
        plant: "wheat",
        yLayer: -61,
        xStart: 9,
        xEnd: 9,
        zStart: 0,
        zEnd: 0
      },
      {
        plant: "sweet_berries",
        yLayer: -61,
        xStart: 11,
        xEnd: 11,
        zStart: 0,
        zEnd: 0
      },
      {
        plant: "sugar_cane",
        yLayer: -61,
        xStart: 14,
        xEnd: 14,
        zStart: 0,
        zEnd: 0
      }
    ],
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  addTest('Farming vegetables', (bot) => {
    return new Promise((resolve) => {
      const clearItemsInterval = setInterval(() => {
        bot.test.sayEverywhere('/kill @e[type=!player]')
      }, 20000)

      const { getResumeInventory } = require("@modules/inventoryModule")(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind = [
          {
            name: 'pumpkin', quantity: 2
          },
          {
            name: 'melon_slice', quantity: 2
          },
          {
            name: 'carrot', quantity: 2
          },
          {
            name: 'potato', quantity: 2
          },
          {
            name: 'beetroot', quantity: 2
          },
          {
            name: 'wheat', quantity: 2
          },
          {
            name: 'sweet_berries', quantity: 2
          },
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
          clearInterval(clearItemsInterval)
          clearInterval(interval)
          resolve()
        }
      }, 400)

    })
  })

  return startTests(tests)
}
