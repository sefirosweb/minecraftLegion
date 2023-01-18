import { BotwebsocketAction, LegionStateMachineTargets, Master } from '@/types'
import { Bot } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
//@ts-ignore
import BehaviorGetPlayer from '@/BehaviorModules/BehaviorGetPlayer'
//@ts-ignore
import botWebsocket from '@modules/botWebsocket'
import BehaviorLoadConfig from '@/BehaviorModules/BehaviorLoadConfig'
import mcDataLoader from 'minecraft-data'
import StartWork from '@/NestedStateModules/startWorkFunction'
import Commands from '@/NestedStateModules/commandsFunction'
import GoSleep from '@/NestedStateModules/goSleepFunction'

function deathFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const mcData = mcDataLoader(bot.version)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const startWork = StartWork(bot, targets)
  //@ts-ignore
  startWork.x = 525
  //@ts-ignore
  startWork.y = 413

  const commands = Commands(bot, targets)
  //@ts-ignore
  commands.x = 325
  //@ts-ignore
  commands.y = 263

  const playerEntity = new BehaviorGetPlayer(bot, targets)
  playerEntity.stateName = 'Search Player'
  playerEntity.x = 525
  playerEntity.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 125
  loadConfig.y = 413

  const goSleep = GoSleep(bot, targets)
  //@ts-ignore
  goSleep.x = 725
  //@ts-ignore
  goSleep.y = 263

  const transitions = [
    new StateTransition({
      parent: startWork,
      child: loadConfig,
      name: 'Reload config',
      onTransition: () => botWebsocket.log('Reloading configuration'),
      shouldTransition: () => false
    }),

    new StateTransition({
      parent: goSleep,
      child: loadConfig,
      onTransition: () => {
        bot.wake()
          .catch(e => console.log(e))
        targets.triedToSleep = false
      },
      name: 'Reload config'
    }),

    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: start,
      child: playerEntity,
      name: 'Player say: hi'
    }),

    new StateTransition({
      parent: startWork,
      child: playerEntity,
      name: 'Player say: hi'
    }),

    new StateTransition({
      parent: goSleep,
      child: playerEntity,
      name: 'Player say: hi'
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
        targets.config = loadConfig.getAllConfig()
        targets.movements.allowSprinting = targets.config.allowSprinting
        targets.movements.canDig = targets.config.canDig
        targets.movements.allow1by1towers = targets.config.canPlaceBlocks
        targets.movements.scafoldingBlocks = targets.config.canPlaceBlocks ? targets.movements.scafoldingBlocks : []
        targets.movements.blocksToAvoid.delete(mcData.blocksByName.wheat.id)
        targets.movements.blocksToAvoid.add(mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(mcData.blocksByName.cactus.id)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: startWork,
      child: goSleep,
      onTransition: () => {
        targets.triedToSleep = true
      },
      shouldTransition: () => targets.config.canSleep === true && targets.triedToSleep === false && targets.isNight === true
    }),

    new StateTransition({
      parent: goSleep,
      child: startWork,
      shouldTransition: () => goSleep.isFinished() || targets.isNight === false
    }),



  ]

  function reloadTrigger() {
    bot.stopDigging()
    transitions[0].trigger()
    transitions[1].trigger()
  }

  function commandTrigger() {
    botWebsocket.log('sendStay')
    transitions[3].trigger()
    transitions[4].trigger()
    transitions[5].trigger()
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
    console.log('Reloading bot config')
    reloadTrigger()
  })

  bot.on('chat', (master, message) => {
    if (message === 'hi ' + bot.username || message === 'hi all') {
      const masters = botWebsocket.getMasters() as Master[]
      const findMaster = masters.find(e => e?.name === master)

      if (findMaster === undefined) {
        botWebsocket.log(`${master} is no in master list!`)
        return
      }

      commandTrigger()
    }
  })

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'After death function'
  return nestedState
}

export default deathFunction
