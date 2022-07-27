//@ts-nocheck
import { Bot, LegionStateMachineTargets, MineCordsConfig } from "@/types"

import mineflayerPathfinder from 'mineflayer-pathfinder'
//@ts-ignore
import botWebsocket from '@modules/botWebsocket'
import { Vec3 } from 'vec3'

module.exports = class BehaviorMinerCheckLayer {

  readonly bot: Bot;
  readonly targets: LegionStateMachineTargets;
  stateName: string;

  isEndFinished: boolean;
  foundLavaOrWater: boolean;
  minerCords: MineCordsConfig | undefined;
  blocksToFind: Array<string>;
  floorBlocksToFind: Array<string>;

  yCurrent: number | undefined
  zCurrent: number | undefined
  xCurrent: number | undefined

  yStart: number | undefined
  zStart: number | undefined
  xStart: number | undefined

  yEnd: number | undefined
  zEnd: number | undefined
  xEnd: number | undefined

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCheckLayer'

    this.isEndFinished = false
    this.foundLavaOrWater = false

    this.blocksToFind = ['lava', 'water', 'bubble_column', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant']
    this.floorBlocksToFind = ['air', 'cave_air']
  }

  isFinished() {
    return this.isEndFinished
  }

  getFoundLavaOrWater() {
    return this.foundLavaOrWater
  }

  onStateEntered() {
    this.foundLavaOrWater = false
    this.isEndFinished = false

    this.checkArea()
  }

  onStateExited() {
    this.bot.pathfinder.setGoal(null)
    this.bot.removeAllListeners('customEventPhysicTick')

    // Reset positions for cehck again all blocks
    const stone = this.checkStoneInInventory()
    if (stone === undefined) {
      botWebsocket.log('No blocks for place into lava or water')
      this.targets.item = undefined
      this.isEndFinished = true
      return
    }

    this.targets.item = stone

    this.startBlock()
  }

  checkStoneInInventory() {
    return this.bot.inventory.items().find(item => this.targets.minerJob.blockForPlace.includes(item.name))
  }

  checkArea() {
    return new Promise(async (resolve) => {
      do {
        if (
          this.yCurrent === this.yEnd &&
          this.zCurrent === this.zEnd &&
          this.xCurrent === this.xEnd
        ) {
          this.isEndFinished = true
          resolve(true)
          return
        }

        this.next()

        if (
          this.minerCords.tunel === 'vertically' &&
          (
            (this.xCurrent === this.xEnd && this.zCurrent === this.zEnd) ||
            (this.xCurrent === this.xStart && this.zCurrent === this.zStart) ||
            (this.xCurrent === this.xEnd && this.zCurrent === this.zStart) ||
            (this.xCurrent === this.xStart && this.zCurrent === this.zEnd)
          )
        ) {
          continue
        }

        let block = this.getBlockType()
        if (!block) {
          botWebsocket.log(`Block: ${this.xCurrent} ${this.yCurrent} ${this.zCurrent} It is very far! I can't see the block, approaching the block to check it`)
          botWebsocket.log('Area less than 200 blocks radius distance is recommended')
          const position = new Vec3(this.xCurrent, this.yCurrent, this.zCurrent)
          await this.moveToSeeBlock(this.xCurrent, this.yCurrent, this.zCurrent)
          this.bot.removeAllListeners('customEventPhysicTick')
          block = this.getBlockType()
        }

        if (this.checkValidBlock(block)) {
          resolve(true)
          return
        }
      } while (true)
    })
  }

  next() {
    if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
      this.zNext()
    }
    if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
      this.xNext()
    }
  }

  xNext() {
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
      if (this.xStart < this.xEnd) {
        this.xCurrent++
      } else {
        this.xCurrent--
      }
    }
  }

  yNext() {
    this.yCurrent--
  }

  zNext() {
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
      if (this.zStart < this.zEnd) {
        this.zCurrent++
      } else {
        this.zCurrent--
      }
    }
  }

  getBlockType() {
    const position = new Vec3(this.xCurrent, this.yCurrent, this.zCurrent)
    return this.bot.blockAt(position)
  }

  setMinerCords(minerCords) {
    this.isLayerFinished = false
    this.minerCords = minerCords
    this.startBlock()
  }

  startBlock() {
    this.yStart = parseInt(this.minerCords.yStart) > parseInt(this.minerCords.yEnd) ? parseInt(this.minerCords.yStart) : parseInt(this.minerCords.yEnd)
    this.yEnd = parseInt(this.minerCords.yStart) > parseInt(this.minerCords.yEnd) ? parseInt(this.minerCords.yEnd) : parseInt(this.minerCords.yStart)

    this.yStart++
    if (this.minerCords.tunel === 'horizontally') {
      this.yEnd--
    }

    this.xStart = parseInt(this.minerCords.xStart) > parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xStart) : parseInt(this.minerCords.xEnd)
    this.xEnd = parseInt(this.minerCords.xStart) > parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xEnd) : parseInt(this.minerCords.xStart)

    switch (true) {
      case this.minerCords.orientation === 'x+':
        this.xStart = parseInt(this.minerCords.xStart) > parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xStart) : parseInt(this.minerCords.xEnd)
        this.xEnd = parseInt(this.minerCords.xStart) > parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xEnd) : parseInt(this.minerCords.xStart)
        this.zStart = parseInt(this.minerCords.zStart) > parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zStart) : parseInt(this.minerCords.zEnd)
        this.zEnd = parseInt(this.minerCords.zStart) > parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zEnd) : parseInt(this.minerCords.zStart)
        break
      case this.minerCords.orientation === 'x-':
        this.xStart = parseInt(this.minerCords.xStart) < parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xStart) : parseInt(this.minerCords.xEnd)
        this.xEnd = parseInt(this.minerCords.xStart) < parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xEnd) : parseInt(this.minerCords.xStart)
        this.zStart = parseInt(this.minerCords.zStart) < parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zStart) : parseInt(this.minerCords.zEnd)
        this.zEnd = parseInt(this.minerCords.zStart) < parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zEnd) : parseInt(this.minerCords.zStart)
        break
      case this.minerCords.orientation === 'z+':
        this.xStart = parseInt(this.minerCords.xStart) > parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xStart) : parseInt(this.minerCords.xEnd)
        this.xEnd = parseInt(this.minerCords.xStart) > parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xEnd) : parseInt(this.minerCords.xStart)
        this.zStart = parseInt(this.minerCords.zStart) < parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zStart) : parseInt(this.minerCords.zEnd)
        this.zEnd = parseInt(this.minerCords.zStart) < parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zEnd) : parseInt(this.minerCords.zStart)
        break
      case this.minerCords.orientation === 'z-':
        this.xStart = parseInt(this.minerCords.xStart) < parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xStart) : parseInt(this.minerCords.xEnd)
        this.xEnd = parseInt(this.minerCords.xStart) < parseInt(this.minerCords.xEnd) ? parseInt(this.minerCords.xEnd) : parseInt(this.minerCords.xStart)
        this.zStart = parseInt(this.minerCords.zStart) > parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zStart) : parseInt(this.minerCords.zEnd)
        this.zEnd = parseInt(this.minerCords.zStart) > parseInt(this.minerCords.zEnd) ? parseInt(this.minerCords.zEnd) : parseInt(this.minerCords.zStart)
        break
    }

    let temp

    if (this.minerCords.reverse && this.minerCords.tunel === 'vertically' && (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-')) {
      temp = this.xStart
      this.xStart = this.xEnd
      this.xEnd = temp
    }

    if (this.minerCords.reverse && this.minerCords.tunel === 'vertically' && (this.minerCords.orientation === 'z+' || this.minerCords.orientation === 'z-')) {
      temp = this.zStart
      this.zStart = this.zEnd
      this.zEnd = temp
    }

    if (this.minerCords.tunel === 'vertically') {
      if (this.xStart > this.xEnd) {
        this.xStart++
        this.xEnd--
      } else {
        this.xStart--
        this.xEnd++
      }

      if (this.zStart > this.zEnd) {
        this.zStart++
        this.zEnd--
      } else {
        this.zStart--
        this.zEnd++
      }
    }

    this.yCurrent = parseInt(this.yStart)
    this.xCurrent = parseInt(this.xStart)
    this.zCurrent = parseInt(this.zStart)
  }

  checkValidBlock(block) {
    if (this.blocksToFind.includes(block.name) ||
      (
        this.floorBlocksToFind.includes(block.name) &&
        this.minerCords.tunel === 'horizontally' &&
        (this.minerCords.yStart - 1) === this.yCurrent
      )
    ) {
      this.targets.position = block.position
      this.foundLavaOrWater = true
      return true
    }

    return false
  }

  moveToSeeBlock(x: number, y: number, z: number) {
    return new Promise((resolve) => {
      const goal = new mineflayerPathfinder.goals.GoalBlock(x, y, z)
      this.bot.pathfinder.setMovements(this.targets.movements)
      this.bot.pathfinder.setGoal(goal)

      this.bot.on('customEventPhysicTick', () => {
        const block = this.getBlockType()
        if (block) {
          this.bot.pathfinder.setGoal(null)
          resolve(true)
        }
      })
    })
  }
}
