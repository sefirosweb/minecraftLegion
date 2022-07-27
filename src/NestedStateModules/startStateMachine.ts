import { LegionStateMachineTargets, BotwebsocketAction } from "@/types"
import { Jobs } from "@/types/defaultTypes"
import { Bot, BotEvents } from "mineflayer"
import {
  StateTransition,
  BotStateMachine,
  StateMachineWebserver,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

import { Vec3 } from "vec3"

import debugMode from '@/config'
import mcDataLoader from 'minecraft-data'

module.exports = (bot: Bot) => {
  const botWebsocket = require('@modules/botWebsocket')
  const inventoryViewer = require('mineflayer-web-inventory')
  const prismarineViewer = require('@modules/viewer')


  const mineflayerPathfinder = require('mineflayer-pathfinder')
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
    config: {
      job: Jobs.none,
      allowSprinting: false,
      canDig: false,
      canPlaceBlocks: false,
      canSleep: false,
      canCraftItemWithdrawChest: false,
      minerCords: {
        orientation: "x+",
        reverse: false,
        tunel: "horizontally",
        world: "minecraft:overworld",
        xEnd: 0,
        xStart: 0,
        yEnd: 0,
        yStart: 0,
        zEnd: 0,
        zStart: 0,
      }
    },
    movements: movements,
    chests: {},
    portals: {
      overworld: {
        the_nether: [],
        the_end: []
      },
      the_nether: [],
      the_end: []
    },

    isNight: false,
    triedToSleep: false,

    farmerJob: {
      plantArea: {}
    },

    breederJob: {
      animalsToBeFeed: [],
      breededAnimals: [],
      farmAreas: [],
      farmAnimal: {
        seconds: 60,
        bee: 10,
        cat: 10,
        chicken: 10,
        cow: 10,
        donkey: 10,
        horse: 10,
        llama: 10,
        panda: 10,
        pig: 10,
        rabbit: 10,
        sheep: 10,
        turtles: 10,
        wolf: 10
      },
    },
    minerJob: {
      blockForPlace: [],
      original: undefined,
      mineBlock: new Vec3(0, 0, 0),
      nextLayer: undefined
    },
    sorterJob: {
      emptyChests: []
    }
  }

  let webserver: any

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  // @ts-ignore
  start.x = 125
  // @ts-ignore
  start.y = 113

  const watiState = new BehaviorIdle()
  watiState.stateName = 'Wait Second'
  //@ts-ignore
  watiState.x = 125
  //@ts-ignore
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
            //@ts-ignore
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
  // @ts-ignore
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

  //@ts-ignore
  bot.on('move', (position: any) => {
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

    // @ts-ignore
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
        prismarineViewer.start(bot, value.port)
        botWebsocket.log(`Started viewer web server at http://localhost:${value.port}`)
        break
      case 'startStateMachine':
        if (!webserver || typeof webserver.isServerRunning !== 'function') {
          // @ts-ignore
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
