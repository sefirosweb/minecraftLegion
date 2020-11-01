const config = require('./config')
const mineflayer = require('mineflayer')
const customEvents = require('./modules/customEvents')
const botWebsocket = require('./modules/botWebsocket')

const {
  StateTransition,
  BotStateMachine,
  StateMachineWebserver,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

console.log('Usage : node start_bot.js <botName> <botPassword>')
const botName = process.argv[2]
const botPassword = process.argv[3]

createNewBot(botName, botPassword)

function createNewBot(botName, botPassword = '') {
  const bot = mineflayer.createBot({
    username: botName,
    host: config.server,
    port: config.port
  })
  bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)
  botWebsocket.connect(bot.username)

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
    bot.on('physicTick', customEvents.executePhysicTickEvents)
    bot.on('chat', customEvents.executeChatEvents)
    bot.on('move', customEvents.executeMoveEvents)

    bot.on('health', () => {
      botWebsocket.emitHealth(bot.health)
      botWebsocket.emitFood(bot.food)
    })

    botWebsocket.on('sendMessage', (message) => {
      bot.chat(message)
      botWebsocket.log(message)
    })

    botWebsocket.log('Ready!')

    let inventoryViewer = {}
    botWebsocket.on('startInventory', (message) => {
      if (typeof inventoryViewer !== "function") {
        inventoryViewer = require('mineflayer-web-inventory')
        inventoryViewer(bot, { port: message.port })
        botWebsocket.log(`Started inventory web server at http://localhost:${message.port}`);
      }
    })

    let prismarineViewer = {}
    botWebsocket.on('startViewer', (message) => {
      if (typeof prismarineViewer !== "function") {
        const prismarineViewer = require('./modules/viewer')
        prismarineViewer.start(bot, message.port)
        botWebsocket.log(`Started viewer web server at http://localhost:${message.port}`);
      }
    })


    const targets = {}
    const startState = new BehaviorIdle(targets)
    startState.stateName = 'Start'
    const watiState = new BehaviorIdle(targets)
    watiState.stateName = 'Wait Second'
    const death = require('./NestedStateModules/deathFunction')(bot, targets)

    const transitions = [
      new StateTransition({
        parent: startState,
        child: watiState,
        name: 'idleState -> deathFunction',
        shouldTransition: () => true,
        onTransition: () => {
          console.log("start")
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
    root.stateName = 'main'
    const stateMachine = new BotStateMachine(bot, root)

    let webserver = {}
    botWebsocket.on('startStateMachine', (message) => {
      if (typeof webserver.isServerRunning !== "function") {
        webserver = new StateMachineWebserver(bot, stateMachine, message.port)
      }
      if (typeof webserver.isServerRunning === "function") {
        if (!webserver.isServerRunning()) {
          webserver.startServer()
        }
        botWebsocket.log(`Started state machine web server at http://localhost:${webserver.port}`);
      }
    })

  })
}
