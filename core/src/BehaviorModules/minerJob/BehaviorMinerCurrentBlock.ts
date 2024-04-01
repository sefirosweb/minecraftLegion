import { LegionStateMachineTargets, MineCordsConfig } from 'base-types'
import { Bot } from 'mineflayer';
import { StateBehavior } from 'mineflayer-statemachine';
import { Vec3 } from 'vec3'
export default class BehaviorMinerCurrentBlock implements StateBehavior {
  active: boolean;
  readonly bot: Bot;
  readonly targets: LegionStateMachineTargets;
  stateName: string;
  isEndFinished: boolean

  isLayerFinished: boolean
  firstBlockOnLayer: boolean

  ignoredBlocksToMine: Array<string>
  minerCords: MineCordsConfig | undefined

  yCurrent: number | undefined
  zCurrent: number | undefined
  xCurrent: number | undefined

  yStart: number | undefined
  zStart: number | undefined
  xStart: number | undefined

  yEnd: number | undefined
  zEnd: number | undefined
  xEnd: number | undefined

  getBlockInfo: boolean

  x?: number
  y?: number

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentBlock'

    this.ignoredBlocksToMine = ['air', 'cave_air', 'lava', 'water', 'bubble_column', 'bedrock', 'torch', 'wall_torch', 'redstone_torch', 'redstone_wall_torch', 'soul_torch', 'soul_wall_torch', 'lantern', 'snow']

