
module.exports = (bot) => {
  const botWebsocket = require('@modules/botWebsocket')
  const inventoryViewer = require('mineflayer-web-inventory')
  const prismarineViewer = require('@modules/viewer')
  const { debugMode } = require('@config')

  const mineflayerPathfinder = require('mineflayer-pathfinder')
  const mcData = require('minecraft-data')(bot.version)

  const isInDebug = debugMode ? : debugMode : false

  const {
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    BehaviorIdle,
    NestedStateMachine
  } = require('mineflayer-statemachine')

  const targets = {}
  let webserver = {}
  const movements = new mineflayerPathfinder.Movements(bot, mcData)
  targets.movements = movements

  const startState = new BehaviorIdle(targets)
  startState.stateName = 'Start'
  startState.x = 125
  startState.y = 113

  const watiState = new BehaviorIdle(targets)
  watiState.stateName = 'Wait Second'
  watiState.x = 125
  watiState.y = 313

  const death = require('@NestedStateModules/deathFunction')(bot, targets)
  death.x = 425
  death.y = 213

  const transitions = [
    new StateTransition({
      parent: startState,
      child: watiState,
      name: 'idleState -> deathFunction',
      shouldTransition: () => true,
      onTransition: () => {
        console.log('start')
        setTimeout(() => transitions[1].trigger(), 2000)
      }
    }),

    new StateTransition({
      parent: watiState,
      child: death,
      name: 'Wait 1 second for continue'
    }),

    new StateTransition({
      parent: death,
      child: startState,
      name: 'if bot die then restarts'
    })
  ]

  const root = new NestedStateMachine(transitions, startState)
  root.stateName = 'Main'
  const stateMachine = new BotStateMachine(bot, root)

  bot.on('death', function () {
    // Clear custom events when dies
    bot.removeAllListeners('customEventPhysicTick')
    bot.removeAllListeners('customEventChat')
    bot.removeAllListeners('customEventMove')

    botWebsocket.log('trigger death')
    botWebsocket.emitCombat(false)

    setTimeout(() => transitions[2].trigger(), 1000)
  })

  bot.on('health', () => {
    botWebsocket.emitHealth(bot.health)
    botWebsocket.emitFood(bot.food)
  })

  bot.on('physicTick', () => bot.emit('customEventPhysicTick'))
  bot.on('chat', (username, message) => bot.emit('customEventChat', username, message))
  bot.on('move', (position) => bot.emit('customEventMove', position))

  if (isInDebug) { // Only enable on debug mode
    bot.on('newListener', (e, l) => {
      const events = bot.eventNames()
      const eventsToSend = []
      events.forEach(event => {
        eventsToSend.push(`${event}: ${bot.listenerCount(event)}`)
      })
      botWebsocket.emitEvents(eventsToSend)
    })

    bot.on('removeListener', (e, l) => {
      const events = bot.eventNames()
      const eventsToSend = []
      events.forEach(event => {
        eventsToSend.push(`${event}: ${bot.listenerCount(event)}`)
      })
      botWebsocket.emitEvents(eventsToSend)
    })

    webserver = new StateMachineWebserver(bot, stateMachine, 5000) // TODO remove
    if (!webserver.isServerRunning()) {
      webserver.startServer()
    }

    inventoryViewer(bot, { port: 5001 })
  }

  botWebsocket.on('action', toBotData => {
    const { type, value } = toBotData
    switch (type) {
      case 'startInventory':
        inventoryViewer(bot, { port: value.port })
        botWebsocket.log(`Started inventory web server at http://localhost:${value.port}`)
        break
      case 'startViewer':
        prismarineViewer.start(bot, value.port)
        botWebsocket.log(`Started viewer web server at http://localhost:${value.port}`)
        break
      case 'startStateMachine':
        if (typeof webserver.isServerRunning !== 'function') {
          webserver = new StateMachineWebserver(bot, stateMachine, value.port)
        }
        if (typeof webserver.isServerRunning === 'function') {
          if (!webserver.isServerRunning()) {
            webserver.startServer()
          }
          botWebsocket.log(`Started state machine web server at http://localhost:${webserver.port}`)
        }
        break
    }
  })
}
