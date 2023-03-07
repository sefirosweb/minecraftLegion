import botConfigLoader from '@/modules/botConfig'
import { Config } from '@/types'
import { Jobs } from '@/types/defaultTypes'
import { Vec3 } from 'vec3'
import { bot } from '../hooks'

describe('05 Test bow long range', function () {
  before(async () => {
    const botConfig = botConfigLoader(bot.username)
    const patrol = []
    patrol.push(new Vec3(50, -48, 0))
    const config: Config = {
      ...botConfig.defaultConfig,
      job: Jobs.guard,
      mode: 'pve',
      distance: 120,
      itemsToBeReady: [],
      patrol
    }

    await bot.test.resetState()
    bot.chat(`/fill 50 -49 0 50 -49 0 stone`)
    bot.chat(`/fill -50 -48 0 -50 -48 0 stone`)
    bot.chat(`/teleport 50 -46 0`)
    bot.chat(`/give flatbot bow`)
    bot.chat(`/give flatbot arrow 256`)
    bot.chat(`/summon creeper -50 -47 0 {PersistenceRequired:1}`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    botConfig.saveFullConfig(config)
    bot.emit('reloadBotConfig')
  })

  it('Fight with mob with bow', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('beatMob', () => resolve())
    })
  })

})
