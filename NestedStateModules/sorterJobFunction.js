const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')

function sorterJobFunction (bot, targets) {
  const { findChests } = require('@modules/inventoryModule')(bot)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const dd = new BehaviorIdle(targets)

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 525
  goChest.y = 413
  goChest.movements = targets.movements

  const transitions = [
    new StateTransition({
      parent: start,
      child: goChest,
      onTransition: () => {
        targets.chests = findChests({
          count: 9999,
          maxDistance: 40
        })
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goChest,
      child: dd,
      onTransition: () => {
        targets.entity = undefined
      },
      shouldTransition: () => true
    })

  ]

  const sorterJob = new NestedStateMachine(transitions, start)
  sorterJob.stateName = 'Sorter Job'
  return sorterJob
}

module.exports = sorterJobFunction
