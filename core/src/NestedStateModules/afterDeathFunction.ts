import { BotwebsocketAction, LegionStateMachineTargets, Master } from 'base-types'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'minecraftlegion-statemachine'
import { botWebsocket } from '@/modules'
import StartWork from '@/NestedStateModules/startWorkFunction'
import Commands from '@/NestedStateModules/commandsFunction'
import GoSleep from '@/NestedStateModules/goSleepFunction'
import GoChestsFunctions from '@/NestedStateModules/getReady/goChestsFunctions'
import { Bot } from 'mineflayer'
import { BehaviorGetPlayer, BehaviorLoadConfig } from '@/BehaviorModules'

export let afterDeathTransitions: Array<StateTransition> = []

export const afterDeathFunction = (bot: Bot, targets: LegionStateMachineTargets): NestedStateMachine => {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const startWork = StartWork(bot, targets)
  startWork.x = 525
  startWork.y = 513

  const commands = Commands(bot, targets)
  commands.x = 325
  commands.y = 263

  const goChests = GoChestsFunctions(bot, targets)
  goChests.x = 725
  goChests.y = 413

  const playerEntity = new BehaviorGetPlayer(bot, targets)
  playerEntity.stateName = 'Search Player'
  playerEntity.x = 525
  playerEntity.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 125
  loadConfig.y = 413

  const goSleep = GoSleep(bot, targets)
  goSleep.x = 725
  goSleep.y = 263

  afterDeathTransitions = [
    new StateTransition({ // 0
      parent: startWork,
      child: loadConfig,
      name: 'Reload config',
      onTransition: () => botWebsocket.log('Reloading configuration'),
      shouldTransition: () => false
    }),

    new StateTransition({ // 1
      parent: goSleep,
      child: loadConfig,
      onTransition: () => {
        bot.wake()
          .catch(e => console.log(e))
        targets.triedToSleep = false
      },
      name: 'Reload config'
    }),

    new StateTransition({ // 2
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({ // 3
      parent: start,
      child: playerEntity,
      name: '[3] Player say: hi'
    }),

    new StateTransition({ // 4
      parent: startWork,
      child: playerEntity,
      name: '[4] Player say: hi'
    }),

    new StateTransition({ // 5
      parent: goSleep,
      child: playerEntity,
      name: '[5] Player say: hi'
    }),

    new StateTransition({ // 6
      parent: goChests,
      child: playerEntity,
      name: 'Player say: hi',
    }),

    new StateTransition({
      parent: playerEntity,
      child: commands,
      name: 'Transfer to sub nestered commands',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: commands,
      child: loadConfig,
      onTransition: () => {
        bot.look(bot.player.entity.yaw, 0)
        targets.triedToSleep = false
      },
      shouldTransition: () => commands.isFinished()
    }),

    new StateTransition({
      parent: loadConfig,
      child: startWork,
      onTransition: () => {
        targets.movements.allowSprinting = bot.config.allowSprinting
        targets.movements.canDig = bot.config.canDig
        targets.movements.allow1by1towers = bot.config.canPlaceBlocks
        targets.movements.scafoldingBlocks = bot.config.canPlaceBlocks ? targets.movements.scafoldingBlocks : []
        targets.movements.blocksToAvoid.delete(bot.mcData.blocksByName.wheat.id)
        targets.movements.blocksToAvoid.add(bot.mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(bot.mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(bot.mcData.blocksByName.cactus.id)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: startWork,
      child: goSleep,
      onTransition: () => {
        targets.triedToSleep = true
      },
      shouldTransition: () => bot.config.canSleep === true && targets.triedToSleep === false && targets.isNight === true
    }),

    new StateTransition({
      parent: goSleep,
      child: goChests,
      shouldTransition: () => goSleep.isFinished() || targets.isNight === false
    }),

    new StateTransition({
      parent: goChests,
      child: loadConfig,
      shouldTransition: () => goChests.isFinished()
    }),


  ]

  const reloadTrigger = () => {
    targets.entity = undefined
    bot.stopDigging()
    bot.pathfinder.setGoal(null)

    afterDeathTransitions[0].trigger()
    afterDeathTransitions[1].trigger()
  }

  const commandTrigger = () => {
    botWebsocket.log('sendStay')
    afterDeathTransitions[3].trigger()
    afterDeathTransitions[4].trigger()
    afterDeathTransitions[5].trigger()
    afterDeathTransitions[6].trigger()
    botWebsocket.emitCombat(false)
  }

  botWebsocket.on('action', (toBotData: BotwebsocketAction) => {
    const { type } = toBotData
    switch (type) {
      case 'reloadConfig':
        reloadTrigger()
        break
      case 'stay':
        commandTrigger()
        break
    }
  })

  bot.on('reloadBotConfig', () => {
    reloadTrigger()
  })

  bot.on('chat', (master, message) => {
    if (message === 'hi ' + bot.username || message === 'hi all') {
      const masters = botWebsocket.getMasters() as Master[]
      const findMaster = masters.find(e => e === master)

      if (findMaster === undefined) {
        botWebsocket.log(`${master} is no in master list!`)
        return
      }

      playerEntity.playerName = master
      commandTrigger()
    }
  })

  const nestedState = new NestedStateMachine(afterDeathTransitions, start)
  nestedState.stateName = 'After death function'
  return nestedState
}