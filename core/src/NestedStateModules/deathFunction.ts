import { BotwebsocketAction, LegionStateMachineTargets, Master } from 'base-types'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorGetPlayer from '@/BehaviorModules/BehaviorGetPlayer'
import botWebsocket from '@/modules/botWebsocket'
import BehaviorLoadConfig from '@/BehaviorModules/BehaviorLoadConfig'
import StartWork from '@/NestedStateModules/startWorkFunction'
import Commands from '@/NestedStateModules/commandsFunction'
import GoSleep from '@/NestedStateModules/goSleepFunction'
import { Bot } from 'mineflayer'

function deathFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const startWork = StartWork(bot, targets)
  startWork.x = 525
  startWork.y = 413

  const commands = Commands(bot, targets)
  commands.x = 325
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
  goSleep.x = 725
  goSleep.y = 263

  const transitions = [
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
      name: 'Player say: hi'
    }),

    new StateTransition({ // 4
      parent: startWork,
      child: playerEntity,
      name: 'Player say: hi'
    }),

    new StateTransition({ // 5
      parent: goSleep,
      child: playerEntity,
      name: 'Player say: hi'
    }),

    new StateTransition({ // 6
      parent: playerEntity,
      child: commands,
      name: 'Transfer to sub nestered commands',
      shouldTransition: () => true
    }),

    new StateTransition({ // 7
      parent: commands,
      child: loadConfig,
      onTransition: () => {
        bot.look(bot.player.entity.yaw, 0)
        targets.triedToSleep = false
      },
      shouldTransition: () => commands.isFinished()
    }),

    new StateTransition({ // 8
      parent: loadConfig,
      child: startWork,
      onTransition: () => {
        targets.config = loadConfig.getAllConfig()
        targets.movements.allowSprinting = targets.config.allowSprinting
        targets.movements.canDig = targets.config.canDig
        targets.movements.allow1by1towers = targets.config.canPlaceBlocks
        targets.movements.scafoldingBlocks = targets.config.canPlaceBlocks ? targets.movements.scafoldingBlocks : []
        targets.movements.blocksToAvoid.delete(bot.mcData.blocksByName.wheat.id)
        targets.movements.blocksToAvoid.add(bot.mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(bot.mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(bot.mcData.blocksByName.cactus.id)
      },
      shouldTransition: () => true
    }),

    new StateTransition({ // 9
      parent: startWork,
      child: goSleep,
      onTransition: () => {
        targets.triedToSleep = true
      },
      shouldTransition: () => targets.config.canSleep === true && targets.triedToSleep === false && targets.isNight === true
    }),

    new StateTransition({ // 10
      parent: goSleep,
      child: startWork,
      shouldTransition: () => goSleep.isFinished() || targets.isNight === false
    }),



  ]

  function reloadTrigger() {
    targets.entity = undefined
    bot.stopDigging()
    bot.pathfinder.setGoal(null)

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

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'After death function'
  return nestedState
}

export default deathFunction
