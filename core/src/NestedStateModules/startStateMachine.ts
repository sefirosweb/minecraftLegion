import { LegionStateMachineTargets, BotwebsocketAction } from "base-types"
import { Bot, BotEvents } from "mineflayer"
import { Vec3 } from "vec3"
import config from '@/config'
import mcDataLoader from 'minecraft-data'
import movementModule from '@/modules/movementModule'
import botWebsocket from '@/modules/botWebsocket'
import mineflayerPathfinder from 'mineflayer-pathfinder'
import { startPrismarineViewer } from '@/modules/viewer'
import DeathFunction from '@/NestedStateModules/deathFunction'
import botConfigLoader from '@/modules/botConfig'
import { StateTransition, BotStateMachine, StateMachineWebserver, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'

// @ts-ignore
import inventoryViewer from 'mineflayer-web-inventory'

const startStateMachine = (bot: Bot) => {
  const botConfig = botConfigLoader(bot.username)
  const { debugMode } = config
  const mcData = mcDataLoader(bot.version)
  const isInDebug = debugMode || false

  // const targets: LegionStateMachineTargets = {
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
  // }

  const movements = new mineflayerPathfinder.Movements(bot, mcData)

  const targets: LegionStateMachineTargets = {
    config: botConfig.defaultConfig,
    movements: movements,
    portals: {
      overworld_to_the_end: [],
      overworld_to_the_nether: [],
      the_end_to_overworld: [],
      the_nether_to_overworld: []
    },

    isNight: false,
    triedToSleep: false,

    breederJob: {
      animalsToBeFeed: [],
      breededAnimals: [],
      farmAreas: [],
      farmAnimalSeconds: botConfig.defaultConfig.farmAnimalSeconds,
      farmAnimal: botConfig.defaultConfig.farmAnimal,
      feedEntity: undefined
    },
    minerJob: {
      blockForPlace: [],
      original: botConfig.defaultConfig.minerCords,
      mineBlock: new Vec3(0, 0, 0),
      nextLayer: undefined
    },
    sorterJob: {
      emptyChests: [],
      correctChests: {},
      slotsToSort: [],
      newChestSort: {},
      newChests: [],
      chest: undefined
    },
    chests: {},
    farmerJob: {
      plantArea: undefined
    }
  }

  let webserver: StateMachineWebserver

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const watiState = new BehaviorIdle()
  watiState.stateName = 'Wait Second'
  watiState.x = 125
  watiState.y = 313

  const death = DeathFunction(bot, targets)
  death.x = 425
  death.y = 213

  const { checkPortalsOnSpawn } = movementModule(bot, targets)

  const transitions = [
    new StateTransition({
      parent: start,
      child: watiState,
      onTransition: () => {
        setTimeout(() => {
          checkPortalsOnSpawn()
          transitions[1].trigger()

          targets.isNight = false
          targets.triedToSleep = false

          bot.on('time', () => {
            const timeOfDay = bot.time.timeOfDay
            const thunderstorm = bot.thunderState > 0
            if (!thunderstorm && !(timeOfDay >= 12541 && timeOfDay <= 23458)) {
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
    bot.stopDigging()
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

  bot.on('physicTick', () => {
    bot.emit('customEventPhysicTick')
  })

  bot.on('chat', (username, message, translate, jsonMsg, matches) => {
    bot.emit('customEventChat', username, message, translate, jsonMsg, matches)
  })

  bot.on('move', (position) => {
    bot.emit('customEventMove', position)
  })

  if (isInDebug) { // Only enable on debug mode

    bot.on('newListener', () => {
      const events = bot.eventNames()
      const eventsToSend: Array<string> = []
      events.forEach(event => {
        const eventName = (typeof event === 'string' ? event : event.toString()) as keyof BotEvents
        eventsToSend.push(`${eventName}: ${bot.listenerCount(eventName)}`)
      })
      botWebsocket.emitEvents(eventsToSend)
    })

    bot.on('removeListener', () => {
      const events = bot.eventNames()
      const eventsToSend: Array<string> = []
      events.forEach(event => {
        const eventName = (typeof event === 'string' ? event : event.toString()) as keyof BotEvents
        eventsToSend.push(`${eventName}: ${bot.listenerCount(eventName)}`)
      })
      botWebsocket.emitEvents(eventsToSend)
    })

    webserver = new StateMachineWebserver(bot, stateMachine, 4550)
    if (!webserver.isServerRunning()) {
      webserver.startServer()
    }

    inventoryViewer(bot, { port: 4540 })
  }

  botWebsocket.on('action', (toBotData: BotwebsocketAction) => {
    const { type, value } = toBotData
    switch (type) {
      case 'startInventory':
        inventoryViewer(bot, { port: value.port })
        botWebsocket.log(`Started inventory web server at http://localhost:${value.port}`)
        break
      case 'startViewer':
        startPrismarineViewer(bot, value.port)
        botWebsocket.log(`Started viewer web server at http://localhost:${value.port}`)
        break
      case 'startStateMachine':
        if (!webserver || typeof webserver.isServerRunning !== 'function') {
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
    bot.once('webSocketLogin', () => {
      getChests()
      getPortals()
    })
  }
}

export default startStateMachine