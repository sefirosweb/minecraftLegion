

import { Food, LegionStateMachineTargets } from "base-types"
import { botWebsocket } from '@/modules'
import mcDataLoader from 'minecraft-data'
import { StateBehavior } from "mineflayer-statemachine"
import { Bot } from "mineflayer";

export class BehaviorEatFood implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  readonly mcData: mcDataLoader.IndexedData
  stateName: string
  x?: number
  y?: number

  finished: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEatFood'
    this.finished = false
    this.mcData = mcDataLoader(bot.version)
  }

  onStateEntered() {
    if (this.bot.food === 20) {
      this.finished = true
    } else {
      this.eat()
    }
  }

  getAllFoods() {
    const mcDataFoods = this.mcData.foodsArray
    return mcDataFoods.map((item) => item.name)
  }

  onStateExited() {
    this.finished = false
  }

  checkFoodInInventory() {
    const validFoods: Array<Food> = []

    this.bot.inventory.items().forEach((foodInventory) => {
      const priority = this.bot.config.itemsCanBeEat.findIndex(
        (food) => food === foodInventory.name
      )

      if (priority >= 0) {
        const validFoodWithPriority: Food = {
          id: foodInventory.type,
          name: foodInventory.name,
          quantity: foodInventory.count,
          priority
        }
        validFoods.push(validFoodWithPriority)
      }
    })

    return validFoods
  }

  eat() {
    const availableFood = this.checkFoodInInventory().sort(function (a, b) {
      if (a.priority > b.priority) {
        return 1
      }
      if (a.priority < b.priority) {
        return -1
      }
      return 0
    })

    if (availableFood.length === 0) {
      botWebsocket.log('No food in inventory ')
      this.finished = true
      return
    }

    const firstFoodFound = availableFood.shift()

    if (!firstFoodFound) {
      this.finished = true
      return
    }

    this.bot
      .equip(firstFoodFound.id, 'hand')
      .then(() => {
        return this.bot.consume()
      })
      .then(() => {
        if (!this.bot.food || this.bot.food !== 20) {
          this.eat()
        } else {
          this.finished = true
        }
      })
      .catch((error) => {
        botWebsocket.log('Error on eat food ' + error)
        this.finished = true
      })
  }

  isFinished() {
    return this.finished
  }
}
