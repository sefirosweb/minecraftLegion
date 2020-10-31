const lodash = require('lodash');

module.exports = class BehaviorEatFood {
  constructor(bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEatFood'

    this.priority = 'saturation' // saturation or foodPoints
    const mcData = require('minecraft-data')(bot.version)
    const data = mcData.foodsArray
    this.foods = data.map((item) => item.name)

    this.isEating = false
    this.isEndEating = false
  }

  onStateEntered() {
    if (this.bot.food == 20) {
      this.isEndEating = true
    } else {
      this.eat()
    }
  }


  onStateExited() {
    this.isEating = false
    this.isEndEating = false
  }


  eat() {
    this.isEating = true

    let found_food = this.getFodInInventory()

    if (found_food.length === 0 || !found_food) { // No food can't eat finish Behavior
      this.isEndEating = true
      return
    }

    let available_food = []

    this.bot.inventory.items().forEach((element) => {
      if (this.foods.includes(element.name)) available_food.push(element)
    })

    let best_food

    if (this.priority === 'foodPoints') {
      best_food = available_food.find((item) => item.foodPoints === lodash.maxBy(available_food, 'foodPoints'))
    } else {
      best_food = available_food.find((item) => item.saturation === lodash.maxBy(available_food, 'saturation'))
    }

    if (!best_food) {
      this.isEndEating = true
      return
    }

    this.equipFood(best_food)
      .then(() => this.consumeFood())
      .then(() => {
        this.isEating = false
        if (!this.bot.food === 20) {
          this.eat()
        } else {
          this.isEndEating = true
        }
      })
      .catch(() => {
        this.isEndEating = true
      })
  }

  consumeFood() {
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

  equipFood(food) {
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

  getFood() {
    console.log(this.bot.food)
    return this.bot.food
  }

  isFinished() {
    return this.isEndEating
  }

  getFodInInventory() {
    return this.bot.inventory.items().filter((item) => this.foods.includes(item.name))
  }
}
