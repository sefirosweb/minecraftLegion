const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')
const BehaviorGetPlayer = require('@BehaviorModules/BehaviorGetPlayer')
const botWebsocket = require('@modules/botWebsocket')
const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')

function deathFunction(bot, targets) {
  const mcData = require('minecraft-data')(bot.version)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const startWork = require('@NestedStateModules/startWorkFunction')(bot, targets)
  startWork.x = 525
  startWork.y = 413

  const commands = require('@NestedStateModules/commandsFunction')(bot, targets)
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

  const goSleep = require('@NestedStateModules/goSleepFunction')(bot, targets)
  goSleep.x = 725
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

  botWebsocket.on('action', toBotData => {
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
      const masters = botWebsocket.getMasters()
      const findMaster = masters.find(e => e.name === master)

      if (findMaster === undefined) {
        botWebsocket.log(`${master} is no in master list!`)
        return
      }

      commandTrigger()
    }
  })

  const deathFunction = new NestedStateMachine(transitions, start)
  deathFunction.stateName = 'After death function'
  return deathFunction
}

module.exports = deathFunction
