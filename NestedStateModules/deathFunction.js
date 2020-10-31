const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')
const BehaviorGetPlayer = require('./../BehaviorModules/BehaviorGetPlayer')
const botWebsocket = require('../modules/botWebsocket')

function deathFunction(bot, targets) {
  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const startWork = require('./startWorkFunction')(bot, targets)
  const commands = require('./commandsFunction')(bot, targets)
  const playerEntity = new BehaviorGetPlayer(bot, targets)
  playerEntity.stateName = 'Search Player'

  const transitions = [
    new StateTransition({
      parent: enter,
      child: startWork,
      name: 'enter -> startWork',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: enter,
      child: playerEntity,
      name: 'Player say: hi'
    }),

    new StateTransition({
      parent: startWork,
      child: playerEntity,
      name: 'Player say: hi'
    }),

    new StateTransition({
      parent: playerEntity,
      child: commands,
      name: 'Transfer to sub nestered commands',
      shouldTransition: () => commands.isFinished(),
      onTransition: () => bot.chat('Hi ' + playerEntity.getPlayerName())
    }),

    new StateTransition({
      parent: commands,
      child: startWork,
      name: 'Commands finished',
      shouldTransition: () => commands.isFinished(),
      onTransition: () => bot.look(bot.player.entity.yaw, 0)
    })
  ]

  function commandTrigger(master) {
    const player = playerEntity.getPlayerEntity(master)
    if (player) {
      botWebsocket.log('sendStay')
      transitions[1].trigger()
      transitions[2].trigger()
      botWebsocket.emitCombat(false)
    } else {
      botWebsocket.log(`Playername ${master} not found!`)
    }
  }

  botWebsocket.on('sendStay', (master) => {
    commandTrigger(master)
  })

  bot.on('chat', (username, message) => {
    if (message === 'hi ' + bot.username || message === 'hi all') {
      commandTrigger(username)
    }
  })

  const deathFunction = new NestedStateMachine(transitions, enter)
  deathFunction.stateName = 'After death function'
  return deathFunction
}

module.exports = deathFunction
