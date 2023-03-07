import assert from 'assert'
import { Vec3 } from 'vec3'

import { sleep, onceWithCleanup } from '../../lib/promise_utils'

import botConfigLoader from '@/modules/botConfig'
import { Bot } from '@/types'
import { Block } from 'prismarine-block'

export default (bot: Bot) => {
  const botConfig = botConfigLoader(bot.username)
  const gameModeChangedMessages = ['commands.gamemode.success.self', 'gameMode.changed']

  let grassName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    grassName = 'grass_block'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    grassName = 'grass'
  }

  const layerNames = [
    'bedrock',
    'dirt',
    'dirt',
    grassName,
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air',
    'air'
  ]

  const resetBlocksToSuperflat = async () => {
    const groundY = 0
    for (let y = groundY + 20; y >= groundY - 1; y--) {
      const realY = y + bot.test.groundY - 4
      bot.chat(`/fill ~-50 ${realY} ~-50 ~50 ${realY} ~50 ` + layerNames[y])
    }
    bot.chat(`/fill 0 -61 0 0 -61 0 gold_block`)
    await bot.test.wait(100)
  }

  const placeBlock = async (slot: number, position: Vec3) => {
    bot.setQuickBarSlot(slot - 36)
    const referenceBlock = bot.blockAt(position.plus(new Vec3(0, -1, 0))) as Block
    return bot.placeBlock(referenceBlock, new Vec3(0, 1, 0))
  }

  const resetState = async () => {
    await teleport(new Vec3(0, -60, 0))
    await bot.test.wait(1000)
    bot.chat('/weather clear 999999')
    bot.chat('/time set day')
    bot.chat('/gamerule doMobLoot false')
    bot.chat('/kill @e[type=!player]')
    bot.chat('/gamerule doMobLoot true')
    bot.chat('/gamerule randomTickSpeed 20')
    botConfig.saveFullConfig(botConfig.defaultConfig);
    await becomeCreative()
    await clearInventory()
    bot.creative.startFlying()
    await bot.waitForChunksToLoad()
    await resetBlocksToSuperflat()
    await sleep(1000)
    await clearInventory()
  }

  const becomeCreative = () => {
    return setCreativeMode(true)
  }

  const becomeSurvival = () => {
    return setCreativeMode(false)
  }

  const setCreativeMode = (value: boolean) => {
    const getGM = (val: boolean) => val ? 'creative' : 'survival'
    let i = 0
    const msgProm = onceWithCleanup(bot, 'message', {
      checkCondition: (msg) => gameModeChangedMessages.includes(msg.translate) && i++ > 0 && bot.game.gameMode === getGM(value)
    })

    bot.chat(`/gamemode ${getGM(value)}`)
    bot.chat(`/gamemode ${getGM(!value)}`)
    bot.chat(`/gamemode ${getGM(value)}`)
    return msgProm
  }

  async function clearInventory() {
    const msgProm = onceWithCleanup(bot, 'message', { checkCondition: msg => msg.translate === 'commands.clear.success.single' || msg.translate === 'commands.clear.success' })
    bot.chat('/give @a stone 1')
    await onceWithCleanup(bot.inventory, 'updateSlot', { checkCondition: (slot, oldItem, newItem) => newItem?.name === 'stone' })

    const inventoryClearedProm = Promise.all(
      bot.inventory.slots
        .filter(item => item)
        .map(item => onceWithCleanup(bot.inventory, `updateSlot:${item.slot}`, { checkCondition: (oldItem, newItem) => newItem === null })))

    bot.chat('/clear')
    await msgProm
    await inventoryClearedProm
    assert.strictEqual(bot.inventory.slots.filter(i => i).length, 0)
  }

  async function teleport(position: Vec3) {
    bot.chat(`/execute as flatbot in overworld run teleport 0 -60 0`)

    return onceWithCleanup(bot, 'move', {
      checkCondition: () => bot.entity.position.distanceTo(position) < 0.9
    })
  }

  const sayEverywhere = (message: string) => {
    bot.chat(message)
    console.log(message)
  }

  const fly = (delta: Vec3): Promise<void> => {
    return bot.creative.flyTo(bot.entity.position.plus(delta))
  }

  bot.test = {
    groundY: bot.supportFeature('tallWorld') ? -60 : 4,
    sayEverywhere,
    clearInventory,
    becomeSurvival,
    becomeCreative,
    fly,
    resetState,
    placeBlock,

    wait: function (ms) {
      return new Promise((resolve) => { setTimeout(resolve, ms) })
    }
  }
}
