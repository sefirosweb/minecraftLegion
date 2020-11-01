const lodash = require('lodash');
const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorEatFood {
  constructor(bot, targets, foods = []) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEatFood'

    this.priority = 'saturation' // saturation or foodPoints

    // If no food introduced then get all foods
    if (foods.length === 0) {
      const mcData = require('minecraft-data')(bot.version)
      const mcDataFoods = mcData.foodsArray
      this.foods = mcDataFoods.map((item) => item.name)
    } else {
      this.foods = foods
    }

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

    // Check if in inventory have food
    const available_food = this.bot.inventory.items().reduce((valid_food, food) => {
      const return_valid_food = [...valid_food]
      if (this.foods.includes(food.name)) {
        return_valid_food.push(food)
      }
      return return_valid_food
    }, [])

    if (available_food.length === 0) {
      botWebsocket.log("No food in inventory ")
      this.isEndEating = true
      return
    }

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
      .catch((error) => {
        botWebsocket.log('Error on eat food ' + error)
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

  isFinished() {
    return this.isEndEating
  }

}
