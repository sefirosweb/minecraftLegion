
module.exports = (bot) => {
  const botWebsocket = require('@modules/botWebsocket')
  const inventoryViewer = require('mineflayer-web-inventory')
  const prismarineViewer = require('@modules/viewer')
  const { debugMode } = require('@config')

  const mineflayerPathfinder = require('mineflayer-pathfinder')
  const mcData = require('minecraft-data')(bot.version)

  const isInDebug = debugMode || false

  const {
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    BehaviorIdle,
    NestedStateMachine
  } = require('mineflayer-statemachine')

  const targets = {
    // aListener: function (object, val) {
    //   if (!debugMode) return
    //   console.log(`Detected change ${object} value:`, val)
    // },

    // set position (val) {
    //   this.positionVal = val
    //   this.aListener('position', val)
    // },
    // get position () {
    //   return this.positionVal
    // },

    // set entity (val) {
    //   this.entityVal = val
    //   this.aListener('entity', val)
    // },
    // get entity () {
    //   return this.entityVal
    // },

    // set item (val) {
    //   this.itemVal = val
    //   this.aListener('item', val)
    // },
    // get item () {
    //   return this.itemVal
    // }
  }

  let webserver = {}
  const movements = new mineflayerPathfinder.Movements(bot, mcData)
  targets.movements = movements
  targets.chests = {}
  targets.portals = {
    overworld: {
      the_nether: [],
      the_end: []
    },
    the_nether: [],
    the_end: []
  };

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const watiState = new BehaviorIdle(targets)
  watiState.stateName = 'Wait Second'
  watiState.x = 125
  watiState.y = 313

  const death = require('@NestedStateModules/deathFunction')(bot, targets)
  death.x = 425
  death.y = 213

  const { checkPortalsOnSpawn } = require('@modules/movementModule')(bot, targets)

  const transitions = [
    new StateTransition({
      parent: start,
      child: watiState,
      onTransition: () => {
        console.log('start')
        setTimeout(() => {
          checkPortalsOnSpawn()
          transitions[1].trigger()

          targets.isNight = false
          targets.triedToSleep = false

          bot.on('time', () => {
            const timeOfDay = bot.time.timeOfDay

            if ((timeOfDay >= 100 && timeOfDay <= 12040)) {
              targets.isNight = false
              if (targets.triedToSleep) {
                targets.triedToSleep = false
              }
            } else {
              targets.isNight = true
            }
          })

        }, 2000)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: watiState,
      child: death,
      name: 'Wait 1 second for continue'
    }),

    new StateTransition({
      parent: death,
      child: start,
      onTransition: () => {
        bot.removeAllListeners('time')
      },
      name: 'if bot die then restarts'
    })
  ]

  const root = new NestedStateMachine(transitions, start)
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


  bot.on('spawn', () => {
    checkPortalsOnSpawn()
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

    webserver = new StateMachineWebserver(bot, stateMachine, 4550)
    if (!webserver.isServerRunning()) {
      webserver.startServer()
    }

    inventoryViewer(bot, { port: 4540 })
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
      case 'getChests':
        targets.chests = value
        break
      case 'getPortals':
        targets.portals = value
        break
    }
  })

  function getChests() {
    botWebsocket.emit('sendAction', {
      action: 'getChests',
      value: ''
    })
  }

  function getPortals() {
    botWebsocket.emit('sendAction', {
      action: 'getPortals',
      value: ''
    })
  }

  if (botWebsocket.getLoged()) {
    getChests()
    getPortals()
  } else {
    bot.once('webSocketLogin', function () {
      getChests()
      getPortals()
    })
  }
}
