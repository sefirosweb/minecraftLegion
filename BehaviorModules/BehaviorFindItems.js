module.exports = class BehaviorFindItems {
  constructor (bot, targets, distanceToFind = 15, isOnFloor = false) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorFindItems'
    this.isEndFinished = false

    this.distanceToFind = distanceToFind
    this.isOnFloor = isOnFloor
  }

  onStateEntered () {
    this.targets.itemDrop = undefined
    this.isEndFinished = false
    if (this.bot.inventory.items().length >= 33) {
      this.isEndFinished = true
      return
    }

    this.search()
    this.isEndFinished = true
  }

  onStateExited () {
    this.isEndFinished = false
  }

  isFinished () {
    return this.isEndFinished
  }

  search () {
    if (!this.targets.config.pickUpItems) return false

    const entities = Object.keys(this.bot.entities)

    const itemsFound = entities.reduce((currentItems, entityName) => {
      const newItems = [...currentItems]
      const entity = this.bot.entities[entityName]
      const disatanceToObject = entity.position.distanceTo(this.bot.entity.position)
      if (disatanceToObject < this.distanceToFind && (
        !this.isOnFloor ||
        Math.abs(entity.position.y - this.bot.entity.position.y) <= 1
      )) {
        if (entity.objectType === 'Item' /* || entity.objectType === 'Arrow' */) {
          entity.disatanceToObject = disatanceToObject
          newItems.push(entity)
        }
      }
      return newItems
    }, [])

    if (itemsFound.length > 0) {
      itemsFound.sort(function (a, b) {
        return a.disatanceToObject - b.disatanceToObject
      })
      this.targets.itemDrop = itemsFound[0]
      this.isEndFinished = true
      return true
    }

    return false
  }
}
