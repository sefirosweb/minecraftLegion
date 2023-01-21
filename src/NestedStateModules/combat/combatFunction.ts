import { StateTransition, BehaviorIdle, NestedStateMachine, BehaviorFollowEntity } from 'mineflayer-statemachine'
import BehaviorAttack from '@/BehaviorModules/combat/BehaviorAttack'
import BehaviorLongAttack from '@/BehaviorModules/combat/BehaviorLongAttack'
import { Bot, fakeVec3, LegionStateMachineTargets, ShotDirection } from '@/types'
import { Entity } from 'prismarine-entity'
import mcDataLoader from 'minecraft-data'
import inventoryModule from '@/modules/inventoryModule'
import getClosestEnemy from '@/modules/getClosestEnemy'
import botWebsocket from '@/modules/botWebsocket'
import mineflayerPathfinder from 'mineflayer-pathfinder'

//@ts-ignore
import hawkEye from 'minecrafthawkeye'

function combatFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const inventory = inventoryModule(bot)
  const { ignoreMobs, flyingMobs } = getClosestEnemy(bot, targets)
  bot.loadPlugin(hawkEye)

  const mcData = mcDataLoader(bot.version)
  const movements = new mineflayerPathfinder.Movements(bot, mcData)

  const movementsForFliyingMobs = new mineflayerPathfinder.Movements(bot, mcData)
  movementsForFliyingMobs.canDig = false
  movementsForFliyingMobs.allow1by1towers = false
  movementsForFliyingMobs.scafoldingBlocks = []

  const rangoBow = 120 // Todo configurable
  const rangeSword = 3
  const rangeFollowToShortAttack = 5
  const timeBowCountdown = 1550

  const timeMobCountdown = 7500
  let newTimeMobCountdown: number

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 575
  //@ts-ignore
  exit.y = 263

  const attack = new BehaviorAttack(bot, targets)
  attack.stateName = 'Attack'
  attack.x = 325
  attack.y = 263

  const longRangeAttack = new BehaviorLongAttack(bot, targets)
  longRangeAttack.stateName = 'Long Range Attack'
  longRangeAttack.x = 725
  longRangeAttack.y = 413


  //@ts-ignore
  const followMob = new BehaviorFollowEntity(bot, targets)
  followMob.stateName = 'Follow Enemy'
  //@ts-ignore
  followMob.x = 725
  //@ts-ignore
  followMob.y = 113

  let targetGrade: ShotDirection | undefined
  const prevPlayerPositions: Array<fakeVec3> = []
  let bowCountdown = Date.now() // Used for avoid bugs on jam between bow and sword
  let newTargetColdDown = Date.now()

  const filter = (e: Entity) =>
    e.mobType !== undefined &&
    e.type === 'mob' &&
    e.position.distanceTo(bot.entity.position) < 10 &&
    e.mobType !== 'Armor Stand' &&
    e.kind !== 'Passive mobs' &&
    e.isValid &&
    !ignoreMobs.includes(e.mobType)

  const getGrades = function () {
    // Of other enemies aproax, change target (Ex clipper)
    if (Date.now() - newTargetColdDown > 1000) {
      const entity = bot.nearestEntity(filter)
      if (entity) {
        botWebsocket.log('Change Target => ' + entity.mobType + ' ' + JSON.stringify(entity.position))
        targets.entity = entity
        newTargetColdDown = Date.now()
      }
    }

    if (Date.now() - bowCountdown < timeBowCountdown) {
      longRangeAttack.setInfoShot(undefined)
      return
    }

    if (!targets.entity || targets.entity === undefined) {
      longRangeAttack.setInfoShot(undefined)
      return
    }

    if (prevPlayerPositions.length > 10) {
      prevPlayerPositions.shift()
    }
    const position = {
      x: targets.entity.position.x,
      y: targets.entity.position.y,
      z: targets.entity.position.z
    }
    prevPlayerPositions.push(position)

    const speed = {
      x: 0,
      y: 0,
      z: 0
    }

    for (let i = 1; i < prevPlayerPositions.length; i++) {
      const pos = prevPlayerPositions[i]
      const prevPos = prevPlayerPositions[i - 1]
      speed.x += pos.x - prevPos.x
      speed.y += pos.y - prevPos.y
      speed.z += pos.z - prevPos.z
    }

    speed.x = speed.x / prevPlayerPositions.length
    speed.y = speed.y / prevPlayerPositions.length
    speed.z = speed.z / prevPlayerPositions.length

    //@ts-ignore
    targetGrade = bot.hawkEye.getMasterGrade(targets.entity, speed, 'bow')
    longRangeAttack.setInfoShot(targetGrade)
  }

  function startGrades() {
    const isEventLoaded = bot.listeners('customEventPhysicTick').find(event => {
      return event.name === 'getGrades'
    })

    if (!isEventLoaded) {
      bot.on('customEventPhysicTick', getGrades)
    }
  }

  function stopGrades() {
    bot.removeListener('customEventPhysicTick', getGrades)
  }

  function checkHandleSword() {
    const swordHandled = inventory.checkItemEquiped('sword')

    if (swordHandled) { return }

    const itemEquip = bot.inventory.items().find(item => item.name.includes('sword'))
    if (itemEquip) {
      // botWebsocket.log('Sword changing')
      bot.equip(itemEquip, 'hand')
    }
  }

  const transitions = [
    // Mob is dead
    new StateTransition({
      parent: attack,
      child: exit,
      name: 'Mob is dead',
      onTransition: () => {
        botWebsocket.emitCombat(false)
        botWebsocket.log('End Combat - attack')
        stopGrades()
        targets.entity = undefined
        checkHandleSword()
      },
      shouldTransition: () => targets.entity === undefined || targets.entity.isValid === false
    }),

    new StateTransition({
      parent: longRangeAttack,
      child: exit,
      name: 'Mob is dead',
      onTransition: () => {
        botWebsocket.emitCombat(false)
        botWebsocket.log('End Combat - longRangeAttack')
        stopGrades()
        targets.entity = undefined
        checkHandleSword()
      },
      shouldTransition: () => targets.entity === undefined || targets.entity.isValid === false
    }),

    new StateTransition({
      parent: followMob,
      child: exit,
      name: 'Mob is dead',
      onTransition: () => {
        botWebsocket.emitCombat(false)
        botWebsocket.log('End Combat - followMob')
        stopGrades()
        targets.entity = undefined
        checkHandleSword()
      },
      shouldTransition: () => {
        return (targets.entity === undefined) ||
          (targets.entity.isValid === false) ||
          (Date.now() - newTimeMobCountdown > timeMobCountdown && targets.entity.type !== 'player')
      }
    }),
    // END Mob is dead ***********

    new StateTransition({
      parent: start,
      child: attack,
      onTransition: () => {
        botWebsocket.emitCombat(true)
        botWebsocket.log('Start combat ' + targets.entity?.mobType + ' ' + JSON.stringify(targets.entity?.position))
        startGrades()
      },
      name: 'start -> followMob',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: attack,
      child: followMob,
      name: 'Mob is too far',
      onTransition: () => {
        if (flyingMobs.includes(targets.entity?.name ?? '')) {
          //@ts-ignore
          followMob.movements = movementsForFliyingMobs
        } else {
          //@ts-ignore
          followMob.movements = movements
        }
        newTimeMobCountdown = Date.now()
        checkHandleSword()
      },
      shouldTransition: () => {
        return targets.entity !== undefined &&
          followMob.distanceToTarget() > rangeSword &&
          followMob.distanceToTarget() < rangeFollowToShortAttack &&
          targets.entity.isValid
      }
    }),

    // Long Range Attack
    new StateTransition({
      parent: attack,
      child: longRangeAttack,
      name: 'Mob is too far',
      shouldTransition: () => {
        return targets.entity !== undefined &&
          followMob.distanceToTarget() > rangeFollowToShortAttack &&
          targetGrade !== undefined && targets.entity.isValid
      }
    }),

    new StateTransition({
      parent: followMob,
      child: longRangeAttack,
      name: 'Mob is on range for Long Range Attack',
      shouldTransition: () => {
        return targets.entity !== undefined &&
          followMob.distanceToTarget() < rangoBow &&
          followMob.distanceToTarget() > rangeFollowToShortAttack &&
          Date.now() - bowCountdown > timeBowCountdown &&
          targetGrade !== undefined &&
          targets.entity.isValid &&
          longRangeAttack.checkBowAndArrow() === true
      }
    }),

    new StateTransition({
      parent: longRangeAttack,
      child: followMob,
      onTransition: () => {
        if (flyingMobs.includes(targets.entity?.name ?? '')) {
          //@ts-ignore
          followMob.movements = movementsForFliyingMobs
        } else {
          //@ts-ignore
          followMob.movements = movements
        }
        checkHandleSword()
        bowCountdown = Date.now()
        newTimeMobCountdown = Date.now()
      },
      shouldTransition: () => {
        return targets.entity !== undefined && (
          (longRangeAttack.checkBowAndArrow() === false && targets.entity.isValid) ||
          (followMob.distanceToTarget() > rangoBow && targets.entity.isValid) ||
          (followMob.distanceToTarget() < rangeFollowToShortAttack && targets.entity.isValid) ||
          (targets.entity.mobType === 'Enderman' && targets.entity.isValid) ||
          (targetGrade === undefined && targets.entity.isValid)
        )
      }
    }),

    new StateTransition({
      parent: longRangeAttack,
      child: longRangeAttack,
      name: 'Mob is on range for Long Range Attack',
      shouldTransition: () => targets.entity !== undefined &&
        followMob.distanceToTarget() < rangoBow &&
        followMob.distanceToTarget() > rangeFollowToShortAttack &&
        targets.entity.isValid
    }),
    // END ************* Long Range Attack

    new StateTransition({
      parent: followMob,
      child: attack,
      name: 'Mob is near',
      shouldTransition: () => targets.entity !== undefined &&
        followMob.distanceToTarget() < rangeSword &&
        attack.nextAttack() && targets.entity.isValid
    }),

    new StateTransition({
      parent: attack,
      child: attack,
      name: 'Mob still near continue attack',
      shouldTransition: () => targets.entity !== undefined &&
        followMob.distanceToTarget() < rangeSword &&
        attack.nextAttack() && targets.entity.isValid
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'Combat'
  return nestedState
}

export default combatFunction
