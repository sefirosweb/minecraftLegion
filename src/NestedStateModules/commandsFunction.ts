import { Vec3 } from 'vec3'

import {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  BehaviorLookAtEntity,
  NestedStateMachine
} from 'mineflayer-statemachine'

//@ts-ignore
import botConfig from '@modules/botConfig'
//@ts-ignore
import botWebsocket from '@modules/botWebsocket'
import { Bot } from 'mineflayer'
import { BotwebsocketAction, Coordinates, LegionStateMachineTargets, Master } from '@/types'
import { Entity } from 'prismarine-entity'
import mineflayerPathfinder from 'mineflayer-pathfinder'


function commandsFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 350
  //@ts-ignore
  exit.y = 250

  //@ts-ignore
  const followPlayer = new BehaviorFollowEntity(bot, targets)
  followPlayer.stateName = 'Follow Player'
  //@ts-ignore
  followPlayer.x = 125
  //@ts-ignore
  followPlayer.y = 313
  //@ts-ignore
  followPlayer.movements = targets.movements

  //@ts-ignore
  const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets)
  lookAtFollowTarget.stateName = 'Look Player'
  //@ts-ignore
  lookAtFollowTarget.x = 550
  //@ts-ignore
  lookAtFollowTarget.y = 313

  //@ts-ignore
  const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets)
  lookAtPlayersState.stateName = 'Stay In Position'
  //@ts-ignore
  lookAtPlayersState.x = 350
  //@ts-ignore
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
      onTransition: () => {
        bot.stopDigging()
        bot.wake()
          .catch(() => { })
        bot.on('customEventChat', botChatCommandFunctionListener)
      },
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

  function followTrigger(master: string) {

    const filter = (e: Entity) => e.type === 'player' &&
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

  function endCommandsTrigger() {
    bot.removeListener('customEventChat', botChatCommandFunctionListener)
    transitions[0].trigger()
    transitions[1].trigger()
    transitions[2].trigger()
    targets.entity = undefined
  }

  botWebsocket.on('action', (toBotData: BotwebsocketAction) => {
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
        filter = (e: Entity) => e.type === 'player' && e.position.distanceTo(bot.entity.position) < 3
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

  const moveTo = (to: Coordinates) => {

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

    if (frontBlock && upBlock && !airblocks.includes(frontBlock.name) && airblocks.includes(upBlock.name)) {
      y++
    } else if (frontBlock && downBlock && airblocks.includes(frontBlock.name) && airblocks.includes(downBlock.name)) {
      y--
    }

    const goal = new mineflayerPathfinder.goals.GoalBlock(x, y, z)

    pathfinder.setMovements(targets.movements)
    pathfinder.setGoal(goal)
  }

  function botChatCommandFunctionListener(username: string, message: string) {
    const masters = botWebsocket.getMasters() as Master[] // TODO this is a hotfix
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
      case (message === 'pos'):
        bot.chat(bot.game.dimension + ' ' + bot.entity.position.floored().toString())
        break
      default:
        if (message.match(/set start way.*/)) {
          msg = message.split(' ')
          startGetPoints(msg[3])
        }

        if (message.match(/drop all.*/)) {
          dropAll()
        }

        if (message.match(/find bed.*/)) {
          findBed()
        }
    }
  }

  let patrol: Array<Vec3> = []

  function dropAll() {
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

  async function findBed() {
    const bed = bot.findBlock({
      //@ts-ignore
      matching: block => bot.isABed(block),
      maxDistance: 3
    })

    const isSleeping = () => {
      botWebsocket.log('Set new bed point')
      bot.removeListener('sleep', isSleeping)
      setTimeout(() => {
        bot.wake()
          .catch(e => console.log(e))
      }, 500)
    }

    bot.on('sleep', isSleeping)

    try {
      if (bed) {
        await bot.activateBlock(bed)
      } else {
        botWebsocket.log('No nearby bed')
      }
    } catch (err: any) {
      botWebsocket.log(err.message)
      bot.removeListener('sleep', isSleeping)
    }
  }

  let prevPoint: Vec3
  let distancePatrol: number

  function nextPointListener(point: Vec3) {
    if (point.distanceTo(prevPoint) > distancePatrol) {
      patrol.push(point)
      prevPoint = point
      botWebsocket.log('Point: ' + JSON.stringify(point))
    }
  }

  function startGetPoints(distance: string | number = 2) {
    distancePatrol = typeof distance === "string" ? parseInt(distance) : distance

    if (isNaN(distancePatrol)) {
      // bot.chat('I dont understood the distance')
      return false
    }
    // bot.chat('Ok, tell me the way')

    const point = bot.entity.position
    patrol = []
    patrol.push(point)
    prevPoint = point
    botWebsocket.log('Point: ' + JSON.stringify(point))

    bot.on('customEventMove', nextPointListener)
  }

  function savePatrol() {
    bot.removeListener('customEventMove', nextPointListener)
    botConfig.setPatrol(bot.username, patrol)
    // bot.chat('Ok, I memorized the patrol')
  }

  const commandsFunction = new NestedStateMachine(transitions, start, exit)
  commandsFunction.stateName = 'Commands Bot'
  return commandsFunction
}

module.exports = commandsFunction
