import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
import inventoryModule from '@/modules/inventoryModule'
import { Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { bot } from '../hooks'


describe('10 Breed cows', function () {

  const config: Config = {
    ...botConfig.defaultConfig,
    job: Jobs.breeder,
    pickUpItems: true,
    itemsToBeReady: [],
    farmAnimal: {
      ...botConfig.defaultConfig.farmAnimal,
      cow: 3,
      seconds: 10
    },
    farmAreas: [
      {
        xStart: 5,
        xEnd: -5,
        zStart: -5,
        zEnd: 5,
        yLayer: -61,
      }
    ],
  }

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_axe`)
    bot.chat(`/give flatbot minecraft:wheat 256`)
    bot.chat(`/fill -6 -59 6 6 -60 -6 minecraft:stone`)
    bot.chat(`/fill -5 -59 5 5 -60 -5 minecraft:air`)
    bot.chat(`/summon cow 3 -60 -3`)
    bot.chat(`/summon cow 3 -60 3`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')
  })

  it('Breeded cows', (): Promise<void> => {

    return new Promise((resolve) => {
      const intervalFeedCows = setInterval(() => {
        const entities = bot.entities

        for (const entityName of Object.keys(entities)) {
          const entity = entities[entityName]
          //@ts-ignore
          if (entity.name !== 'cow') {
            continue
          }

          bot.chat(`/data merge entity ${entity.uuid} {Age:0}`)
        }


      }, 5000)

      const { getResumeInventory } = inventoryModule(bot);
      const interval = setInterval(() => {
        let foundAll = true
        const itemsToFind: Array<{
          name: string,
          quantity: number
        }> = [
            {
              name: 'beef', quantity: 4
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
          clearInterval(intervalFeedCows)
          clearInterval(interval)
          resolve()
        }
      }, 400)

    })
  })

})
