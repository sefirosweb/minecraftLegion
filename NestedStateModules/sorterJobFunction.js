const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorcCheckItemsInChest = require('@BehaviorModules/BehaviorcCheckItemsInChest')

function sorterJobFunction (bot, targets) {
  const { findChests } = require('@modules/inventoryModule')(bot)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const checkNewChests = new BehaviorIdle(targets)
  checkNewChests.stateName = 'Check new chests'
  checkNewChests.x = 525
  checkNewChests.y = 413

  const checkItemsInChest = new BehaviorcCheckItemsInChest(bot, targets)
  checkItemsInChest.stateName = 'Check items in chests'
  checkItemsInChest.x = 1
  checkItemsInChest.y = 1

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 525
  goChest.y = 413
  goChest.movements = targets.movements

  const findNewChests = () => {
    const currentChests = targets.chests || []

    const chests = findChests({
      count: 9999,
      maxDistance: 40
    })

    const newChests = []

    chests.forEach(chest => {
      const haveChest = currentChests.find(currentChest => currentChests.position.equals(chest.position))
      if (!haveChest) {
        newChests.push(chest)
      }
    })

    return newChests
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkNewChests,
      onTransition: () => {
        targets.newChests = findNewChests()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkNewChests,
      child: goChest,
      onTransition: () => {
        const chest = targets.newChests.shift()
        targets.position = chest.position.clone()
      },
      shouldTransition: () => targets.newChests.length > 0
    }),

    new StateTransition({
      parent: checkNewChests,
      child: start,
      shouldTransition: () => targets.newChests.length === 0
    }),

    new StateTransition({
      parent: goChest,
      child: checkItemsInChest,
      shouldTransition: () => goChest.isFinished() && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: goChest,
      child: checkNewChests,
      shouldTransition: () => goChest.isFinished() && !bot.pathfinder.isMining()
    })

  ]

  const sorterJob = new NestedStateMachine(transitions, start)
  sorterJob.stateName = 'Sorter Job'
  return sorterJob
}

module.exports = sorterJobFunction
