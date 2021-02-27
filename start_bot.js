const config = require('./config')
const mineflayer = require('mineflayer')
const customEvents = require('./modules/customEvents')
const botWebsocket = require('./modules/botWebsocket')
const inventoryViewer = require('mineflayer-web-inventory')
const prismarineViewer = require('./modules/viewer')

const {
  StateTransition,
  BotStateMachine,
  StateMachineWebserver,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

console.log('Usage : node start_bot.js <botName> <botPassword>')
let botName = process.argv[2]
let botPassword = process.argv[3]

botName = process.argv[4] ? process.argv[4] : process.argv[2] // npm run one botname password
botPassword = process.argv[5] ? process.argv[5] : process.argv[3] // npm run one botname password

createNewBot(botName, botPassword)

function createNewBot (botName, botPassword = '') {
  const bot = mineflayer.createBot({
    username: botName,
    host: config.server,
    port: config.port
  })
  botWebsocket.loadBot(bot)
  bot.setMaxListeners(0)
  bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)

  bot.on('kicked', (reason) => {
    const reasonDecoded = JSON.parse(reason)
    console.log(reasonDecoded)
    process.exit()
  })

  bot.on('error', (error) => {
    botWebsocket.log('Error bot detected ' + JSON.stringify(error))
    console.log(error)
    process.exit()
  })

  bot.once('spawn', () => {
    console.log(bot.version)
    botWebsocket.connect()

    bot.on('physicTick', customEvents.executePhysicTickEvents)
    bot.on('chat', customEvents.executeChatEvents)
    bot.on('move', customEvents.executeMoveEvents)

    bot.on('health', () => {
      botWebsocket.emitHealth(bot.health)
      botWebsocket.emitFood(bot.food)
    })

    botWebsocket.log('Ready!')

    const targets = {}
    const startState = new BehaviorIdle(targets)
    startState.stateName = 'Start'
    startState.x = 125
    startState.y = 113

    const watiState = new BehaviorIdle(targets)
    watiState.stateName = 'Wait Second'
    watiState.x = 125
    watiState.y = 313

    const death = require('./NestedStateModules/deathFunction')(bot, targets)
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

    bot.on('death', function () {
      // Clear custom events when dies
      customEvents.removeAllListeners('physicTick')
      customEvents.removeAllListeners('chat')
      customEvents.removeAllListeners('move')

      botWebsocket.log('trigger death')
      botWebsocket.emitCombat(false)

      setTimeout(() => transitions[2].trigger(), 1000)
    })

    const root = new NestedStateMachine(transitions, startState)
    root.stateName = 'Main'
    const stateMachine = new BotStateMachine(bot, root)

    let webserver = {}

    if (typeof webserver.isServerRunning !== 'function') {
      webserver = new StateMachineWebserver(bot, stateMachine, 4125)
    }
    if (typeof webserver.isServerRunning === 'function') {
      if (!webserver.isServerRunning()) {
        webserver.startServer()
      }
      botWebsocket.log(`Started state machine web server at http://localhost:${4125}`)
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
  })
}
