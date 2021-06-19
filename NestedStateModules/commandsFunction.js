const Vec3 = require('vec3')

const {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  BehaviorLookAtEntity,
  NestedStateMachine
} = require('mineflayer-statemachine')
const botConfig = require('@modules/botConfig')
const botWebsocket = require('@modules/botWebsocket')
const masters = botWebsocket.getMasters()

function commandsFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 350
  exit.y = 250

  const followPlayer = new BehaviorFollowEntity(bot, targets)
  followPlayer.stateName = 'Follow Player'
  followPlayer.x = 125
  followPlayer.y = 313

  const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets)
  lookAtFollowTarget.stateName = 'Look Player'
  lookAtFollowTarget.x = 550
  lookAtFollowTarget.y = 313

  const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets)
  lookAtPlayersState.stateName = 'Stay In Position'
  lookAtPlayersState.x = 350
  lookAtPlayersState.y = 113

  const transitions = [
    new StateTransition({ // 0
      parent: lookAtPlayersState,
      child: exit,
      name: 'Player say: bye'
    }),
    new StateTransition({ // 1
      parent: followPlayer,
      child: exit,
      name: 'Player say: bye'
    }),
    new StateTransition({ // 2
      parent: lookAtFollowTarget,
      child: exit,
      name: 'Player say: bye'
    }),

    new StateTransition({ // 3
      parent: lookAtPlayersState,
      child: followPlayer,
      name: 'Player say: come'
    }),

    new StateTransition({ // 4
      parent: lookAtFollowTarget,
      child: lookAtPlayersState,
      name: 'Player say: stay'
    }),
    new StateTransition({ // 5
      parent: followPlayer,
      child: lookAtPlayersState,
      name: 'Player say: stay'
    }),
    new StateTransition({ // 6
      parent: start,
      child: lookAtPlayersState,
      name: 'Enter to nested',
      onTransition: () => bot.on('customEventChat', botChatCommandFunctionListener),
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

  function stayTrigger () {
    transitions[4].trigger()
    transitions[5].trigger()
  }

  function followTrigger (master) {
    const filter = e => e.type === 'player' &&
      e.username === master &&
      e.mobType !== 'Armor Stand'

    const entity = bot.nearestEntity(filter)

    if (!entity) {
      return
    }

    botWebsocket.log(`Follow to => ${master}`)

    targets.entity = entity
    transitions[3].trigger()
  }

  function endCommandsTrigger () {
    bot.removeListener('customEventChat', botChatCommandFunctionListener)
    transitions[0].trigger()
    transitions[1].trigger()
    transitions[2].trigger()
  }

  botWebsocket.on('action', toBotData => {
    const { type, value } = toBotData

    // Generic variables
    let filter, entity
    switch (type) {
      case 'stay':
        botWebsocket.log('sendStay')
        stayTrigger()
        break
      case 'follow':
        followTrigger(value)
        break
      case 'endCommands':
        endCommandsTrigger()
        break
      case 'interactWithPlayer':
        filter = e => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 3
        entity = bot.nearestEntity(filter)
        if (entity) { bot.useOn(entity) }
        break
      case 'interactWithBed':
        findBed()
        break
      case 'tossAllItems':
        dropAll()
        break
      case 'moveOneByOne':
        moveTo(value)
        break
      case 'sendMessage':
        bot.chat(value)
        botWebsocket.log(value)
        break
    }
  })

  const moveTo = (to) => {
    const mineflayerPathfinder = require('mineflayer-pathfinder')
    const mcData = require('minecraft-data')(bot.version)

    const pathfinder = bot.pathfinder

    let x = bot.entity.position.x
    let y = bot.entity.position.y
    let z = bot.entity.position.z

    if (to === 'x+') {
      x++
    }

    if (to === 'x-') {
      x--
    }

    if (to === 'z+') {
      z++
    }
    if (to === 'z-') {
      z--
    }

    const airblocks = ['air', 'cave_air']
    const frontBlock = bot.blockAt(new Vec3(x, y, z))
    const upBlock = bot.blockAt(new Vec3(x, y + 1, z))
    const downBlock = bot.blockAt(new Vec3(x, y - 1, z))

    if (!airblocks.includes(frontBlock.name) && airblocks.includes(upBlock.name)) {
      y++
    } else if (airblocks.includes(frontBlock.name) && airblocks.includes(downBlock.name)) {
      y--
    }

    const goal = new mineflayerPathfinder.goals.GoalBlock(x, y, z)

    const movements = new mineflayerPathfinder.Movements(bot, mcData)
    pathfinder.setMovements(movements)
    pathfinder.setGoal(goal)
  }

  function botChatCommandFunctionListener (username, message) {
    const findMaster = masters.find(e => e.name === username)

    if (findMaster === undefined) {
      // botWebsocket.log(`${username} is no in master list!`)
      return
    }

    let msg
    switch (true) {
      case (message === 'bye'):
        endCommandsTrigger()
        break
      case (message === 'come'):
        followTrigger(findMaster.name)
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

        if (message.match(/set help.*/)) {
          msg = message.split(' ')
          saveHelp(msg[2])
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

        if (message.match(/set miner.*/)) {
          msg = message.split(' ')
          saveMiner(msg)
        }

        if (message.match(/drop all.*/)) {
          dropAll()
        }

        if (message.match(/find bed.*/)) {
          findBed()
        }
    }
  }

  let patrol = []

  function saveMiner (coords) {
    if (coords.length !== 10) {
      // bot.chat('The coords is wrong')
      return false
    }
    const minerCoords = {}
    minerCoords.xStart = coords['2']
    minerCoords.yStart = coords['3']
    minerCoords.zStart = coords['4']
    minerCoords.xEnd = coords['5']
    minerCoords.yEnd = coords['6']
    minerCoords.zEnd = coords['7']
    minerCoords.orientation = coords['8'] // x+ || x- || z+ || z-
    minerCoords.tunel = coords['9'] // vertically || horizontally

    botWebsocket.log('Point: ' + JSON.stringify(minerCoords))
    botConfig.setMinerCords(bot.username, minerCoords)
    // bot.chat('Lets made a tunel!')
  }

  function dropAll () {
    const excludedItems = ['fishing_rod']
    const item = bot.inventory.items().find(item => !excludedItems.includes(item.name))
    if (item) {
      bot.tossStack(item)
        .then(() => {
          setTimeout(dropAll)
        })
        .catch(err => {
          console.log(err)
          setTimeout(dropAll, 100)
        })
    }
  }

  async function findBed () {
    const bed = bot.findBlock({
      matching: block => bot.isABed(block),
      maxDistance: 3
    })

    const isSleeping = () => {
      botWebsocket.log('Set new bed point')
      bot.removeListener('sleep', isSleeping)
      setTimeout(() => {
        bot.wake()
      }, 500)
    }

    bot.on('sleep', isSleeping)

    try {
      if (bed) {
        await bot.activateBlock(bed)
      } else {
        botWebsocket.log('No nearby bed')
      }
    } catch (err) {
      botWebsocket.log(err.message)
      bot.removeListener('sleep', isSleeping)
    }
  }

  function saveJob (job) {
    switch (true) {
      case (job === 'guard'):
      case (job === 'archer'):
      case (job === 'farmer'):
      case (job === 'miner'):
        // bot.chat('I will fulfill this job')
        botConfig.setJob(bot.username, job)
        break
      default:
        // bot.chat("Master, I don't know how to do this job")
        break
    }
  }

  function saveMode (mode) {
    switch (true) {
      case (mode === 'none'):
      case (mode === 'pvp'):
      case (mode === 'pve'):
        // bot.chat('I understood the conflict')
        botConfig.setMode(bot.username, mode)
        break
      default:
        // bot.chat("Master, I don't know what you means mode")
        break
    }
  }

  function saveHelp (mode) {
    switch (true) {
      case (mode === 'true'):
        // bot.chat('I will defend my friends')
        botConfig.setHelpFriend(bot.username, true)
        break
      case (mode === 'false'):
        // bot.chat('Its ok for my friends')
        botConfig.setHelpFriend(bot.username, false)
        break
      default:
        // bot.chat("Master, I don't know friends say")
        break
    }
  }

  function saveDistance (distance) {
    distance = parseInt(distance)
    if (!isNaN(distance)) {
      // bot.chat('I take a look!')
      botConfig.setDistance(bot.username, distance)
    } else {
      // bot.chat('I dont understood the distance')
    }
  }

  let prevPoint
  let distancePatrol

  function nextPointListener (point) {
    if (point.distanceTo(prevPoint) > distancePatrol) {
      patrol.push(point)
      prevPoint = point
      botWebsocket.log('Point: ' + JSON.stringify(point))
    }
  }

  function startGetPoints (distance = 2) {
    distance = parseInt(distance)
    if (isNaN(distance)) {
      // bot.chat('I dont understood the distance')
      return false
    }
    // bot.chat('Ok, tell me the way')

    distancePatrol = distance

    const point = bot.entity.position
    patrol = []
    patrol.push(point)
    prevPoint = point
    botWebsocket.log('Point: ' + JSON.stringify(point))

    bot.on('customEventMove', nextPointListener)
  }

  function savePatrol () {
    bot.removeListener('customEventMove', nextPointListener)
    botConfig.setPatrol(bot.username, patrol)
    // bot.chat('Ok, I memorized the patrol')
  }

  const commandsFunction = new NestedStateMachine(transitions, start, exit)
  commandsFunction.stateName = 'Commands Bot'
  return commandsFunction
}

module.exports = commandsFunction
