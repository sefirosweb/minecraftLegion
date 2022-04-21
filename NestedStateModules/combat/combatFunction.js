const botWebsocket = require('@modules/botWebsocket')

const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorFollowEntity
} = require('mineflayer-statemachine')
const BehaviorAttack = require('@BehaviorModules/BehaviorAttack')
const BehaviorLongAttack = require('@BehaviorModules/BehaviorLongAttack')

function combatFunction(bot, targets) {
  const inventory = require('@modules/inventoryModule')(bot)
  const { ignoreMobs } = require('@modules/getClosestEnemy')(bot, targets)
  const hawkEye = require('minecrafthawkeye')
  bot.loadPlugin(hawkEye)

  const rangoBow = 60
  const rangeSword = 3
  const rangeFollowToShortAttack = 5
  const timeBowColdown = 1550

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 575
  exit.y = 263

  const attack = new BehaviorAttack(bot, targets)
  attack.stateName = 'Attack'
  attack.x = 325
  attack.y = 263

  const longRangeAttack = new BehaviorLongAttack(bot, targets)
  longRangeAttack.stateName = 'Long Range Attack'
  longRangeAttack.x = 725
  longRangeAttack.y = 413

  const followMob = new BehaviorFollowEntity(bot, targets)
  followMob.stateName = 'Follow Enemy'
  followMob.x = 725
  followMob.y = 113

  let targetGrade = false
  const prevPlayerPositions = []
  let bowColdown = Date.now() // Used for avoid bugs on jam between bow and sword
  let newTargetColdDown = Date.now()

  const filter = e =>
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

    if (Date.now() - bowColdown < timeBowColdown) {
      longRangeAttack.setInfoShot(false)
      return false
    }

    if (!targets.entity || targets.entity === undefined) {
      longRangeAttack.setInfoShot(false)
      return false
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
      bot.equip(itemEquip, 'hand', function () {
        botWebsocket.log('Sword changed')
      })
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
      shouldTransition: () => !targets.entity || targets.entity.isValid === false
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
      shouldTransition: () => !targets.entity || targets.entity.isValid === false
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
      shouldTransition: () => !targets.entity || targets.entity.isValid === false
    }),
    // END Mob is dead ***********

    new StateTransition({
      parent: start,
      child: attack,
      onTransition: () => {
        botWebsocket.emitCombat(true)
        botWebsocket.log('Start combat ' + targets.entity.mobType + ' ' + JSON.stringify(targets.entity.position))
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
        checkHandleSword()
      },
      shouldTransition: () => followMob.distanceToTarget() > rangeSword && followMob.distanceToTarget() < rangeFollowToShortAttack && targets.entity.isValid
    }),

    // Long Range Attack
    new StateTransition({
      parent: attack,
      child: longRangeAttack,
      name: 'Mob is too far',
      shouldTransition: () => followMob.distanceToTarget() > rangeFollowToShortAttack && targetGrade !== false && targets.entity.isValid
    }),

    new StateTransition({
      parent: followMob,
      child: longRangeAttack,
      name: 'Mob is on range for Long Range Attack',
      shouldTransition: () => followMob.distanceToTarget() < rangoBow && followMob.distanceToTarget() > rangeFollowToShortAttack && Date.now() - bowColdown > timeBowColdown && targetGrade !== false && targets.entity.isValid
    }),

    new StateTransition({
      parent: longRangeAttack,
      child: followMob,
      onTransition: () => {
        checkHandleSword()
        bowColdown = Date.now()
      },
      shouldTransition: () => {
        return (longRangeAttack.checkBowAndArrow() === false && targets.entity.isValid) ||
          (followMob.distanceToTarget() > rangoBow && targets.entity.isValid) ||
          (followMob.distanceToTarget() < rangeFollowToShortAttack && targets.entity.isValid) ||
          (targets.entity.mobType === 'Enderman' && targets.entity.isValid) || 
          (targetGrade === false && targets.entity.isValid)
      }
    }),

    new StateTransition({
      parent: longRangeAttack,
      child: longRangeAttack,
      name: 'Mob is on range for Long Range Attack',
      shouldTransition: () => followMob.distanceToTarget() < rangoBow && followMob.distanceToTarget() > rangeFollowToShortAttack && targets.entity.isValid
    }),
    // END ************* Long Range Attack

    new StateTransition({
      parent: followMob,
      child: attack,
      name: 'Mob is near',
      shouldTransition: () => followMob.distanceToTarget() < rangeSword && attack.nextAttack() && targets.entity.isValid
    }),

    new StateTransition({
      parent: attack,
      child: attack,
      name: 'Mob still near continue attack',
      shouldTransition: () => followMob.distanceToTarget() < rangeSword && attack.nextAttack() && targets.entity.isValid
    })

  ]

  const combatFunction = new NestedStateMachine(transitions, start, exit)
  combatFunction.stateName = 'Combat'
  return combatFunction
}

module.exports = combatFunction
