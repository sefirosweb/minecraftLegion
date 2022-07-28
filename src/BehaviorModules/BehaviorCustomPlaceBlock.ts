
// @ts-nocheck
import { Bot, LegionStateMachineTargets } from "@/types"
import botWebsocket from '@/modules/botWebsocket'
import digBlockModule from '@/modules/digBlockModule'
import placeBlockModule from '@/modules/placeBlockModule'
module.exports = class BehaviorCustomPlaceBlock {

  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean
  canJump: boolean
  canReplaceBlock: boolean


  constructor(bot: Bot, targets: LegionStateMachineTargets, canJump: boolean = true, canReplaceBlock: boolean = false) {
    const { blocksCanBeReplaced, place } = placeBlockModule(bot)
    this.bot = bot
    this.targets = targets
    this.stateName = 'Custom BehaviorPlaceBlock '
    this.equipHeldItem = require('@modules/inventoryModule')(bot).equipHeldItem
    this.digBlock = digBlockModule(bot).digBlock
    this.place = place
    this.blocksCanBeReplaced = blocksCanBeReplaced

    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false
    this.canJump = canJump
    this.canReplaceBlock = canReplaceBlock
  }

  isFinished() {
    return this.isEndFinished
  }

  isItemNotFound() {
    return this.itemNotFound
  }

  isCantPlaceBlock() {
    return this.cantPlaceBlock
  }

  setCanJump(canJump: boolean) {
    this.canJump = canJump
  }

  setOffset(offset: boolean) {
    this.offset = offset
  }

  onStateExited() {
    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false
    clearTimeout(this.timeLimit)
  }

  onStateEntered() {
    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for place item')
      this.isEndFinished = true
    }, 7000)

    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false

    if (this.targets.item == null) {
      botWebsocket.log('No exists targets.item')
      this.isEndFinished = true
      return
    }

    if (this.targets.position == null) {
      botWebsocket.log('No exists targets.position')
      this.isEndFinished = true
      return
    }

    const block = this.bot.blockAt(this.targets.position.clone().add(this.offset))

    if (block == null) {
      botWebsocket.log('Cant find block')
      this.isEndFinished = true
      return
    }

    if (block.name === this.targets.item.name) {
      botWebsocket.log('The block is same')
      this.isEndFinished = true
      return
    }

    if (!this.blocksCanBeReplaced.includes(block.name)) {
      if (this.canReplaceBlock) {
        this.digBlock(block.position)
          .then(() => this.placeBlock())
      } else {
        botWebsocket.log(`Cant s block there ${block.name}`)
        this.cantPlaceBlock = true
      }
    } else {
      this.placeBlock()
    }
  }

  placeBlock() {
    return new Promise(() => {
      this.equipHeldItem(this.targets.item.name)
        .then(() => {
          this.place(this.targets.position, this.offset)
            .then(() => {
              this.isEndFinished = true
            })
            .catch(() => {
              this.cantPlaceBlock = true
              this.isEndFinished = true
            })
        })
    })
  }
}
