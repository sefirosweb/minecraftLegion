import inventoryModule from '@/modules/inventoryModule'
import { bot } from '../hooks'
import { Jobs, Config, PlantArea } from 'base-types'
import { defaultConfig } from 'base-types'
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash'

describe('09 General farming', function () {
  const plantAreas: Array<PlantArea> = [
    {
      uuid: uuidv4(),
      plant: "pumpkin",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 2,
        xEnd: 2,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      uuid: uuidv4(),
      plant: "melon",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 4,
        xEnd: 4,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      uuid: uuidv4(),
      plant: "carrot",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 6,
        xEnd: 6,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      uuid: uuidv4(),
      plant: "potato",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 7,
        xEnd: 7,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      uuid: uuidv4(),
      plant: "beetroot",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 8,
        xEnd: 8,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      uuid: uuidv4(),
      plant: "wheat",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 9,
        xEnd: 9,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      uuid: uuidv4(),
      plant: "sweet_berries",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 11,
        xEnd: 11,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      uuid: uuidv4(),
      plant: "sugar_cane",
      layer: {
        uuid: uuidv4(),
        yLayer: -61,
        xStart: 14,
        xEnd: 14,
        zStart: 0,
        zEnd: 0
      }
    }
  ]

  before(async () => {
    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.farmer,
      pickUpItems: true,
      itemsCanBeEat: [],
      itemsToBeReady: [
        {
          name: "iron_axe",
          quantity: 1
        }
      ],
      plantAreas,
    }

    await bot.test.resetState()
    bot.chat(`/give flatbot iron_axe`)
    bot.chat(`/give flatbot iron_hoe`)
    bot.chat(`/fill 1 -61 -1 23 -61 -1 stone_slab[type=top,waterlogged=true]`)
    bot.chat(`/fill 11 -59 0 11 -59 0 cobblestone_slab[type=top]`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.chat(`/give flatbot pumpkin_seeds 2`)
    bot.chat(`/give flatbot melon_seeds 2`)
    bot.chat(`/give flatbot carrot 1`)
    bot.chat(`/give flatbot potato 1`)
    bot.chat(`/give flatbot beetroot_seeds 2`)
    bot.chat(`/give flatbot wheat_seeds 2`)
    bot.chat(`/give flatbot sweet_berries 1`)
    bot.chat(`/give flatbot sugar_cane 1`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    Object.assign(bot.config, config)
    bot.emit('reloadBotConfig')
  })


  it('Farmed vegetables', (): Promise<void> => {
    return new Promise((resolve) => {
      const { getResumeInventory } = inventoryModule(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind: Array<{
          name: string,
          quantity: number
        }> = [
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
          clearInterval(interval)
          resolve()
        }
      }, 400)

    })
  })

})
