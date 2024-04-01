import inventoryModule from '@/modules/inventoryModule'
import { Jobs, Config, PlantArea } from 'base-types'
import { bot } from '../hooks'
import { defaultConfig } from 'base-types'
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash'

describe('06 Wood cutter', function () {
  const plantAreas: Array<PlantArea> = [
    {
      uuid: uuidv4(),
      plant: "oak_sapling",
      layer: {
        uuid: uuidv4(),
        xStart: 8,
        xEnd: 8,
        zStart: 8,
        zEnd: 8,
        yLayer: -61,
      }
    }
  ]

  before(async () => {
    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.farmer,
      pickUpItems: true,
      itemsToBeReady: [
        {
          name: "iron_axe",
          quantity: 1
        }
      ],
      plantAreas
    }

    await bot.test.resetState()
    bot.chat(`/give flatbot oak_sapling`)
    bot.chat(`/give flatbot iron_axe`)
    bot.chat(`/fill 8 -54 8 8 -54 8 stone`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    Object.assign(bot.config, config)
    bot.emit('reloadBotConfig')
  })

  it('Wood cutter', (): Promise<void> => {
    return new Promise((resolve) => {
      const { getResumeInventory } = inventoryModule(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind: Array<{
          name: string,
          quantity: number
        }> = [
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

})
