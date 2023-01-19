import botConfigLoader from '@/modules/botConfig'
const botConfig = botConfigLoader()
import { bot } from '../hooks'
import { Chest, Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { Vec3 } from 'vec3'

describe('04 Get ready for combat', function () {

  const chests: Array<Chest> = [
    {
      name: "Input chest name",
      type: "withdraw",
      position: new Vec3(-3, -60, 2),
      dimension: "minecraft:overworld",
      items: [
        {
          name: "iron_sword",
          quantity: 1
        },
        {
          name: "iron_helmet",
          quantity: 1
        },
        {
          name: "iron_chestplate",
          quantity: 1
        },
        {
          name: "iron_leggings",
          quantity: 1
        },
        {
          name: "iron_boots",
          quantity: 1
        },
        {
          name: "oak_door",
          quantity: 4
        },
        {
          name: "oak_fence_gate",
          quantity: 1
        },
        {
          name: "oak_boat",
          quantity: 1
        },
        {
          name: "oak_log",
          quantity: 10
        },
        {
          name: "golden_axe",
          quantity: 1
        },
      ]
    },
    {
      name: "Input chest name",
      type: "deposit",
      position: new Vec3(3, -60, 0),
      dimension: "minecraft:overworld",
      items: [
        {
          name: "oak_door",
          quantity: 1
        },
        {
          name: "oak_fence_gate",
          quantity: 0
        },
        {
          name: "oak_log",
          quantity: 0
        },
      ]
    },
    {
      name: "Input chest name",
      type: "depositAll",
      position: new Vec3(3, -60, -2),
      dimension: "minecraft:overworld",
      items: [
        {
          name: "iron_sword",
          quantity: 1
        },
        {
          name: "iron_helmet",
          quantity: 1
        },
        {
          name: "iron_chestplate",
          quantity: 1
        },
        {
          name: "iron_leggings",
          quantity: 1
        },
        {
          name: "iron_boots",
          quantity: 1
        }
      ]
    }
  ]

  const patrol = []
  patrol.push(new Vec3(10, -60, 30))
  patrol.push(new Vec3(1, -60, 31))

  const itemsToBeReady = [
    {
      name: "iron_sword",
      quantity: 1
    }
  ]

  const config: Config = {
    ...botConfig.defaultConfig,
    job: Jobs.guard,
    mode: 'pve',
    allowSprinting: true,
    itemsCanBeEat: [
      "carrot",
    ],
    itemsToBeReady,
    patrol,
    chests
  }

  before(async () => {
    await bot.test.resetState()

    bot.chat(`/setblock -3 -60 2 chest[facing=east]{Items:[{Slot:0,id:iron_block,Count:64},{Slot:1,id:oak_log,Count:64}]} replace`)
    bot.chat(`/setblock 3 -60 -2 chest[facing=west] replace`)
    bot.chat(`/setblock 3 -60 0 chest[facing=west] replace`)
    bot.chat(`/fill -3 -60 1 -3 -60 1 minecraft:crafting_table`)
    bot.chat(`/fill 15 -60 35 -3 -58 17 minecraft:dirt`)
    bot.chat(`/fill -2 -58 18 14 -60 34 minecraft:air`)
    bot.chat(`/fill 0 -60 15 1 -59 15 minecraft:dirt`)
    bot.chat(`/fill 1 -60 14 0 -60 14 minecraft:dirt`)
    bot.chat(`/fill 6 -59 18 6 -59 18 minecraft:dirt`)
    bot.chat(`/fill 8 -60 18 8 -60 18 minecraft:dirt`)
    bot.chat(`/summon husk 1 -60 22 {HandItems:[{Count:1,id:diamond_sword,tag:{Enchantments:[{id:sharpness,lvl:5}]}},{}],ArmorItems:[{Count:1,id:diamond_boots},{Count:1,id:diamond_leggings},{Count:1,id:diamond_chestplate},{Count:1,id:diamond_helmet}]}`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')
  })

  it('Fight with mob', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('beatMob', () => {
        resolve()
      })
    })
  })

})
