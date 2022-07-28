
import {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  NestedStateMachine,
  BehaviorGetClosestEntity

} from 'mineflayer-statemachine'
import { Entity } from 'prismarine-entity'

//@ts-ignore
import botWebsocket from '@modules/botWebsocket'
//@ts-ignore
import BehaviorAttack from '@BehaviorModules/BehaviorAttack'
import { Bot } from 'mineflayer'
import { LegionStateMachineTargets } from '@/types'

function archerJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const enter = new BehaviorIdle()
  const exit = new BehaviorIdle()
  const attack = new BehaviorAttack(bot, targets)

  function distanceFilter(entity: Entity) {
    return entity.position.distanceTo(bot.player.entity.position) <= 10 &&
      (entity.type === 'mob' || entity.type === 'player')
  }
  //@ts-ignore
  const getClosestMob = new BehaviorGetClosestEntity(bot, targets, distanceFilter)
  //@ts-ignore
  const followMob = new BehaviorFollowEntity(bot, targets)

  const transitions = [
    new StateTransition({
      parent: enter,
      child: getClosestMob,
      name: 'enter -> getClosestEntity',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: getClosestMob,
      child: followMob,
      name: 'Found a mob',
      shouldTransition: () => targets.entity !== undefined,
      onTransition: () => botWebsocket.log('Attack mob! ' + targets.entity?.displayName)
    }),

    new StateTransition({
      parent: getClosestMob,
      child: getClosestMob,
      name: 'Re search found a mob',
      shouldTransition: () => targets.entity === undefined
    }),

    new StateTransition({
      parent: followMob,
      child: attack,
      name: 'Mob is near',
      shouldTransition: () => followMob.distanceToTarget() < 2 && attack.nextAttack() && targets.entity?.isValid
    }),

    new StateTransition({
      parent: attack,
      child: followMob,
      name: 'Mob is too far',
      shouldTransition: () => targets.entity !== undefined && followMob.distanceToTarget() > 2 && targets.entity.isValid
    }),

    new StateTransition({
      parent: attack,
      child: attack,
      name: 'Mob still near continue attack',
      shouldTransition: () => followMob.distanceToTarget() < 2 && attack.nextAttack() && targets.entity?.isValid
    }),

    new StateTransition({
      parent: attack,
      child: getClosestMob,
      name: 'Mob is dead',
      shouldTransition: () => targets.entity?.isValid === false
    }),

    new StateTransition({
      parent: followMob,
      child: getClosestMob,
      name: 'Mob is dead',
      shouldTransition: () => targets.entity?.isValid === false
    })

  ]

  const archerJobFunction = new NestedStateMachine(transitions, enter, exit)
  archerJobFunction.stateName = 'Archer Job'
  return archerJobFunction
}

module.exports = archerJobFunction