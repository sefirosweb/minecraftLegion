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
  calculateSort.stateName = 'Calculate items in chests'
  calculateSort.x = 525
  calculateSort.y = 113

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 525
  goChest.y = 313
  goChest.movements = targets.movements

  const sortChestFunction = require('@NestedStateModules/sortChestFunction')(bot, targets)
  sortChestFunction.stateName = 'Sort chests'
  sortChestFunction.x = 525
  sortChestFunction.y = 350

  const findNewChests = () => {
    const currentChests = targets.sorterJob.chests

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
        targets.sorterJob.chests = targets.sorterJob.chests || []
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
          const chestIndex = targets.sorterJob.chests.findIndex(c => {
            if (c.position.equals(targets.chest.position)) return true
            if (targets.chest.secondBlock && c.position.equals(targets.chest.secondBlock.position)) return true
            return false
          })
          if (chestIndex >= 0) {
            targets.sorterJob.chests.splice(chestIndex, 1)
          }
        }
      },
      shouldTransition: () => checkItemsInChest.isFinished()
    }),

    new StateTransition({
      parent: calculateSort,
      child: sortChestFunction,
      onTransition: () => {
        const allChests = targets.sorterJob.chests.map(chest => chest.slots)
        const allItems = allChests
          .reduce((items, chest) => {
            chest.forEach(item => {
              if (item === null) return
              const indexItem = items.findIndex(i => i.type === item.type)
              if (indexItem >= 0) {
                items[indexItem].count += item.count
              } else {
                items.push({ ...item })
              }
            })
            return items
          }, []).sort((a, b) => a.type - b.type)

        let chestIndex = 0
        const newChestSort = []
        let newSlots = []

        allItems.forEach(item => {
          let count = item.count

          if (newSlots.length === 0) {
            while (count > 0) {
              const itemToDeposit = { ...item }
              itemToDeposit.count = count > item.stackSize ? item.stackSize : count
              count -= itemToDeposit.count
              newSlots.push(itemToDeposit)

              if (newSlots.length === allChests[chestIndex].length) {
                newChestSort.push(newSlots)
                chestIndex++
                newSlots = []
              }
            }
          } else {
            const slotNeeded = Math.ceil(count / item.stackSize)
            const freeSlots = allChests[chestIndex].length - newSlots.length

            if (slotNeeded > freeSlots) {
              newChestSort.push(newSlots)
              chestIndex++
              newSlots = []
            }

            while (count > 0) {
              const itemToDeposit = { ...item }
              itemToDeposit.count = count > item.stackSize ? item.stackSize : count
              count -= itemToDeposit.count
              newSlots.push(itemToDeposit)

              if (newSlots.length === allChests[chestIndex].length) {
                newChestSort.push(newSlots)
                chestIndex++
                newSlots = []
              }
            }
          }
        })

        newChestSort.push(newSlots)
        targets.newChestSort = newChestSort
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: sortChestFunction,
      child: start,
      shouldTransition: () => sortChestFunction.isFinished()
    })

  ]

  const sorterJob = new NestedStateMachine(transitions, start)
  sorterJob.stateName = 'Sorter Job'
  return sorterJob
}

module.exports = sorterJobFunction
