import inventoryModule from '@/modules/inventoryModule'
import { Jobs, Config } from 'base-types'
import { bot } from '../hooks'
import { defaultConfig } from 'base-types'
import _ from 'lodash'

const listOfAnimalstoFeed = [
  {
    name: 'Cows',
    summon: 'cow',
    raw_meat: 'beef'
  },
  {
    name: 'Sheeps',
    summon: 'sheep',
    raw_meat: 'mutton'
  },
  {
    name: 'Chickens',
    summon: 'chicken',
    raw_meat: 'chicken'
  },
  {
    name: 'Pigs',
    summon: 'pig',
    raw_meat: 'porkchop'
  },
  {
    name: 'Rabits',
    summon: 'rabbit',
    raw_meat: 'rabbit'
  }
]

describe('10 Butcher animals', function () {

  const beforeEachAnimal = async () => {
    const config: Config = {
      ..._.cloneDeep(defaultConfig),
      job: Jobs.breeder,
      pickUpItems: true,
      itemsToBeReady: [],
      farmAnimalSeconds: 10,
      farmAnimal: {
        ...defaultConfig.farmAnimal,
        cow: 3,
        sheep: 3,
        chicken: 3,
        pig: 3,
        rabbit: 8,
      },
      farmAreas: [
        {
          xStart: 7,
          xEnd: -7,
          zStart: -7,
          zEnd: 7,
          yLayer: -61,
        }
      ],
    }


    await bot.test.resetState()
    bot.chat(`/give flatbot iron_axe`)
    bot.chat(`/give flatbot wheat 64`)
    bot.chat(`/give flatbot wheat_seeds 64`)
    bot.chat(`/give flatbot potato 64`)
    bot.chat(`/give flatbot carrot 64`)
    bot.chat(`/fill -6 -59 6 6 -60 -6 stone`)
    bot.chat(`/fill -5 -59 5 5 -60 -5 air`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    bot.config = config
    bot.emit('reloadBotConfig')
  }

  for (let i = 0; i < listOfAnimalstoFeed.length; i++) {
    const animalToFeed = listOfAnimalstoFeed[i]

    it(animalToFeed.name, async (): Promise<void> => {
      await beforeEachAnimal();
      return new Promise((resolve) => {

        bot.chat(`/summon ${animalToFeed.summon} 0 -60 -3`)
        bot.chat(`/summon ${animalToFeed.summon} 0 -60 3`)

        const intervalFeedCows = setInterval(() => {
          const entities = bot.entities

          for (const entityName of Object.keys(entities)) {
            const entity = entities[entityName]
            if (entity.name !== animalToFeed.summon) {
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
                name: animalToFeed.raw_meat, quantity: 4
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
            bot.config = defaultConfig
            bot.emit('reloadBotConfig')
            clearInterval(intervalFeedCows)
            clearInterval(interval)
            resolve()
          }
        }, 400)

      })
    })
  }
})
