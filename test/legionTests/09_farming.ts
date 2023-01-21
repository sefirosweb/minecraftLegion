import botConfigLoader from '@/modules/botConfig'
import inventoryModule from '@/modules/inventoryModule'
import { bot } from '../hooks'
import { Config, PlantArea } from '@/types'
import { Jobs } from '@/types/defaultTypes'

describe('09 General farming', function () {
  const plantAreas: Array<PlantArea> = [
    {
      plant: "pumpkin",
      layer: {
        yLayer: -61,
        xStart: 2,
        xEnd: 2,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      plant: "melon",
      layer: {
        yLayer: -61,
        xStart: 4,
        xEnd: 4,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      plant: "carrot",
      layer: {
        yLayer: -61,
        xStart: 6,
        xEnd: 6,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      plant: "potato",
      layer: {
        yLayer: -61,
        xStart: 7,
        xEnd: 7,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      plant: "beetroot",
      layer: {
        yLayer: -61,
        xStart: 8,
        xEnd: 8,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      plant: "wheat",
      layer: {
        yLayer: -61,
        xStart: 9,
        xEnd: 9,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      plant: "sweet_berries",
      layer: {
        yLayer: -61,
        xStart: 11,
        xEnd: 11,
        zStart: 0,
        zEnd: 0
      }
    },
    {
      plant: "sugar_cane",
      layer: {
        yLayer: -61,
        xStart: 14,
        xEnd: 14,
        zStart: 0,
        zEnd: 0
      }
    }
  ]

  before(async () => {
    const botConfig = botConfigLoader(bot.username)
    const config: Config = {
      ...botConfig.defaultConfig,
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
    bot.chat(`/give flatbot minecraft:iron_axe`)
    bot.chat(`/give flatbot minecraft:iron_hoe`)
    bot.chat(`/fill 1 -61 -1 23 -61 -1 minecraft:stone_slab[type=top,waterlogged=true]`)
    bot.chat(`/fill 11 -59 0 11 -59 0 minecraft:cobblestone_slab[type=top]`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.chat(`/give flatbot minecraft:pumpkin_seeds 2`)
    bot.chat(`/give flatbot minecraft:melon_seeds 2`)
    bot.chat(`/give flatbot minecraft:carrot 1`)
    bot.chat(`/give flatbot minecraft:potato 1`)
    bot.chat(`/give flatbot minecraft:beetroot_seeds 2`)
    bot.chat(`/give flatbot minecraft:wheat_seeds 2`)
    bot.chat(`/give flatbot minecraft:sweet_berries 1`)
    bot.chat(`/give flatbot minecraft:sugar_cane 1`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(config)
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
