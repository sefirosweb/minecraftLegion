import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorDepositItemChest from '@/BehaviorModules/BehaviorDepositItemChest'
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import { Bot, LegionStateMachineTargets } from '@/types'

export default (bot: Bot, targets: LegionStateMachineTargets) => {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 125
  //@ts-ignore
  exit.y = 413

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Move To Chest'
  goChest.x = 125
  goChest.y = 213
  goChest.movements = targets.movements

  const depositItemChest = new BehaviorDepositItemChest(bot, targets)
  depositItemChest.stateName = 'Deposit Items'
  depositItemChest.x = 125
  depositItemChest.y = 313

  const transitions = [
    new StateTransition({
      parent: start,
      child: goChest,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goChest,
      child: depositItemChest,
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: depositItemChest,
      child: exit,
      shouldTransition: () => depositItemChest.isFinished()
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'Go Chests and Deposit'
  return nestedState
}