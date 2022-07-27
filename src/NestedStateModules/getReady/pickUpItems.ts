import { Bot, Item, LegionStateMachineTargets, Chest } from "@/types"


const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

type PendingTransaction = {
  chest: Chest,
  items: Array<Item>
}

function pickUpItems(bot: Bot, targets: LegionStateMachineTargets) {

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 313

  const startCheckNextChest = new BehaviorIdle(targets)
  startCheckNextChest.stateName = 'Start Check Next Chest'
  startCheckNextChest.x = 125
  startCheckNextChest.y = 263

  const goAndWithdraw = require('@NestedStateModules/getReady/goAndWithdraw')(bot, targets)
  goAndWithdraw.stateName = 'Go chest and Withdraw'
  goAndWithdraw.x = 125
  goAndWithdraw.y = 413

  let pendingTransaction: Array<PendingTransaction>
  const findChests = () => {
    pendingTransaction = []

    const pickupItems = JSON.parse(JSON.stringify(targets.pickUpItems)) as Array<any>; // TODO Fix

    Object.entries(targets.chests).forEach((entry) => {

      const chestIndex = entry[0]
      const chest = entry[1] as Chest

      const items: Array<Item> = [];

      pickupItems.forEach((i) => {
        if (
          i.fromChest === chestIndex
          && chest.dimension === bot.game.dimension
          && bot.entity.position.distanceTo(chest.position) < 128
        ) {
          const item = { ...i }
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

  const pickUpItems = new NestedStateMachine(transitions, start, exit)
  pickUpItems.stateName = 'pickUpItems'
  return pickUpItems
}

module.exports = pickUpItems
