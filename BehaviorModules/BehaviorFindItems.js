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
    if (this.checkInventorySpace() <= 3) {
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
    return entities.find((entityName) => {
      const entity = this.bot.entities[entityName]

      if (entity.position.distanceTo(this.bot.entity.position) < this.distanceToFind && (
        !this.isOnFloor ||
        Math.abs(entity.position.y - this.bot.entity.position.y) <= 1
      )) {
        if (entity.objectType === 'Item' /* || entity.objectType === 'Arrow' */) {
          this.targets.itemDrop = entity
          this.isEndFinished = true
          return true
        }
      }
      return false
    })
  }

  checkInventorySpace () {
    const inventory = this.bot.inventory.slots
    const spaceLeft = inventory.reduce((currentSpace, slot) => {
      if (slot === null) {
        currentSpace++
      }
      return currentSpace
    }, 0) - 5

    return spaceLeft
  }
}
