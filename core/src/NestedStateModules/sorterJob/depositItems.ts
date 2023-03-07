import { LegionStateMachineTargets, PendingTransaction } from '@/types'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import GoAndDeposit from '@/NestedStateModules/getReady/goAndDeposit'
import { Bot } from 'mineflayer'

function depositItems(bot: Bot, targets: LegionStateMachineTargets) {
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

  const goAndDeposit = GoAndDeposit(bot, targets)
  goAndDeposit.stateName = 'Go chest and Deposit'
  goAndDeposit.x = 125
  goAndDeposit.y = 413

  let pendingTransaction: Array<PendingTransaction>
  const findChests = () => {
    pendingTransaction = []
    Object.entries(targets.chests).forEach((chestEntry) => {
      const [chestIndex, chest] = chestEntry
      const items = targets.sorterJob.slotsToSort.filter(i => i.toChest === chestIndex)
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
      child: goAndDeposit,
      onTransition: () => {
        const currentChest = pendingTransaction.shift()
        if (currentChest === undefined) throw new Error('Variable currentChest is not defined!')
        targets.position = currentChest.chest.position
        targets.items = currentChest.items
      },
      shouldTransition: () => pendingTransaction.length > 0
    }),

    new StateTransition({
      parent: goAndDeposit,
      child: startCheckNextChest,
      shouldTransition: () => goAndDeposit.isFinished() && pendingTransaction.length > 0
    }),

    new StateTransition({
      parent: goAndDeposit,
      child: exit,
      shouldTransition: () => goAndDeposit.isFinished() && pendingTransaction.length === 0
    }),

    new StateTransition({
      parent: startCheckNextChest,
      child: exit,
      shouldTransition: () => pendingTransaction.length === 0
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'depositItems'
  return nestedState
}

export default depositItems
