const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')
const BehaviorWithdrawItemChest = require('@BehaviorModules/BehaviorWithdrawItemChest')
const BehaviorDepositItemChest = require('@BehaviorModules/BehaviorDepositItemChest')
const BehaviorCheckItemsInInventory = require('@BehaviorModules/BehaviorCheckItemsInInventory')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')

function goChestsFunction (bot, targets) {
  const { findItemsInChests } = require('@modules/sorterJob')(bot)
  const { getResumeInventory, getGenericItems } = require('@modules/inventoryModule')(bot)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 313

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 725
  exit.y = 113

  const nextCheck = new BehaviorIdle()
  nextCheck.stateName = 'Next Check'
  nextCheck.x = 525
  nextCheck.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 125
  loadConfig.y = 113

  const checkItemsInInventory = new BehaviorCheckItemsInInventory(bot, targets)
  checkItemsInInventory.stateName = 'Checks Items in Inventory'
  checkItemsInInventory.x = 525
  checkItemsInInventory.y = 250

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 525
  goChest.y = 413
  goChest.movements = targets.movements

  const withdrawItems = new BehaviorWithdrawItemChest(bot, targets)
  withdrawItems.stateName = 'Withdraw Items'
  withdrawItems.x = 325
  withdrawItems.y = 250

  const depositItems = new BehaviorDepositItemChest(bot, targets)
  depositItems.stateName = 'Deposit Items'
  depositItems.x = 725
  depositItems.y = 250

  const pickUpItems = require('@NestedStateModules/getReady/pickUpItems')(bot, targets)
  pickUpItems.stateName = 'Pick Up Items'
  pickUpItems.x = 325
  pickUpItems.y = 113

  let chests = []
  let chestIndex = 0

  const getItemsToWithdrawInChests = () => {
    return chests.filter(c => c.type === 'withdraw').reduce((returnData, c) => {
      c.items.forEach(i => {
        const key = returnData.findIndex(r => r.item === i.item)
        if (key >= 0) {
          returnData[key].quantity += i.quantity
        } else {
          returnData.push(i)
        }
      })
      return returnData
    }, [])
  }

  const findChestsToWithdraw = () => {
    const resumeInventory = getResumeInventory()
    const itemsToWithdrawInChests = getItemsToWithdrawInChests() // bsca que items hay que sacar
    const itemsToWithdraw = itemsToWithdrawInChests.reduce((returnData, i) => { // resta los items que hay que sacar - inventario
      let invItem
      if (getGenericItems().includes(i.item)) {
        invItem = resumeInventory.find(inv => inv.name.includes(i.item))
      } else {
        invItem = resumeInventory.find(inv => inv.name === i.item)
      }
      i.quantity = invItem ? i.quantity - invItem.quantity : i.quantity
      if (i.quantity > 0) returnData.push(i)
      return returnData
    }, [])
    targets.pickUpItems = findItemsInChests(targets.chests, itemsToWithdraw) // busca en todos los cofres que items hay que sacar
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: pickUpItems,
      name: 'loadConfig -> checkItemsInInventory',
      onTransition: () => {
        chestIndex = 0
        chests = loadConfig.getAllChests()
        findChestsToWithdraw()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: pickUpItems,
      child: nextCheck,
      shouldTransition: () => pickUpItems.isFinished()
    }),

    new StateTransition({
      parent: nextCheck,
      child: exit,
      name: 'All chest checked',
      shouldTransition: () => chestIndex === (chests.length)
    }),

    new StateTransition({
      parent: nextCheck,
      child: checkItemsInInventory,
      name: 'All chest checked',
      onTransition: () => {
        checkItemsInInventory.setItemsToCheck(chests[chestIndex].items)
        checkItemsInInventory.setIsDeposit(chests[chestIndex].type)
      },
      shouldTransition: () => chestIndex < (chests.length)
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: nextCheck,
      name: 'Check next chest',
      onTransition: () => chestIndex++,
      shouldTransition: () => checkItemsInInventory.isFinished() && targets.items.length === 0
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: goChest,
      name: 'Go to chest',
      onTransition: () => {
        targets.position = chests[chestIndex].position
      },
      shouldTransition: () => checkItemsInInventory.isFinished() && targets.items.length > 0
    }),

    new StateTransition({
      parent: goChest,
      child: withdrawItems,
      name: 'goChest -> withdrawItems',
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !goChest.isSuccess() && !bot.pathfinder.isMining() && chests[chestIndex].type === 'withdraw'
    }),

    new StateTransition({
      parent: goChest,
      child: depositItems,
      name: 'goChest -> depositItems',
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !goChest.isSuccess() && !bot.pathfinder.isMining() && (chests[chestIndex].type === 'deposit' || chests[chestIndex].type === 'depositAll')
    }),

    new StateTransition({
      parent: withdrawItems,
      child: nextCheck,
      name: 'withdrawItems -> checkItemsInInventory',
      onTransition: () => chestIndex++,
      shouldTransition: () => withdrawItems.isFinished()
    }),

    new StateTransition({
      parent: depositItems,
      child: nextCheck,
      name: 'withdrawItems -> checkItemsInInventory',
      onTransition: () => chestIndex++,
      shouldTransition: () => depositItems.isFinished()
    })
  ]

  const goChestsFunction = new NestedStateMachine(transitions, start, exit)
  goChestsFunction.stateName = 'Go Chests'
  return goChestsFunction
}

module.exports = goChestsFunction
