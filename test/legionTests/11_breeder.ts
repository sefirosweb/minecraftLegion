import botConfigLoader from '@/modules/botConfig'
import { Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { bot } from '../hooks'
const botConfig = botConfigLoader()

const listOfAnimalstoFeed = [
  {
    name: 'Wolfs',
    summon: 'wolf',
  },
  {
    name: 'Foxes',
    summon: 'fox',
  },
  {
    name: 'Bees',
    summon: 'bee',
  },
  {
    name: 'Horses',
    summon: 'horse',
  },
  {
    name: 'Cats',
    summon: 'cat',
  },
  {
    name: 'Donkeys',
    summon: 'donkey',
  },
  {
    name: 'Llamas',
    summon: 'llama',
  },
  {
    name: 'Pandas',
    summon: 'panda',
  },
  {
    name: 'Turtles',
    summon: 'turtle',
  },
]

describe('11 Breeder animals', function () {

  const config: Config = {
    ...botConfig.defaultConfig,
    job: Jobs.breeder,
    pickUpItems: true,
    itemsToBeReady: [],
    farmAnimal: {
      ...botConfig.defaultConfig.farmAnimal,
      wolf: 3,
      fox: 3,
      bee: 3,
      horse: 3,
      cat: 3,
      donkey: 3,
      llama: 3,
      panda: 3,
      turtle: 3,

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
    bot.chat(`/give flatbot minecraft:beef 64`)
    bot.chat(`/give flatbot minecraft:sweet_berries 64`)
    bot.chat(`/give flatbot minecraft:red_tulip 64`)
    bot.chat(`/give flatbot minecraft:golden_apple 64`)
    bot.chat(`/give flatbot minecraft:cod 64`)
    bot.chat(`/give flatbot minecraft:hay_block 64`)
    bot.chat(`/give flatbot minecraft:bamboo 64`)
    bot.chat(`/give flatbot minecraft:seagrass 64`)
    bot.chat(`/fill -6 -50 6 6 -61 -6 minecraft:glass hollow`)
    bot.chat(`/fill -5 -61 -5 5 -61 5 minecraft:sand`)
    bot.chat(`/fill 2 -61 0 2 -58 0 minecraft:bamboo`)
    bot.chat(`/gamerule randomTickSpeed 10000`)

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
        let owner = ''

        if (['cat', 'wolf'].includes(animalToFeed.summon)) {
          owner = '{Owner:flatbot}'
        }

        if (['horse', 'donkey', 'llama'].includes(animalToFeed.summon)) {
          owner = '{Tame:1}'
        }

        bot.chat(`/summon ${animalToFeed.summon} 0 -60 -3 ${owner}`)
        bot.chat(`/summon ${animalToFeed.summon} 0 -60 3 ${owner}`)

        const interval = setInterval(() => {
          let finished = false

          const entities = bot.entities

          for (const entityName of Object.keys(entities)) {
            const entity = entities[entityName]
            if (entity.name !== animalToFeed.summon) {
              continue
            }

            //@ts-ignore
            if (entity.metadata[16] === true) { // is a baby
              finished = true
              break
            }
          }

          if (finished) {
            botConfig.saveFullConfig(bot.username, botConfig.defaultConfig)
            bot.emit('reloadBotConfig')
            clearInterval(interval)
            resolve()
          }

        }, 2000)

      })
    })
  }
})
