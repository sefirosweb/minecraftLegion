
import { Item, LegionStateMachineTargets, PositionsChecked } from "base-types"
import botWebsocket from '@/modules/botWebsocket'
import digBlockModule from '@/modules/digBlockModule'
import minerModule from '@/modules/minerModule'
import placeBlockModule from '@/modules/placeBlockModule'
import inventoryModule from '@/modules/inventoryModule'
import { Vec3 } from "vec3"
import { StateBehavior } from "mineflayer-statemachine"
import { Bot } from "mineflayer"

type ItemWithHardness = Item & {
  name: NonNullable<Item['name']>
  hardness: number
}

export class BehaviorDigAndPlaceBlock implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean

  digBlock: (position: Vec3) => Promise<void>
  place: (position: Vec3, offset: Vec3, canJump?: boolean) => Promise<void>
  equipHeldItem: (itemName: string) => Promise<void>
  calculateSideToPlaceBlock: (position: Vec3) => Array<Vec3>
  getPathToPlace: (position: Vec3) => Array<PositionsChecked>

  getNewPositionForPlaceBlock: (position: Vec3) => { // TODO CHECK
    newPosition: Vec3 | undefined;
    blockOffset: Vec3 | undefined;
    offset: Vec3 | undefined;
  }

  blocksCanBeReplaced: Array<string> // TODO CHECK
  sidesToPlaceBlock: Array<Vec3>
  outOfBlocks: boolean
  timeLimit?: ReturnType<typeof setTimeout>
  listPlaceBlocks?: Array<PositionsChecked>

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    const { blocksCanBeReplaced, place, getPathToPlace, getNewPositionForPlaceBlock } = placeBlockModule(bot)
    const { equipHeldItem } = inventoryModule(bot)
    const { calculateSideToPlaceBlock } = minerModule(bot, targets)
    const { digBlock } = digBlockModule(bot)

    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDigAndPlaceBlock'

    this.place = place
    this.digBlock = digBlock
    this.equipHeldItem = equipHeldItem
    this.calculateSideToPlaceBlock = calculateSideToPlaceBlock
    this.getNewPositionForPlaceBlock = getNewPositionForPlaceBlock
    this.getPathToPlace = getPathToPlace
    this.blocksCanBeReplaced = blocksCanBeReplaced

    this.isEndFinished = false
    this.sidesToPlaceBlock = []
    this.outOfBlocks = false
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

    const item: ItemWithHardness = items.map(i => {
      return {
        id: i.type,
        quantity: 1,
        name: i.name,
        hardness: this.bot.mcData.blocksByName[i.name].hardness ?? Infinity
      }
    }).sort((a, b) => a.hardness - b.hardness)[0]

    return item
  }

  equipAndPlace(placeBlockTo: Vec3, newPosition: Vec3, blockOffset: Vec3) {
    return new Promise((resolve, reject) => {
      const item = this.getItemToPlace()
      if (!item) {
        this.outOfBlocks = true
        this.isEndFinished = true
        return
      }

      const block = this.bot.blockAt(placeBlockTo)

      if (block && ['kelp', 'kelp_plant'].includes(block.name)) {
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

  placeBlocksBucle(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sidesToPlaceBlock.length === 0) {
        this.isEndFinished = true
        resolve()
        return
      }

      const currentSideToPlaceBlock = this.sidesToPlaceBlock.shift()
      if (!currentSideToPlaceBlock) {
        resolve()
        return
      }

      this.listPlaceBlocks = this.getPathToPlace(currentSideToPlaceBlock)

      this.placeBlocks()
        .then(() => this.placeBlocksBucle())
        .then(resolve)
        .catch(reject)
    })
  }

  placeBlocks(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.listPlaceBlocks || this.listPlaceBlocks.length === 0) {
        resolve()
        return
      }

      const nextPlaceBlockTo = this.listPlaceBlocks.shift()
      if (!nextPlaceBlockTo) {
        resolve()
        return
      }

      const placeBlockTo = nextPlaceBlockTo.position.clone()

      const { newPosition, blockOffset } = this.getNewPositionForPlaceBlock(placeBlockTo)

      const targetBlock = this.bot.blockAt(placeBlockTo)

      if (!targetBlock) {
        reject(new Error('No block found!'))
        return
      }

      if (!newPosition) {
        reject(new Error('Not found new newPosition!'))
        return
      }

      if (!blockOffset) {
        reject(new Error('Not found new blockOffset!'))
        return
      }

      if (!this.blocksCanBeReplaced.includes(targetBlock.name)) {
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
