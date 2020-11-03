const {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  BehaviorLookAtEntity,
  NestedStateMachine
} = require('mineflayer-statemachine')
const botConfig = require('../modules/botConfig')
const botWebsocket = require('../modules/botWebsocket')
const customEvents = require('../modules/customEvents')

function commandsFunction(bot, targets) {
  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'

  const followPlayer = new BehaviorFollowEntity(bot, targets)
  followPlayer.stateName = 'Follow Player'

  const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets)
  lookAtFollowTarget.stateName = 'Look Player'

  const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets)
  lookAtPlayersState.stateName = 'Stay In Position'

  const transitions = [
    new StateTransition({ // 0
      parent: lookAtPlayersState,
      child: exit,
      name: 'Player say: bye',
      onTransition: () => bot.chat('Bye Master!')
    }),
    new StateTransition({ // 1
      parent: followPlayer,
      child: exit,
      name: 'Player say: bye',
      onTransition: () => bot.chat('Bye Master!')
    }),
    new StateTransition({ // 2
      parent: lookAtFollowTarget,
      child: exit,
      name: 'Player say: bye',
      onTransition: () => bot.chat('Bye Master!')
    }),

    new StateTransition({ // 3
      parent: lookAtPlayersState,
      child: followPlayer,
      name: 'Player say: come',
      onTransition: () => bot.chat('Yes sr!')
    }),

    new StateTransition({ // 4
      parent: lookAtFollowTarget,
      child: lookAtPlayersState,
      name: 'Player say: stay',
      onTransition: () => bot.chat('I wait here!')
    }),
    new StateTransition({ // 5
      parent: followPlayer,
      child: lookAtPlayersState,
      name: 'Player say: stay',
      onTransition: () => bot.chat('I wait here!')
    }),
    new StateTransition({ // 6
      parent: enter,
      child: lookAtPlayersState,
      name: 'Enter to nested',
      onTransition: () => customEvents.addEvent('chat', botChatCommandFunctionListener),
      shouldTransition: () => true
    }),
    new StateTransition({
      parent: followPlayer,
      child: lookAtFollowTarget,
      name: 'The player is too far',
      shouldTransition: () => followPlayer.distanceToTarget() < 2
    }),
    new StateTransition({
      parent: lookAtFollowTarget,
      child: followPlayer,
      name: 'The player is too close',
      shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2
    })
  ]


  function stayTrigger() {
    transitions[4].trigger()
    transitions[5].trigger()
  }

  function followTrigger() {
    transitions[3].trigger()
  }

  function endCommandsTrigger() {
    customEvents.removeListener('chat', botChatCommandFunctionListener)
    transitions[0].trigger()
    transitions[1].trigger()
    transitions[2].trigger()
  }

  botWebsocket.on('sendStay', () => {
    botWebsocket.log('sendStay')
    stayTrigger()
  })

  botWebsocket.on('sendFollow', () => {
    botWebsocket.log('sendFollow')
    followTrigger()
  })

  botWebsocket.on('sendEndCommands', () => {
    botWebsocket.log('sendEndCommands')
    endCommandsTrigger()
  })

  botWebsocket.on('sendStartWay', () => {
    botWebsocket.log('sendStartWay')
    startGetPoints()
  })

  botWebsocket.on('sendSavePatrol', () => {
    botWebsocket.log('sendSavePatrol')
    savePatrol()
  })

  botWebsocket.on('sendSaveChest', (chestName) => {
    botWebsocket.log('sendSaveChest')
    saveChest(chestName)
  })

  function botChatCommandFunctionListener(username, message) {
    let msg
    switch (true) {
      case (message === 'bye'):
        endCommandsTrigger()
        break
      case (message === 'come'):
        followTrigger();
        break
      case (message === 'stay'):
        stayTrigger()
        break
      default:
        if (message.match(/set job.*/)) {
          msg = message.split(' ')
          saveJob(msg[2])
        }

        if (message.match(/set mode.*/)) {
          msg = message.split(' ')
          saveMode(msg[2])
        }

        if (message.match(/set distance.*/)) {
          msg = message.split(' ')
          saveDistance(msg[2])
        }

        if (message.match(/set start way.*/)) {
          msg = message.split(' ')
          startGetPoints(msg[3])
        }

        if (message.match(/set save patrol.*/)) {
          savePatrol()
        }

        if (message.match(/set save chest.*/)) {
          msg = message.split(' ')
          saveChest(msg[3])
        }
    }
  }

  let patrol = []

  function saveJob(job) {
    switch (true) {
      case (job === 'guard'):
      case (job === 'archer'):
      case (job === 'farmer'):
        bot.chat('I will fulfill this job')
        botConfig.setJob(bot.username, job)
        break
      default:
        bot.chat("Master, I don't know how to do this job")
        break
    }
  }

  function saveMode(mode) {
    switch (true) {
      case (mode === 'none'):
      case (mode === 'pvp'):
      case (mode === 'pve'):
        bot.chat('I understood the conflict')
        botConfig.setMode(bot.username, mode)
        break
      default:
        bot.chat("Master, I don't know what you means mode")
        break
    }
  }

  function saveDistance(distance) {
    distance = parseInt(distance)
    if (!isNaN(distance)) {
      bot.chat('I take a look!')
      botConfig.setDistance(bot.username, distance)
    } else {
      bot.chat('I dont understood the distance')
    }
  }

  let prevPoint
  let distancePatrol

  function nextPointListener(point) {
    if (point.distanceTo(prevPoint) > distancePatrol) {
      patrol.push(point)
      prevPoint = point
      botWebsocket.log('Point: ' + JSON.stringify(point))
    }
  }

  function startGetPoints(distance = 2) {
    distance = parseInt(distance)
    if (isNaN(distance)) {
      bot.chat('I dont understood the distance')
      return false
    }
    bot.chat('Ok, tell me the way')

    distancePatrol = distance

    const point = bot.entity.position
    patrol = []
    patrol.push(point)
    prevPoint = point
    botWebsocket.log('Point: ' + JSON.stringify(point))

    customEvents.addEvent('move', nextPointListener)
  }

  function savePatrol() {
    customEvents.removeListener('move', nextPointListener)
    botConfig.setPatrol(bot.username, patrol)
    bot.chat('Ok, I memorized the patrol')
  }

  function saveChest(chestName) {
    const permitedChests = ['food', 'equipment', 'deposit']
    if (!permitedChests.includes(chestName)) {
      bot.chat(`I don't know what chest is it`)
      return
    }
    customEvents.removeListener('move', nextPointListener)
    botConfig.setChest(bot.username, patrol, chestName)
    bot.chat('Oooh my treasure')
  }

  const commandsFunction = new NestedStateMachine(transitions, enter, exit)
  commandsFunction.stateName = 'Commands Bot'
  return commandsFunction
}

module.exports = commandsFunction
