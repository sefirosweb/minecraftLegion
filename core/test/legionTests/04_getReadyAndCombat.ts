import botConfigLoader from '@/modules/botConfig'
import { bot } from '../hooks'
import { Chest, Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { Vec3 } from 'vec3'
import botWebsocket from '@/modules/botWebsocket'


describe('04 Get ready for combat', function () {
  const chests: Array<Chest> = [
    {
      name: "Input chest name",
      type: "withdraw",
      position: new Vec3(-3, -60, 2),
      dimension: "overworld",
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
          name: "stone",
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
      dimension: "overworld",
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
      dimension: "overworld",
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

  before(async () => {
    const botConfig = botConfigLoader(bot.username)
    const patrol = []
    patrol.push(new Vec3(10, -60, 23))
    patrol.push(new Vec3(10, -60, 29))

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
      canCraftItemWithdrawChest: true,
      itemsCanBeEat: [
        "carrot",
      ],
      itemsToBeReady,
      patrol,
      chests
    }


    await bot.test.resetState()

    bot.chat(`/setblock -3 -60 2 chest[facing=east]{Items:[{Slot:0,id:iron_block,Count:64},{Slot:1,id:oak_log,Count:64},{Slot:2,id:stone,Count:64}]} replace`)
    bot.chat(`/setblock 3 -60 -2 chest[facing=west] replace`)
    bot.chat(`/setblock 3 -60 0 chest[facing=west] replace`)
    bot.chat(`/fill -3 -60 -7 -3 -60 -7 crafting_table`)
    bot.chat(`/fill 15 -60 35 -3 -58 17 dirt`)
    bot.chat(`/fill -1 -58 19 13 -60 33 air`)
    bot.chat(`/fill 0 -60 15 1 -59 15 dirt`)
    bot.chat(`/fill 1 -60 14 0 -60 14 dirt`)
    bot.chat(`/fill 8 -59 20 9 -60 20 dirt`)
    bot.chat(`/fill 8 -60 21 9 -60 21 dirt`)
    bot.chat(`/summon husk 1 -60 22 {HandItems:[{Count:1,id:diamond_sword,tag:{Enchantments:[{id:sharpness,lvl:5}]}},{}],ArmorItems:[{Count:1,id:diamond_boots},{Count:1,id:diamond_leggings},{Count:1,id:diamond_chestplate},{Count:1,id:diamond_helmet}]}`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')
  })

  it('Fight with mob', (): Promise<void> => {
    botWebsocket.sendAction('setChests', {})
    return new Promise((resolve) => {
      bot.once('beatMob', () => {
        resolve()
      })
    })
  })

})
