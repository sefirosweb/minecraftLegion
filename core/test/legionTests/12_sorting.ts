import { Jobs, Config } from 'base-types'
import { bot } from '../hooks'
import botWebsocket from '@/modules/botWebsocket'
import { defaultConfig } from 'base-types'

describe('11 Sorting items', function () {

  before(async () => {
    const config: Config = {
      ...structuredClone(defaultConfig),
      job: Jobs.sorter,
      itemsToBeReady: [],
    }

    await bot.test.resetState()

    bot.chat(`/setblock 0 -60 -5 chest{Items:[{Slot:0,id:acacia_chest_boat,Count:1},{Slot:1,id:iron_block,Count:11}]} replace`)
    bot.chat(`/setblock -6 -60 -5 chest{Items:[{Slot:0,id:oak_log,Count:13},{Slot:1,id:iron_block,Count:11},{Slot:2,id:iron_shovel,Count:1}]} replace`)
    bot.chat(`/setblock -3 -60 -5 chest[type=right]{Items:[{Slot:0,id:carrot,Count:46},{Slot:1,id:carrot,Count:7},{Slot:2,id:iron_shovel,Count:1}]} replace`)
    bot.chat(`/setblock -4 -60 -5 chest[type=left]{Items:[{Slot:0,id:carrot,Count:46},{Slot:1,id:carrot,Count:7},{Slot:2,id:iron_shovel,Count:1}]} replace`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()
    bot.config = config
    bot.emit('reloadBotConfig')
  })

  it('Sorted', (): Promise<void> => {
    botWebsocket.sendAction('setChests', {})
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

})
