const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')
const BehaviorGetPlayer = require('@BehaviorModules/BehaviorGetPlayer')
const botWebsocket = require('@modules/botWebsocket')

function deathFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const startWork = require('@NestedStateModules/startWorkFunction')(bot, targets)
  startWork.x = 325
  startWork.y = 313

  const commands = require('@NestedStateModules/commandsFunction')(bot, targets)
  commands.x = 525
  commands.y = 113

  const playerEntity = new BehaviorGetPlayer(bot, targets)
  playerEntity.stateName = 'Search Player'
  playerEntity.x = 325
  playerEntity.y = 113

  const transitions = [
    new StateTransition({
      parent: startWork,
      child: startWork,
      name: 'Reload config',
      onTransition: () => botWebsocket.log('Reloading configuration'),
      shouldTransition: () => false
    }),

    new StateTransition({
      parent: start,
      child: startWork,
      name: 'start -> startWork',
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
      parent: playerEntity,
      child: commands,
      name: 'Transfer to sub nestered commands',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: commands,
      child: startWork,
      name: 'Commands finished',
      onTransition: () => bot.look(bot.player.entity.yaw, 0),
      shouldTransition: () => commands.isFinished()
    })
  ]

  function reloadTrigger () {
    transitions[0].trigger()
  }

  function commandTrigger () {
    botWebsocket.log('sendStay')
    transitions[2].trigger()
    transitions[3].trigger()
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
