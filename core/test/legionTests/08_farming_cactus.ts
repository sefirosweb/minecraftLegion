
import inventoryModule from '@/modules/inventoryModule'
import { bot } from '../hooks'
import { Jobs, Config } from 'base-types'
import { defaultConfig } from 'base-types'
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash'

describe('08 Farming cactus', function () {
  before(async () => {
    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.farmer,
      pickUpItems: true,
      itemsCanBeEat: ['golden_carrot'],
      itemsToBeReady: [],
      plantAreas: [
        {
          uuid: uuidv4(),
          plant: "cactus",
          layer: {
            uuid: uuidv4(),
            yLayer: -61,
            xStart: 10,
            zStart: 20,
            xEnd: 20,
            zEnd: 20
          }
        }
      ],
    }

    await bot.test.resetState()
    bot.chat(`/give flatbot iron_axe`)
    bot.chat(`/give flatbot iron_hoe`)

    bot.chat(`/fill 10 -61 20 20 -61 20 sand`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.chat(`/give flatbot cactus 4`)
    bot.chat(`/give flatbot golden_carrot 64`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    Object.assign(bot.config, config)
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
