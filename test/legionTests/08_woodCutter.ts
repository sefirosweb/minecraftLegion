//@ts-nocheck
import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
import startTests from './plugins/startTests'
import inventoryModule from '@/modules/inventoryModule'

module.exports = () => async (bot) => {
  const tests = []
  function addTest(name, f) {
    tests.push({
      name,
      f: () => f(bot)
    })
  }

  bot.chat(`/give flatbot minecraft:oak_sapling`)
  bot.chat(`/give flatbot minecraft:iron_axe`)
  bot.chat(`/fill 8 -54 8 8 -54 8 minecraft:stone`)
  bot.chat(`/gamerule randomTickSpeed 500`)

  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const config = {
    ...botConfig.defaultConfig,
    job: 'farmer',
    pickUpItems: true,
    itemsToBeReady: [
      {
        item: "iron_axe",
        quantity: 1
      }
    ],
    plantAreas: [
      {
        plant: "oak_sapling",
        yLayer: -61,
        xStart: 8,
        xEnd: 8,
        zStart: 8,
        zEnd: 8
      }
    ],
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  addTest('Wood cutter', (bot) => {
    return new Promise((resolve) => {
      const { getResumeInventory } = inventoryModule(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind = [
          {
            name: 'oak_log', quantity: 10
          },
          {
            name: 'stick', quantity: 1
          },
          {
            name: 'oak_sapling', quantity: 1
          },
          {
            name: 'apple', quantity: 1
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
