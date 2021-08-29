const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function sorterJobFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const idl = new BehaviorIdle(targets)
  idl.stateName = 'idl'

  const transitions = [
    new StateTransition({
      parent: start,
      child: idl,
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
