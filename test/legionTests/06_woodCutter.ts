import botConfigLoader from '@/modules/botConfig'
import inventoryModule from '@/modules/inventoryModule'
import { Config, PlantArea } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { bot } from '../hooks'
const botConfig = botConfigLoader()

describe('06 Wood cutter', function () {

  const plantAreas: Array<PlantArea> = [
    {
      plant: "oak_sapling",
      layer: {
        xStart: 8,
        xEnd: 8,
        zStart: 8,
        zEnd: 8,
        yLayer: -61,
      }
    }
  ]

  const config: Config = {
    ...botConfig.defaultConfig,
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

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:oak_sapling`)
    bot.chat(`/give flatbot minecraft:iron_axe`)
    bot.chat(`/fill 8 -54 8 8 -54 8 minecraft:stone`)
    bot.chat(`/gamerule randomTickSpeed 500`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(bot.username, config)
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
