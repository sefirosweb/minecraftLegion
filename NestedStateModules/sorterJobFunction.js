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
  checkNewChests.x = 325
  checkNewChests.y = 113

  const checkItemsInChest = new BehaviorcCheckItemsInChest(bot, targets)
  checkItemsInChest.stateName = 'Check items in chests'
  checkItemsInChest.x = 125
  checkItemsInChest.y = 313

  const d = new BehaviorIdle(targets)
  d.x = 725
  d.y = 113

  const calculateSort = new BehaviorIdle(targets)
  calculateSort.stateName = 'Calculate if chest is sorted'
  calculateSort.x = 525
  calculateSort.y = 113

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 525
  goChest.y = 313
  goChest.movements = targets.movements

  const findNewChests = () => {
    const currentChests = targets.chests

    const chests = findChests({
      count: 9999,
      maxDistance: 40
    })

    const newChests = []

    chests.forEach(chest => {
      const haveChest = currentChests.find(c => {
        if (c.position.equals(chest.position)) return true
        if (chest.secondBlock && c.position.equals(chest.secondBlock.position)) return true
        return false
      })
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
        targets.chests = targets.chests || []
        targets.newChests = findNewChests()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkNewChests,
      child: goChest,
      onTransition: () => {
        targets.chest = targets.newChests.shift()
        targets.position = targets.chest.position.clone()
      },
      shouldTransition: () => targets.newChests.length > 0
    }),

    new StateTransition({
      parent: checkNewChests,
      child: calculateSort,
      shouldTransition: () => targets.newChests.length === 0
    }),

    new StateTransition({
      parent: goChest,
      child: checkItemsInChest,
      shouldTransition: () => goChest.isFinished() && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: checkItemsInChest,
      child: checkNewChests,
      onTransition: () => {
        if (!checkItemsInChest.getCanOpenChest()) {
          const chestIndex = targets.chests.findIndex(c => {
            if (c.position.equals(targets.chest.position)) return true
            if (targets.chest.secondBlock && c.position.equals(targets.chest.secondBlock.position)) return true
            return false
          })
          if (chestIndex >= 0) {
            targets.chests.splice(chestIndex, 1)
          }
        }
      },
      shouldTransition: () => checkItemsInChest.isFinished()
    }),

    new StateTransition({
      parent: calculateSort,
      child: d,
      onTransition: () => {
        // targets.chests.map(chest => console.log(chest.slots))
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: d,
      child: start,
      onTransition: () => {
        // targets.chests.map(chest => console.log(chest.slots))
      },
      shouldTransition: () => true
    })

  ]

  const sorterJob = new NestedStateMachine(transitions, start)
  sorterJob.stateName = 'Sorter Job'
  return sorterJob
}

module.exports = sorterJobFunction
