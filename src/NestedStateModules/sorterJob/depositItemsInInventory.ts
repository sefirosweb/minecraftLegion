import { Bot, LegionStateMachineTargets } from '@/types'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import GoAndDeposit from '@/NestedStateModules/getReady/goAndDeposit'

function depositItemsInInventory(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const nextChest = new BehaviorIdle()
  nextChest.stateName = 'Next Chest'
  //@ts-ignore
  nextChest.x = 125
  //@ts-ignore
  nextChest.y = 213

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 325
  //@ts-ignore
  exit.y = 213

  const goAndDeposit = GoAndDeposit(bot, targets)
  goAndDeposit.stateName = 'Go chest and Deposit'
  //@ts-ignore
  goAndDeposit.x = 125
  //@ts-ignore
  goAndDeposit.y = 313

  let chestsFound: Array<any>
  let currentChest

  const findEmptychests = () => {
    const chests: Array<any> = JSON.parse(JSON.stringify(targets.chests))
    return chests
      //@ts-ignore
      .filter(c => c.slots.filter(s => s === null).length > 0)
      //@ts-ignore
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
