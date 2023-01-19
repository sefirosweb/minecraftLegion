
import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
import inventoryModule from '@/modules/inventoryModule'
import { bot } from '../hooks'
import { Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'

describe('08 Farming cactus', function () {

  const config: Config = {
    ...botConfig.defaultConfig,
    job: Jobs.farmer,
    pickUpItems: true,
    itemsCanBeEat: ['golden_carrot'],
    itemsToBeReady: [],
    plantAreas: [
      {
        plant: "cactus",
        layer: {
          yLayer: -61,
          xStart: 10,
          zStart: 20,
          xEnd: 20,
          zEnd: 20
        }
      }
    ],
  }

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_axe`)
    bot.chat(`/give flatbot minecraft:iron_hoe`)

    bot.chat(`/fill 10 -61 20 20 -61 20 minecraft:sand`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.chat(`/give flatbot minecraft:cactus 4`)
    bot.chat(`/give flatbot minecraft:golden_carrot 64`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')
  })


  it('Farming catus', (): Promise<void> => {
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

})
