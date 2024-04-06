import { Jobs, Config } from 'base-types'
import { bot } from '../hooks'
import { defaultConfig } from 'base-types'
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash'
import { inventoryModule } from '@/modules'

describe('07 Farming bamboo', function () {
  before(async () => {
    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.farmer,
      pickUpItems: true,
      itemsCanBeEat: [],
      itemsToBeReady: [],
      plantAreas: [
        {
          uuid: uuidv4(),
          plant: "bamboo",
          layer: {
            uuid: uuidv4(),
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

    Object.assign(bot.config, config)
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
