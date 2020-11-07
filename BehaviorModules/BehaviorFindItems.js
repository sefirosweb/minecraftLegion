module.exports = class BehaviorFindItems {
  constructor (bot, targets, distanceToFind = 15) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorFindItems'

    this.isEndFinished = false
    this.distanceToFind = distanceToFind
  }

  onStateEntered () {
    this.isEndFinished = false
    this.search()
  }

  onStateExited () {
    this.isEndFinished = false
  }

  isFinished () {
    return this.isEndFinished
  }

  search () {
    return Object.keys(this.bot.entities).find((entityName) => {
      const entity = this.bot.entities[entityName]

      if (entity.position.distanceTo(this.bot.entity.position) < this.distanceToFind) {
        if (entity.objectType === 'Item' /* || entity.objectType === 'Arrow' */) {
          this.targets.itemDrop = entity
          this.targets.position = entity.position
          this.isEndFinished = true
          // console.log(entity)
          return true
        }

        return false
      }
    })
  }
}
