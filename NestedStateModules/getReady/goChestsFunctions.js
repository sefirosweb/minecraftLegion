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
  const { findChestsToWithdraw } = require('@modules/chestModule')(bot)
  const { getResumeInventoryV2 } = require("@modules/inventoryModule")(bot);

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 313

  const checkCraftItem = new BehaviorIdle()
  checkCraftItem.stateName = 'Check Craft Item'
  checkCraftItem.x = 125
  checkCraftItem.y = 313

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
  pickUpItems.y = 50

  const searchAndCraft =
  require("@NestedStateModules/crafterJob/searchAndCraftFunction")(
    bot,
    targets
  );


  let chests = []
  let chestIndex = 0
  let itemsToCraft = []

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: nextCheck,
      onTransition: () => {
        chestIndex = 0
        chests = loadConfig.getAllChests()
      },
      shouldTransition: () => !loadConfig.getFirstPickUpItemsFromKnownChests()
    }),

    new StateTransition({
      parent: loadConfig,
      child: pickUpItems,
      name: 'Is enabled first pickup items from know chests',
      onTransition: () => {
        chestIndex = 0
        chests = loadConfig.getAllChests()
        targets.pickUpItems = findChestsToWithdraw(chests, targets.chests)
      },
      shouldTransition: () => loadConfig.getFirstPickUpItemsFromKnownChests()
    }),

    new StateTransition({
      parent: pickUpItems,
      child: nextCheck,
      shouldTransition: () => pickUpItems.isFinished()
    }),

    new StateTransition({
      parent: nextCheck,
      child: exit,
      shouldTransition: () => chestIndex === (chests.length)
    }),

    new StateTransition({
      parent: nextCheck,
      child: checkItemsInInventory,
      onTransition: () => {
        checkItemsInInventory.setItemsToCheck(chests[chestIndex].items)
        checkItemsInInventory.setIsDeposit(chests[chestIndex].type)
      },
      shouldTransition: () => chestIndex < (chests.length)
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => checkItemsInInventory.isFinished() && targets.items.length === 0
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: goChest,
      onTransition: () => {
        targets.position = chests[chestIndex].position
      },
      shouldTransition: () => checkItemsInInventory.isFinished() && targets.items.length > 0
    }),

    new StateTransition({
      parent: goChest,
      child: withdrawItems,
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !goChest.isSuccess() && !bot.pathfinder.isMining() && chests[chestIndex].type === 'withdraw'
    }),

    new StateTransition({
      parent: goChest,
      child: depositItems,
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !goChest.isSuccess() && !bot.pathfinder.isMining() && (chests[chestIndex].type === 'deposit' || chests[chestIndex].type === 'depositAll')
    }),

    new StateTransition({
      parent: withdrawItems,
      child: checkCraftItem,
      onTransition: () =>{
      const itemInChest = chests[chestIndex].items
      const resumeInventory = getResumeInventoryV2()

      itemsToCraft = []
      
      itemInChest.forEach(ic => {
          if(ic.quantity > 0) {
          itemsToCraft.push({
            name: ic.item,
            quantity: ic.quantity
          })
        }
      });
        
      },
      shouldTransition: () => withdrawItems.isFinished()
    }),

    new StateTransition({
      parent: checkCraftItem,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => itemsToCraft.length === 0 || !targets.config.canCraftItemWithdrawChest
    }),

    new StateTransition({
      parent: checkCraftItem,
      child: searchAndCraft,
      onTransition: () => {
        targets.craftItemBatch = itemsToCraft
      },
      shouldTransition: () => itemsToCraft.length > 0 && targets.config.canCraftItemWithdrawChest
    }),

    new StateTransition({
       parent: searchAndCraft,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => searchAndCraft.isFinished()
    }),

    new StateTransition({
      parent: depositItems,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => depositItems.isFinished()
    })
  ]

  const goChestsFunction = new NestedStateMachine(transitions, start, exit)
  goChestsFunction.stateName = 'Go Chests'
  return goChestsFunction
}

module.exports = goChestsFunction
