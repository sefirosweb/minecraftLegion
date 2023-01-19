import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
import inventoryModule from '@/modules/inventoryModule'
import { Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { bot } from '../hooks'

describe('07 Farming bamboo', function () {

  const config: Config = {
    ...botConfig.defaultConfig,
    job: Jobs.farmer,
    pickUpItems: true,
    itemsCanBeEat: [],
    itemsToBeReady: [],
    plantAreas: [
      {
        plant: "bamboo",
        layer: {
          xStart: 10,
          xEnd: 20,
          zStart: 0,
          zEnd: 0,
          yLayer: -61,
        }
      }
    ],
  }

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_axe`)
    bot.chat(`/give flatbot minecraft:iron_hoe`)
    bot.chat(`/give flatbot minecraft:iron_sword`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.chat(`/give flatbot minecraft:bamboo 1`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')
  })


  it('Farming bamboo', (): Promise<void> => {
    return new Promise((resolve) => {

      const clearItemsInterval = setInterval(() => {
        bot.chat('/kill @e[type=!player]')
      }, 20000)

      const { getResumeInventory } = inventoryModule(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind: Array<{
          name: string,
          quantity: number
        }> = [
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

})
