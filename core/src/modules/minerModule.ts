
import { LegionStateMachineTargets } from "base-types"
import { Vec3 } from 'vec3'
import { placeBlockModule } from '@/modules'
import { Bot } from "mineflayer"

export const minerModule = (bot: Bot, targets: LegionStateMachineTargets) => {
  const blocksToBeRplaced = placeBlockModule(bot).blocksToBeRplaced

  const getSidesToCheck = (originalPosition: Vec3) => {
    const sidesToCheck = []

    let off
    const offsetX: number = bot.config.minerCords.orientation === 'x+' ? 1 : bot.config.minerCords.orientation === 'x-' ? -1 : 0
    const offsetZ: number = bot.config.minerCords.orientation === 'z+' ? 1 : bot.config.minerCords.orientation === 'z-' ? -1 : 0

    const backOffset = new Vec3(offsetX, 0, offsetZ)

    if (bot.config.minerCords.tunnel === 'vertically') {
      sidesToCheck.push({
        side: 'bottom',
        position: originalPosition.offset(0, -1, 0)
      })
    }

    if (
      bot.config.minerCords.tunnel === 'horizontally' &&
      originalPosition.y === targets.minerJob.original.yStart
    ) {
      sidesToCheck.push({
        side: 'bottom',
        position: originalPosition.offset(0, -1, 0)
      })
      sidesToCheck.push({
        side: 'backBottom',
        position: originalPosition.offset(offsetX, -1, offsetZ)
      })
    }

    if (
      bot.config.minerCords.tunnel === 'horizontally' &&
      originalPosition.y === targets.minerJob.original.yEnd
    ) {
      sidesToCheck.push({
        side: 'top',
        position: originalPosition.offset(0, 1, 0)
      })
      sidesToCheck.push({
        side: 'backTop',
        position: originalPosition.offset(offsetX, 1, offsetZ)
      })
    }

    if (
      bot.config.minerCords.tunnel === 'horizontally' &&
      (
        (bot.config.minerCords.orientation === 'x+' && originalPosition.z === targets.minerJob.original.zStart) ||
        (bot.config.minerCords.orientation === 'x-' && originalPosition.z === targets.minerJob.original.zEnd) ||
        (bot.config.minerCords.orientation === 'z+' && originalPosition.x === targets.minerJob.original.xEnd) ||
        (bot.config.minerCords.orientation === 'z-' && originalPosition.x === targets.minerJob.original.xStart)
      )
    ) {
      switch (bot.config.minerCords.orientation) {
        case 'x+':
          off = new Vec3(0, 0, -1)
          break
        case 'x-':
          off = new Vec3(0, 0, 1)
          break
        case 'z+':
          off = new Vec3(1, 0, 0)
          break
        case 'z-':
          off = new Vec3(-1, 0, 0)
          break
      }

      sidesToCheck.push({
        side: 'left',
        position: originalPosition.clone().add(off)
      })
      sidesToCheck.push({
        side: 'backLeft',
        position: originalPosition.clone().add(backOffset).add(off)
      })
    }

    if (
      bot.config.minerCords.tunnel === 'horizontally' &&
      (
        (bot.config.minerCords.orientation === 'x+' && originalPosition.z === targets.minerJob.original.zEnd) ||
        (bot.config.minerCords.orientation === 'x-' && originalPosition.z === targets.minerJob.original.zStart) ||
        (bot.config.minerCords.orientation === 'z+' && originalPosition.x === targets.minerJob.original.xStart) ||
        (bot.config.minerCords.orientation === 'z-' && originalPosition.x === targets.minerJob.original.xEnd)
      )
    ) {
      switch (bot.config.minerCords.orientation) {
        case 'x+':
          off = new Vec3(0, 0, 1)
          break
        case 'x-':
          off = new Vec3(0, 0, -1)
          break
        case 'z+':
          off = new Vec3(-1, 0, 0)
          break
        case 'z-':
          off = new Vec3(1, 0, 0)
          break
      }

      sidesToCheck.push({
        side: 'right',
        position: originalPosition.clone().add(off)
      })
      sidesToCheck.push({
        side: 'backRight',
        position: originalPosition.clone().add(backOffset).add(off)
      })
    }

    if (bot.config.minerCords.tunnel === 'horizontally') {
      sidesToCheck.push({
        side: 'back',
        position: originalPosition.offset(offsetX, 0, offsetZ)
      })
    }

    return sidesToCheck
  }

  const calculateSideToPlaceBlock = (position: Vec3) => {
    const sidesToPlaceBlock: Array<Vec3> = []

    const sidesToCheck = getSidesToCheck(position.clone())
    sidesToCheck.forEach((currentSideToCheck) => {
      const block = bot.blockAt(currentSideToCheck.position)
      if (block && blocksToBeRplaced.includes(block.name)) {
        sidesToPlaceBlock.push(currentSideToCheck.position.clone())
      }
    })

    return sidesToPlaceBlock
  }

  return {
    calculateSideToPlaceBlock,
    getSidesToCheck
  }
}
