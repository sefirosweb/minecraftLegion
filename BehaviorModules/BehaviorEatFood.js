const lodash = require('lodash')
const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorEatFood {
  constructor (bot, targets, foods = []) {
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

  onStateEntered () {
    if (this.bot.food === 20) {
      this.isEndEating = true
    } else {
      this.eat()
    }
  }

  onStateExited () {
    this.isEating = false
    this.isEndEating = false
  }

  eat () {
    this.isEating = true

    // Check if in inventory have food
    const availableFood = this.bot.inventory.items().reduce((validFood, food) => {
      const returnValidFood = [...validFood]
      if (this.foods.includes(food.name)) {
        returnValidFood.push(food)
      }
      return returnValidFood
    }, [])

    if (availableFood.length === 0) {
      botWebsocket.log('No food in inventory ')
      this.isEndEating = true
      return
    }

    let bestFood

    if (this.priority === 'foodPoints') {
      bestFood = availableFood.find((item) => item.foodPoints === lodash.maxBy(availableFood, 'foodPoints'))
    } else {
      bestFood = availableFood.find((item) => item.saturation === lodash.maxBy(availableFood, 'saturation'))
    }

    if (!bestFood) {
      this.isEndEating = true
      return
    }

    this.equipFood(bestFood)
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
