const botWebsocket = require('@modules/botWebsocket')

module.exports = class BehaviorEatFood {
  constructor (bot, targets, foods = []) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEatFood'
    this.finished = false
  }

  onStateEntered () {
    if (this.bot.food === 20) {
      this.finished = true
    } else {
      this.eat()
    }
  }

  getAllFoods () {
    const mcData = require('minecraft-data')(this.bot.version)
    const mcDataFoods = mcData.foodsArray
    return mcDataFoods.map((item) => item.name)
  }

  onStateExited () {
    this.finished = false
  }

  checkFoodInInventory () {
    return this.bot.inventory.items().reduce((validFood, foodInventory) => {
      const returnValidFood = [...validFood]

      const priority = this.targets.config.itemsCanBeEat.findIndex(
        (food) => food === foodInventory.name
      )

      if (priority >= 0) {
        const validFoodWithPriority = {
          ...foodInventory,
          priority
        }
        returnValidFood.push(validFoodWithPriority)
      }

      return returnValidFood
    }, [])
  }

  eat () {
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
      .equip(firstFoodFound, 'hand')
      .then(() => {
        return this.bot.consume()
      })
      .then(() => {
        if (!this.bot.food !== 20) {
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

  isFinished () {
    return this.finished
  }
}
