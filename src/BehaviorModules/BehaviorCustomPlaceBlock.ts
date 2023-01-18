
import botWebsocket from '@/modules/botWebsocket'
import digBlockModule from '@/modules/digBlockModule'
import placeBlockModule from '@/modules/placeBlockModule'
import inventoryModule from '@/modules/inventoryModule'
import { Vec3 } from "vec3"
import { StateBehavior } from "mineflayer-statemachine"
import { Bot, LegionStateMachineTargets } from '@/types'
export default class BehaviorCustomPlaceBlock implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  isEndFinished: boolean
  canJump: boolean
  canReplaceBlock: boolean
  equipHeldItem: (itemName: string) => Promise<void>
  digBlock: (position: Vec3) => Promise<void>
  place: (position: Vec3, offset: Vec3, canJump?: boolean) => Promise<void>
  blocksCanBeReplaced: Array<string>
  itemNotFound: boolean
  cantPlaceBlock: boolean
  offset?: Vec3
  timeLimit?: ReturnType<typeof setTimeout>

  constructor(bot: Bot, targets: LegionStateMachineTargets, canJump: boolean = true, canReplaceBlock: boolean = false) {
    this.active = false
    const { blocksCanBeReplaced, place } = placeBlockModule(bot)
    this.bot = bot
    this.targets = targets
    this.stateName = 'Custom BehaviorPlaceBlock '
    this.equipHeldItem = inventoryModule(bot).equipHeldItem
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

  setOffset(offset: Vec3) {
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

    if (!this.offset) {
      throw new Error('Offset is not inserted')
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

  placeBlock(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.equipHeldItem(this.targets.item.name)
        .then(() => {

          if (!this.targets.position) {
            reject('Target position is not definied')
            return
          }
          if (!this.offset) {
            reject('Offset is not definied')
            return
          }

          this.place(this.targets.position, this.offset, this.canJump)
            .then(() => {
              this.isEndFinished = true
              resolve()
            })
            .catch(() => {
              this.cantPlaceBlock = true
              this.isEndFinished = true
              reject()
            })
        })
    })
  }
}
