import { ChestBlock, LegionStateMachineTargets } from 'base-types'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import GoAndDeposit from '@/NestedStateModules/getReady/goAndDeposit'
import { Bot } from 'mineflayer'

function depositItemsInInventory(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const nextChest = new BehaviorIdle()
  nextChest.stateName = 'Next Chest'
  nextChest.x = 125
  nextChest.y = 213

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 213

  const goAndDeposit = GoAndDeposit(bot, targets)
  goAndDeposit.stateName = 'Go chest and Deposit'
  goAndDeposit.x = 125
  goAndDeposit.y = 313

  let chestsFound: Array<ChestBlock>
  let currentChest

  const findEmptychests = () => {
    const chests = structuredClone(targets.chests)
    return Object.values(chests)
      .filter(c => c.slots.filter(s => s === null).length > 0)
      .sort((a, b) => b.slots.filter(s => s === null).length - a.slots.filter(s => s === null).length)
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: nextChest,
      onTransition: () => {
        chestsFound = findEmptychests()
        targets.sorterJob.emptyChests = chestsFound
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: nextChest,
      child: goAndDeposit,
      onTransition: () => {
        currentChest = chestsFound.shift()
        if(!currentChest) throw new Error('current chest is empty!')
        targets.position = currentChest.position
        targets.items = bot.inventory.items().map(i => {
          return {
            type: i.type,
            quantity: i.count
          }
        })
      },
      shouldTransition: () => bot.inventory.items().length > 0 && chestsFound.length > 0
    }),

    new StateTransition({
      parent: goAndDeposit,
      child: nextChest,
      shouldTransition: () => goAndDeposit.isFinished()
    }),

    new StateTransition({
      parent: nextChest,
      child: exit,
      shouldTransition: () => bot.inventory.items().length === 0 || chestsFound.length === 0
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'depositItemsInInventory'
  return nestedState
}

export default depositItemsInInventory
