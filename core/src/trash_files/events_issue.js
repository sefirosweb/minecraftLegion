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
class CustomBehavior {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'customBehavior'
  }

  onStateEntered () {
    // bot.on('customEvent', this.testEvent)
  }

  testEvent () {
    console.log('hello im a event')
  }

  onStateExited () {
    // console.log('before', bot.listenerCount('customEvent'))

    // I don't recomend use removeAllListeners, because you can remove "all events" of example "chat" or something important..
    // bot.removeAllListeners('customEvent')

    // bot.removeListener('customEvent', this.testEvent)
    // console.log('after', bot.listenerCount('path_update'))
  }

  isFinished () {
    return this.isEndFinished
  }
}

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
  } = require('minecraftlegion-statemachine')
  const targets = {}

  function walkFunction (bot, targets) {
    const customBehavior = new CustomBehavior(bot, targets)
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
        child: customBehavior,
        onTransition: () => {
          targets.position = vec3(185, 63, 110)
        },
        shouldTransition: () => position4.isFinished()
      }),
      new StateTransition({
        parent: customBehavior,
        child: position1,
        shouldTransition: () => true
      })

    ]

    const walkFunction = new NestedStateMachine(transitions, startState)
    walkFunction.stateName = 'walkFunction'
    return walkFunction
  }

  const startState = new BehaviorIdle(targets)
  startState.stateName = 'Start'

  const stop = new BehaviorIdle(targets)
  stop.stateName = 'stop'

  const walk = walkFunction(bot, targets)
  walk.stateName = 'walk'

  const transitions = [
    new StateTransition({
      parent: startState,
      child: walk,
      shouldTransition: () => true
    }),
    new StateTransition({
      parent: startState,
      child: stop,
      onTransition: () => {
        const events = bot.eventNames()
        console.log(`${Date.now()} Events:`)
        events.forEach(event => {
          if (event === 'path_update' || event === 'goal_reached') {
            // @ts-expect-error
            console.log(`${Date.now()} ${event}: ${bot.listenerCount(event)}`)
          }
        })
      },
      shouldTransition: () => false
    }),
    new StateTransition({
      parent: walk,
      child: stop,
      onTransition: () => {
        const events = bot.eventNames()
        console.log(`${Date.now()} Events:`)
        events.forEach(event => {
          if (event === 'path_update' || event === 'goal_reached') {
            // @ts-expect-error
            console.log(`${Date.now()} ${event}: ${bot.listenerCount(event)}`)
          }
        })
      },
      shouldTransition: () => false
    }),
    new StateTransition({
      parent: stop,
      child: walk,
      onTransition: () => {
        const events = bot.eventNames()
        console.log(`${Date.now()} Events:`)
        events.forEach(event => {
          if (event === 'path_update' || event === 'goal_reached') {
            // @ts-expect-error
            console.log(`${Date.now()} ${event}: ${bot.listenerCount(event)}`)
          }
        })
      },
      shouldTransition: () => false
    })
  ]

  const root = new NestedStateMachine(transitions, startState)
  root.stateName = 'Main'
  const stateMachine = new BotStateMachine(bot, root)
  const webserver = new StateMachineWebserver(bot, stateMachine, 5000)
  if (!webserver.isServerRunning()) {
    webserver.startServer()
  }

  bot.on('chat', (player, message) => {
    if (message === 'hi all') {
      transitions[1].trigger()
      transitions[2].trigger()
    }
    if (message === 'bye') {
      transitions[3].trigger()
    }
  })
})
