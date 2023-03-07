import botConfigLoader from '@/modules/botConfig'
import inventoryModule from '@/modules/inventoryModule'
import { Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { bot } from '../hooks'

describe('07 Farming bamboo', function () {
  before(async () => {
    const botConfig = botConfigLoader(bot.username)
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

    await bot.test.resetState()
    bot.chat(`/give flatbot iron_axe`)
    bot.chat(`/give flatbot iron_hoe`)
    bot.chat(`/give flatbot iron_sword`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.chat(`/give flatbot bamboo 1`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(config)
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
