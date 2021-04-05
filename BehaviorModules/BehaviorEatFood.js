const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorEatFood {
  constructor (bot, targets, foods = []) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEatFood'
    this.isEndEating = false

    this.isEating = false
  }

  onStateEntered () {
    if (this.bot.food === 20) {
      this.isEndEating = true
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
    this.isEating = false
    this.isEndEating = false
  }

  checkFoodInInventory () {
    return this.bot.inventory.items().reduce((validFood, foodInventory) => {
      const returnValidFood = [...validFood]

      const priority = this.targets.config.itemsCanBeEat.findIndex(food => food === foodInventory.name)

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
    this.isEating = true

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
      this.isEndEating = true
      return
    }

    const firstFoodFound = availableFood.shift()

    if (!firstFoodFound) {
      this.isEndEating = true
      return
    }

    this.equipFood(firstFoodFound)
      .then(() => this.consumeFood())
      .then(() => {
        this.isEating = false
        if (!this.bot.food === 20) {
          this.eat()
        } else {
          this.isEndEating = true
        }
      })
      .catch((error) => {
        botWebsocket.log('Error on eat food ' + error)
        setTimeout(() => {
          this.isEndEating = true
        }, 500)
      })
  }

  consumeFood () {
    return new Promise((resolve, reject) => {
      this.bot.consume((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  equipFood (food) {
    return new Promise((resolve, reject) => {
      this.bot.equip(food, 'hand', function (error) {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  isFinished () {
    return this.isEndEating
  }
}
