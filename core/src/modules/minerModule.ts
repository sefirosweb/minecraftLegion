
import { LegionStateMachineTargets } from "base-types"
import { Vec3 } from 'vec3'
import placeBlockModule from '@/modules/placeBlockModule'
import { Bot } from "mineflayer"

const minerModule = (bot: Bot, targets: LegionStateMachineTargets) => {
  const blocksToBeRplaced = placeBlockModule(bot).blocksToBeRplaced

  const getSidesToCheck = (originalPosition: Vec3) => {
    const sidesToCheck = []

    let off
    const offsetX: number = targets.config.minerCords.orientation === 'x+' ? 1 : targets.config.minerCords.orientation === 'x-' ? -1 : 0
    const offsetZ: number = targets.config.minerCords.orientation === 'z+' ? 1 : targets.config.minerCords.orientation === 'z-' ? -1 : 0

    const backOffset = new Vec3(offsetX, 0, offsetZ)

    if (targets.config.minerCords.tunel === 'vertically') {
      sidesToCheck.push({
        side: 'bottom',
        position: originalPosition.offset(0, -1, 0)
      })
    }

    if (
      targets.config.minerCords.tunel === 'horizontally' &&
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
      targets.config.minerCords.tunel === 'horizontally' &&
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
      targets.config.minerCords.tunel === 'horizontally' &&
      (
        (targets.config.minerCords.orientation === 'x+' && originalPosition.z === targets.minerJob.original.zStart) ||
        (targets.config.minerCords.orientation === 'x-' && originalPosition.z === targets.minerJob.original.zEnd) ||
        (targets.config.minerCords.orientation === 'z+' && originalPosition.x === targets.minerJob.original.xEnd) ||
        (targets.config.minerCords.orientation === 'z-' && originalPosition.x === targets.minerJob.original.xStart)
      )
    ) {
      switch (targets.config.minerCords.orientation) {
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
      targets.config.minerCords.tunel === 'horizontally' &&
      (
        (targets.config.minerCords.orientation === 'x+' && originalPosition.z === targets.minerJob.original.zEnd) ||
        (targets.config.minerCords.orientation === 'x-' && originalPosition.z === targets.minerJob.original.zStart) ||
        (targets.config.minerCords.orientation === 'z+' && originalPosition.x === targets.minerJob.original.xStart) ||
        (targets.config.minerCords.orientation === 'z-' && originalPosition.x === targets.minerJob.original.xEnd)
      )
    ) {
      switch (targets.config.minerCords.orientation) {
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

    if (targets.config.minerCords.tunel === 'horizontally') {
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

export default minerModule