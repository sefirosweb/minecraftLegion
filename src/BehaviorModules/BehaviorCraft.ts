
//@ts-nocheck
import { Bot, LegionStateMachineTargets } from "@/types"
import { Block } from "minecraft-data"
import mcDataLoader from 'minecraft-data'
import botWebsocket from '@/modules/botWebsocket'

module.exports = class BehaviorCraft {

  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  readonly mcData: mcDataLoader.IndexedData
  stateName: string
  isEndFinished: boolean
  success: boolean
  craftingTable: Block | null


  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorCraft'
    this.isEndFinished = false
    this.success = false
    this.craftingTable = null
    this.mcData = mcDataLoader(bot.version)
    this.inventoryModule = require('@modules/inventoryModule')(bot)
  }

  onStateEntered() {
    this.isEndFinished = false
    this.success = false
    this.craftingTable = null

    this.timeLimit = setTimeout(() => {
      console.log('Time exceded for craft item')
      this.isEndFinished = true
    }, 5000)

    this.craft()
  }

  onStateExited() {
    this.isEndFinished = false
    this.success = false
    this.craftingTable = null
    this.targets.craftItem = null
    clearTimeout(this.timeLimit)
  }

  isFinished() {
    return this.isEndFinished
  }

  isSuccess() {
    return this.success
  }

  craft() {
    if (!this.targets.craftItem) {
      botWebsocket.log('Cant craft withouth info')
      this.isEndFinished = true
      return
    }

    if (!this.enoughItemsForCraft(this.targets.craftItem.name)) {
      botWebsocket.log(
        `No enough ingredients for: ${this.targets.craftItem.name}`
      )
      this.isEndFinished = true
      return
    }

    const item = this.mcData.itemsByName[this.targets.craftItem.name]
    const recipe = this.bot.recipesFor(
      item.id,
      null,
      1,
      this.getCraftingTable()
    )[0]
    if (!recipe) {
      botWebsocket.log(
        `No crafting table near, and needs for ${this.targets.craftItem.name}`
      )
      this.isEndFinished = true
      return
    }

    this.bot
      .craft(recipe, 1, this.getCraftingTable())
      .then(() => {
        this.success = true
        this.isEndFinished = true
      })
      .catch((err) => {
        console.log(err)
        botWebsocket.log(`Error crafting ${this.targets.craftItem.name}`)
        this.isEndFinished = true
      })
  }

  getCraftingTable() {
    if (!this.craftingTable) {
      const craftingTableID = this.mcData.blocksByName.crafting_table.id
      this.craftingTable = this.bot.findBlock({
        matching: craftingTableID,
        maxDistance: 3
      })
    }

    return this.craftingTable
  }

  enoughItemsForCraft(name) {
    const item = this.mcData.itemsByName[name]

    if (!item) {
      botWebsocket.log(`unknown item: ${name}`)
      return false
    }

    const aviableRecipes = this.bot.recipesAll(
      item.id,
      null,
      this.getCraftingTable()
    )
    const resumeInventory = this.inventoryModule.getResumeInventory()

    let enoughItems = false
    for (let r = 0; r < aviableRecipes.length; r++) {
      let validRecipe = true
      for (let i = 0; i < aviableRecipes[r].delta.length; i++) {
        if (aviableRecipes[r].delta[i].count > 0) {
          continue
        }

        const itemInventory = resumeInventory.find(
          (inv) => inv.type === aviableRecipes[r].delta[i].id
        )
        if (
          !itemInventory ||
          itemInventory.quantity < Math.abs(aviableRecipes[r].delta[i].count)
        ) {
          validRecipe = false
          break
        }
      }
      if (validRecipe) {
        enoughItems = true
        break
      }
    }

    if (!enoughItems) {
      botWebsocket.log(`No enough items for ${name}`)
      return false
    }

    return true
  }
}
