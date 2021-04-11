const mineflayer = require('mineflayer')
const vec3 = require('vec3')

if (process.argv.length < 3 || process.argv.length > 6) {
  console.log('Usage : node digger.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
  username: process.argv[4] ? process.argv[4] : 'eventListener',
  password: process.argv[5]
})

bot.once('spawn', () => {
  bot.chat('Hello world!')
  bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)
  const {
    StateTransition,
    NestedStateMachine,
    StateMachineWebserver,
    BotStateMachine,
    BehaviorIdle,
    BehaviorMoveTo
  } = require('mineflayer-statemachine')
  const targets = {}

  const startState = new BehaviorIdle(targets)
  startState.stateName = 'Start'

  const position1 = new BehaviorMoveTo(bot, targets)
  position1.name = 'position1'

  const position2 = new BehaviorMoveTo(bot, targets)
  position2.name = 'position2'

  const position3 = new BehaviorMoveTo(bot, targets)
  position3.name = 'position3'

  const position4 = new BehaviorMoveTo(bot, targets)
  position4.name = 'position4'

  const transitions = [
    new StateTransition({
      parent: startState,
      child: position1,
      onTransition: () => {
        targets.position = vec3(185, 63, 110)
      },
      shouldTransition: () => true
    }),
    new StateTransition({
      parent: position1,
      child: position2,
      onTransition: () => {
        targets.position = vec3(180, 63, 110)
      },
      shouldTransition: () => position1.isFinished()
    }),

    new StateTransition({
      parent: position2,
      child: position3,
      onTransition: () => {
        targets.position = vec3(180, 63, 105)
      },
      shouldTransition: () => position2.isFinished()
    }),
    new StateTransition({
      parent: position3,
      child: position4,
      onTransition: () => {
        targets.position = vec3(185, 63, 105)
      },
      shouldTransition: () => position3.isFinished()
    }),
    new StateTransition({
      parent: position4,
      child: position1,
      onTransition: () => {
        targets.position = vec3(185, 63, 110)
      },
      shouldTransition: () => position4.isFinished()
    })
  ]

  const root = new NestedStateMachine(transitions, startState)
  root.stateName = 'Main'
  const stateMachine = new BotStateMachine(bot, root)
  const webserver = new StateMachineWebserver(bot, stateMachine, 5000)
  if (!webserver.isServerRunning()) {
    webserver.startServer()
  }
})
