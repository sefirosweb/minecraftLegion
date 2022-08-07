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

  bot.chat(`/give flatbot minecraft:iron_axe`)
  bot.chat(`/give flatbot minecraft:iron_hoe`)

  bot.chat(`/fill 10 -61 20 20 -61 20 minecraft:sand`)
  bot.chat(`/gamerule randomTickSpeed 500`)

  bot.chat(`/give flatbot minecraft:cactus 4`)
  bot.chat(`/give flatbot minecraft:carrot 64`)


  bot.creative.stopFlying()
  bot.test.becomeSurvival()

  const config = {
    ...botConfig.defaultConfig,
    job: 'farmer',
    pickUpItems: true,
    itemsCanBeEat: ['carrot'],
    itemsToBeReady: [],
    plantAreas: [
      {
        plant: "cactus",
        yLayer: -61,
        xStart: 10,
        zStart: 20,
        xEnd: 20,
        zEnd: 20
      }
    ],
  }

  botConfig.saveFullConfig(bot.username, config)
  bot.emit('reloadBotConfig')

  addTest('Farming catus', (bot) => {
    return new Promise((resolve) => {

      const clearItemsInterval = setInterval(() => {
        bot.test.sayEverywhere('/kill @e[type=!player]')
      }, 20000)

      const { getResumeInventory } = inventoryModule(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind = [
          {
            name: 'cactus', quantity: 10
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