    this.isLayerFinished = false
    this.isEndFinished = false
    this.firstBlockOnLayer = true
    this.getBlockInfo = false
  }

  isFinished() {
    return this.isEndFinished
  }

  canGetBlockInfo() {
    return this.getBlockInfo
  }

  getLayerIsFinished() {
    return this.isLayerFinished
  }

  setMinerCords(minerCords: MineCordsConfig) {
    this.isLayerFinished = false
    this.firstBlockOnLayer = true
    this.minerCords = minerCords
    this.startBlock()
  }

  startBlock() {
    if (this.minerCords === undefined) {
      throw new Error('No setted: this.minerCords === undefined')
    }

    this.yStart = this.minerCords.yStart > this.minerCords.yEnd ? this.minerCords.yEnd : this.minerCords.yStart
    this.yEnd = this.minerCords.yStart > this.minerCords.yEnd ? this.minerCords.yStart : this.minerCords.yEnd

    this.xStart = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xEnd : this.minerCords.xStart
    this.xEnd = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xStart : this.minerCords.xEnd

    this.zStart = this.minerCords.zStart > this.minerCords.zEnd ? this.minerCords.zEnd : this.minerCords.zStart
    this.zEnd = this.minerCords.zStart > this.minerCords.zEnd ? this.minerCords.zStart : this.minerCords.zEnd

    let temp

    if (this.minerCords.reverse && this.minerCords.tunnel === 'vertically' && (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-')) {
      temp = this.xStart
      this.xStart = this.xEnd
      this.xEnd = temp
    }

    if (this.minerCords.reverse && this.minerCords.tunnel === 'vertically' && (this.minerCords.orientation === 'z+' || this.minerCords.orientation === 'z-')) {
      temp = this.zStart
      this.zStart = this.zEnd
      this.zEnd = temp
    }

    if (this.minerCords.tunnel === 'vertically') {
      if (this.minerCords.orientation === 'z+' || this.minerCords.orientation === 'x-') {
        let temp = this.xStart

        this.xStart = this.xEnd
        this.xEnd = temp

        temp = this.zStart
        this.zStart = this.zEnd
        this.zEnd = temp
      }
    }

    this.yCurrent = this.yStart
    this.xCurrent = this.xStart
    this.zCurrent = this.zStart
  }

  onStateEntered() {
    this.isEndFinished = false
    this.getBlockInfo = false
    this.startBlock()
    this.isEndFinished = this.checkSand()
    if (!this.isEndFinished) {
      this.firstBlockOnLayer = true
      this.startBlock()
      this.isEndFinished = this.nextBlock(true)
    }
  }

  checkSand() {
    if (this.minerCords === undefined) {
      throw new Error('No setted: this.minerCords === undefined')
    }


    if (this.minerCords.tunnel === 'vertically') {
      return false
    }

    const temp = this.yEnd
    this.yEnd = this.yStart
    this.yStart = temp
    this.yCurrent = this.yStart

    return this.nextBlock(false)
  }

  nextBlock(allBlocks: boolean): boolean {
    if (this.minerCords === undefined) {
      throw new Error('No setted: this.minerCords === undefined')
    }

    do {
      if (this.yCurrent === this.yEnd && this.zCurrent === this.zEnd && this.xCurrent === this.xEnd) {
        if (allBlocks) {
          this.isLayerFinished = true
        }
        return false
      }

      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.zNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
        this.xNext()
      }

    } while (!this.calculateIsValid(allBlocks))

    return true
  }

  calculateIsValid(allBlocks: boolean) {
    if (this.xCurrent === undefined || this.yCurrent === undefined || this.zCurrent === undefined) {
      throw new Error('No setted: this.xCurrent === undefined || this.yCurrent === undefined || this.zCurrent === undefined')
    }

    const position = new Vec3(this.xCurrent, this.yCurrent, this.zCurrent)

    if (!allBlocks) {
      position.add(new Vec3(0, 1, 0))
    }

    const block = this.bot.blockAt(position)
    if (!block) {
      this.getBlockInfo = false
      this.targets.position = position
      this.targets.position.dimension = this.bot.config.minerCords.world
      return true
    }

    const isValidBlockType = this.ignoredBlocksToMine.find(b => b === block.name)
    if (isValidBlockType === undefined &&
      (
        allBlocks || ['sand', 'gravel'].includes(block.name)
      )
    ) {
      this.getBlockInfo = true
      this.targets.position = block.position // I detect is not air / lava / water then go to this position
      return true
    }

    return false
  }

  yNext() {
    if (this.yCurrent === undefined || this.yEnd === undefined) {
      throw new Error('No setted: this.yCurrent === undefined || this.yEnd === undefined')
    }
    if (this.yCurrent < this.yEnd) {
      this.yCurrent++
    } else {
      this.yCurrent--
    }
  }

  xNext() {
    if (this.minerCords === undefined || this.xCurrent === undefined || this.xStart === undefined || this.xEnd === undefined) {
      throw new Error('No setted: this.minerCords === undefined || this.xCurrent === undefined || this.xStart === undefined || this.xEnd === undefined')
    }

    if (this.xCurrent === this.xEnd) {
      const temp = this.xEnd
      this.xEnd = this.xStart
      this.xStart = temp
      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.yNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
        this.zNext()
      }
    } else {
      if (this.firstBlockOnLayer) {
        this.firstBlockOnLayer = false
      } else {
        if (this.xStart < this.xEnd) {
          this.xCurrent++
        } else {
          this.xCurrent--
        }
      }
    }
  }

  zNext() {
    if (this.minerCords === undefined || this.zStart === undefined || this.zEnd === undefined || this.zCurrent === undefined) {
      throw new Error('No setted: this.minerCords === undefined || this.zStart === undefined || this.zEnd === undefined || this.zCurrent === undefined')
    }

    if (this.zCurrent === this.zEnd) {
      const temp = this.zEnd
      this.zEnd = this.zStart
      this.zStart = temp
      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.xNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
        this.yNext()
      }
    } else {
      if (this.firstBlockOnLayer) {
        this.firstBlockOnLayer = false
      } else {
        if (this.zStart < this.zEnd) {
          this.zCurrent++
        } else {
          this.zCurrent--
        }
      }
    }
  }

  getCurrentBlock() {
    const currentBlock = {
      x: this.xCurrent,
      y: this.yCurrent,
      z: this.zCurrent
    }
    return currentBlock
  }
}
