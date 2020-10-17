const config = require('./config')
const mineflayer = require('mineflayer')

const {
  StateTransition,
  BotStateMachine,
  StateMachineWebserver,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

if (process.argv.length < 3 || process.argv.length > 4) {
  console.log('Usage : node block_entity.js <botName> <portBotStateMachine> <portPrismarineViewer> <portInventory>')
  createNewBot('Guard1')
} else {
  const botName = process.argv[2]
  const portBotStateMachine = process.argv[3] ? process.argv[3] : null
  const portPrismarineViewer = process.argv[4] ? process.argv[4] : null
  const portInventory = process.argv[6] ? process.argv[5] : null
  createNewBot(botName, portBotStateMachine, portPrismarineViewer, portInventory)
}

function createNewBot (botName, portBotStateMachine = null, portPrismarineViewer = null, portInventory = null) {
  const bot = mineflayer.createBot({
    username: botName,
    host: config.server,
    port: config.port
  })
  bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)
  bot.on('kicked', (reason) => {
    reasonDecoded = JSON.parse(reason)
    console.log(reasonDecoded)
    process.exit()
  })
  bot.on('error', (err) => {
    console.log(err)
    process.exit()
  })
  bot.once('spawn', () => {
    bot.chat('Im in!')
    if (portInventory !== null) {
      const inventoryViewer = require('mineflayer-web-inventory')
      inventoryViewer(bot, { port: portInventory })
    }
    if (portPrismarineViewer !== null) {
      const prismarineViewer = require('./modules/viewer')
      prismarineViewer.start(bot, portPrismarineViewer)
    }

    const targets = {}
    const idleState = new BehaviorIdle(targets)
    idleState.stateName = 'Start'
    const death = require('./NestedStateModules/deathFunction')(bot, targets)

    const transitions = [
      new StateTransition({
        parent: idleState,
        child: death,
        name: 'idleState -> deathFunction',
        shouldTransition: () => true
      }),

      new StateTransition({
        parent: death,
        child: idleState,
        name: 'if bot die then restarts'
      })
    ]

    bot.on('death', function () {
      bot.chat('Omg im dead')

      bot.removeListener('chat', botChatCommandFunctionListener)

      try {
        bot.removeListener('move', nextPointListener)
      } catch (e) {}

      try {
        bot.removeListener('physicTick', getGrades)
      } catch (e) {}

      transitions[1].trigger()
    })

    const root = new NestedStateMachine(transitions, idleState)
    root.stateName = 'main'
    const stateMachine = new BotStateMachine(bot, root)

    if (portBotStateMachine !== null) {
      const webserver = new StateMachineWebserver(bot, stateMachine, portBotStateMachine)
      webserver.startServer()
    }
  })
}
