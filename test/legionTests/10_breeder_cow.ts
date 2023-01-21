import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
import inventoryModule from '@/modules/inventoryModule'
import { Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { bot } from '../hooks'


const listOfAnimalstoFeed = [
  // {
  //   name: 'Cows',
  //   summon: 'cow',
  //   raw_meat: 'beef'
  // },
  // {
  //   name: 'Sheeps',
  //   summon: 'sheep',
  //   raw_meat: 'mutton'
  // },
  // {
  //   name: 'Chickens',
  //   summon: 'chicken',
  //   raw_meat: 'chicken'
  // },
  // {
  //   name: 'Pigs',
  //   summon: 'pig',
  //   raw_meat: 'porkchop'
  // },
  {
    name: 'Rabits',
    summon: 'rabbit',
    raw_meat: 'rabbit'
  },

]

describe('10 Breeding animals', function () {

  const config: Config = {
    ...botConfig.defaultConfig,
    job: Jobs.breeder,
    pickUpItems: true,
    itemsToBeReady: [],
    farmAnimal: {
      ...botConfig.defaultConfig.farmAnimal,
      cow: 3,
      sheep: 3,
      chicken: 3,
      pig: 3,
      rabbit: 2,
      // bee: 3,
      cat: 3,
      donkey: 3,
      fox: 3,
      horse: 3,
      llama: 3,
      panda: 3,
      turtles: 3,
      wolf: 3,
      seconds: 10
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

  const beforeEachAnimal = async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_axe`)
    bot.chat(`/give flatbot minecraft:wheat 64`)
    bot.chat(`/give flatbot minecraft:wheat_seeds 64`)
    bot.chat(`/give flatbot minecraft:potato 64`)
    bot.chat(`/give flatbot minecraft:carrot 64`)
    bot.chat(`/fill -6 -59 6 6 -60 -6 minecraft:stone`)
    bot.chat(`/fill -5 -59 5 5 -60 -5 minecraft:air`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')
  }

  for (let i = 0; i < listOfAnimalstoFeed.length; i++) {
    const animalToFeed = listOfAnimalstoFeed[i]

    it(animalToFeed.name, async (): Promise<void> => {
      await beforeEachAnimal();
      return new Promise((resolve) => {
        bot.chat(`/summon ${animalToFeed.summon} 0 -60 -3`)
        bot.chat(`/summon ${animalToFeed.summon} 0 -60 -3`)

        const intervalFeedCows = setInterval(() => {
          const entities = bot.entities

          for (const entityName of Object.keys(entities)) {
            const entity = entities[entityName]
            //@ts-ignore
            if (entity.name !== animalToFeed.summon) {
              continue
            }

            // bot.chat(`/data merge entity ${entity.uuid} {Age:0}`)
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
            botConfig.saveFullConfig(bot.username, botConfig.defaultConfig)
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
