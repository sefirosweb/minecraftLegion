
// @ts-nocheck

import { Bot, LegionStateMachineTargets } from "@/types"
import botWebsocket from '@/modules/botWebsocket'
import digBlockModule from '@/modules/digBlockModule'
import minerModule from '@/modules/minerModule'
import placeBlockModule from '@/modules/placeBlockModule'
import inventoryModule from '@/modules/inventoryModule'

module.exports = class template {

  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    const { blocksCanBeReplaced, place, getPathToPlace, getNewPositionForPlaceBlock } = placeBlockModule(bot)

    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDigAndPlaceBlock'

    this.digBlock = digBlockModule(bot).digBlock
    this.placeBlockModule = place
    this.equipHeldItem = inventoryModule(bot).equipHeldItem
    this.calculateSideToPlaceBlock = minerModule(bot, targets).calculateSideToPlaceBlock
    this.getNewPositionForPlaceBlock = getNewPositionForPlaceBlock
    this.blocksCanBeReplaced = blocksCanBeReplaced
    this.getPathToPlace = getPathToPlace
    this.place = place

    this.isEndFinished = false
    this.sidesToPlaceBlock = []

    this.mcData = require('minecraft-data')(this.bot.version)
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
      this.bot.stopDigging()
      this.isEndFinished = true
    }, 15000)

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
    const items = this.bot.inventory.items().filter(item => this.targets.minerJob.blockForPlace.includes(item.name))
    if (items.length === 0) {
      return undefined
    }

    const item = items.map(i => {
      i.hardness = this.mcData.blocksByName[i.name].hardness
      return i
    }).sort((a, b) => a.hardness - b.hardness)[0]

    return item
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
