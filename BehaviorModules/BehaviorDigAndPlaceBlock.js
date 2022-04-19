const botWebsocket = require('@modules/botWebsocket')
module.exports = class template {
  constructor(bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDigAndPlaceBlock'

    this.digBlock = require('@modules/digBlockModule')(bot).digBlock
    this.placeBlockModule = require('@modules/placeBlockModule')(bot).place
    this.equipHeldItem = require('@modules/inventoryModule')(bot).equipHeldItem
    this.calculateSideToPlaceBlock = require('@modules/minerModule')(bot, targets).calculateSideToPlaceBlock
    this.getNewPositionForPlaceBlock = require('@modules/placeBlockModule')(bot).getNewPositionForPlaceBlock
    this.blocksCanBeReplaced = require('@modules/placeBlockModule')(bot).blocksCanBeReplaced
    this.getPathToPlace = require('@modules/placeBlockModule')(bot).getPathToPlace
    this.place = require('@modules/placeBlockModule')(bot).place

    this.isEndFinished = false
    this.sidesToPlaceBlock = []
  }

  isFinished() {
    return this.isEndFinished
  }

  isOutOfBlocks() {
    return this.outOfBlocks
  }

  onStateExited() {
    this.isEndFinished = false
    this.outOfBlocks = false
    clearTimeout(this.timeLimit)
  }

  onStateEntered() {
    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for place item')
      this.isEndFinished = true
    }, 9000)

    this.isEndFinished = false
    this.outOfBlocks = false

    if (this.targets.position == null) {
      botWebsocket.log('No exists targets.position')
      this.isEndFinished = true
      return
    }

    this.sidesToPlaceBlock = this.calculateSideToPlaceBlock(this.targets.minerJob.mineBlock.clone())


    this.digBlock(this.targets.position)
      .then(() => this.placeBlocksBucle())
      .then(() => {
        this.isEndFinished = true
      })
      .catch(() => {
        botWebsocket.log(`Error on place block ${this.targets.position}`)
        this.isEndFinished = true
      })
  }

  getItemToPlace() {
    return this.bot.inventory.items().find(item => this.targets.minerJob.blockForPlace.includes(item.name))
  }

  equipAndPlace(placeBlockTo, newPosition, blockOffset) {
    return new Promise((resolve, reject) => {
      const item = this.getItemToPlace()
      if (!item) {
        this.outOfBlocks = true
        this.isEndFinished = true
        return
      }

      const block = this.bot.blockAt(placeBlockTo)

      if (block.name === 'kelp') {
        this.digBlock(placeBlockTo)
          .then(() => this.equipHeldItem(item.name))
          .then(() => this.place(newPosition, blockOffset))
          .then(resolve)
          .catch(reject)
      } else {
        this.equipHeldItem(item.name)
          .then(() => this.place(newPosition, blockOffset))
          .then(resolve)
          .catch(reject)
      }

    })
  }



  placeBlocksBucle() {
    return new Promise((resolve, reject) => {
      if (this.sidesToPlaceBlock.length === 0) {
        this.isEndFinished = true
        resolve()
        return
      }

      const currentSideToPlaceBlock = this.sidesToPlaceBlock.shift()
      this.listPlaceBlocks = this.getPathToPlace(currentSideToPlaceBlock)

      this.placeBlocks()
        .then(() => this.placeBlocksBucle())
        .then(resolve)
        .catch(reject)
    })
  }

  placeBlocks() {
    return new Promise((resolve, reject) => {
      if (this.listPlaceBlocks.length === 0) {
        resolve()
        return
      }

      const placeBlockTo = this.listPlaceBlocks.shift().position.clone()

      const { newPosition, blockOffset } = this.getNewPositionForPlaceBlock(placeBlockTo)
      if (!this.blocksCanBeReplaced.includes(this.bot.blockAt(placeBlockTo).name)) {
        this.digBlock(placeBlockTo)
          .then(() => this.equipAndPlace(placeBlockTo, newPosition, blockOffset))
          .then(() => this.placeBlocks())
          .then(resolve)
          .catch(reject)
      } else {
        this.equipAndPlace(placeBlockTo, newPosition, blockOffset)
          .then(() => this.placeBlocks())
          .then(resolve)
          .catch(reject)
      }
    })
  }


}
