import { LegionStateMachineTargets, PendingTransaction, ChestTransaction } from "base-types"
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import GoAndWithdraw from '@/NestedStateModules/getReady/goAndWithdraw'
import { Bot, Dimension_V2 } from "mineflayer"

export default (bot: Bot, targets: LegionStateMachineTargets) => {

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 313

  const startCheckNextChest = new BehaviorIdle()
  startCheckNextChest.stateName = 'Start Check Next Chest'
  startCheckNextChest.x = 125
  startCheckNextChest.y = 263

  const goAndWithdraw = GoAndWithdraw(bot, targets)
  goAndWithdraw.stateName = 'Go chest and Withdraw'
  goAndWithdraw.x = 125
  goAndWithdraw.y = 413

  let pendingTransaction: Array<PendingTransaction>
  const findChests = () => {
    pendingTransaction = []

    const pickupItems = JSON.parse(JSON.stringify(targets.pickUpItems)) as Array<ChestTransaction>;

    Object.entries(targets.chests).forEach((entry) => {

      const chestIndex = entry[0]
      const chest = entry[1]

      const items: Array<ChestTransaction> = [];

      pickupItems.forEach((i) => {
        if (
          i.fromChest === chestIndex
          && chest.dimension === bot.game.dimension as Dimension_V2
          && bot.entity.position.distanceTo(chest.position) < 128
        ) {
          items.push(i)
        }

      })

      if (items.length > 0) {
        pendingTransaction.push({
          chest,
          items
        })
      }
    })
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: startCheckNextChest,
      onTransition: () => {
        findChests()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: startCheckNextChest,
      child: goAndWithdraw,
      onTransition: () => {
        const currentChest = pendingTransaction.shift()
        if (currentChest) {
          targets.position = currentChest.chest.position
          targets.items = currentChest.items
        }
      },
      shouldTransition: () => pendingTransaction.length > 0
    }),

    new StateTransition({
      parent: goAndWithdraw,
      child: startCheckNextChest,
      shouldTransition: () => goAndWithdraw.isFinished() && pendingTransaction.length > 0
    }),

    new StateTransition({
      parent: goAndWithdraw,
      child: exit,
      shouldTransition: () => goAndWithdraw.isFinished() && pendingTransaction.length === 0
    }),

    new StateTransition({
      parent: startCheckNextChest,
      child: exit,
      shouldTransition: () => pendingTransaction.length === 0
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'pickUpItems'
  return nestedState
}