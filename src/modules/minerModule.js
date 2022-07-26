const vec3 = require('vec3')

module.exports = function (bot, targets) {
  const blocksToBeRplaced = require('@modules/placeBlockModule')(bot).blocksToBeRplaced

  const getSidesToCheck = (originalPosition) => {
    const sidesToCheck = []

    let off
    const offsetX = targets.config.minerCords.orientation === 'x+' ? 1 : targets.config.minerCords.orientation === 'x-' ? -1 : 0
    const offsetZ = targets.config.minerCords.orientation === 'z+' ? 1 : targets.config.minerCords.orientation === 'z-' ? -1 : 0

    const backOffset = vec3(offsetX, 0, offsetZ)

    if (targets.config.minerCords.tunel === 'vertically') {
      sidesToCheck.push({
        side: 'bottom',
        position: originalPosition.offset(0, -1, 0)
      })
    }

    if (
      targets.config.minerCords.tunel === 'horizontally' &&
      parseInt(originalPosition.y) === parseInt(targets.minerJob.original.yStart)
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
      parseInt(originalPosition.y) === parseInt(targets.minerJob.original.yEnd)
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
        (targets.config.minerCords.orientation === 'x+' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zStart)) ||
        (targets.config.minerCords.orientation === 'x-' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zEnd)) ||
        (targets.config.minerCords.orientation === 'z+' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xEnd)) ||
        (targets.config.minerCords.orientation === 'z-' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xStart))
      )
    ) {
      switch (targets.config.minerCords.orientation) {
        case 'x+':
          off = vec3(0, 0, -1)
          break
        case 'x-':
          off = vec3(0, 0, 1)
          break
        case 'z+':
          off = vec3(1, 0, 0)
          break
        case 'z-':
          off = vec3(-1, 0, 0)
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
        (targets.config.minerCords.orientation === 'x+' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zEnd)) ||
        (targets.config.minerCords.orientation === 'x-' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zStart)) ||
        (targets.config.minerCords.orientation === 'z+' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xStart)) ||
        (targets.config.minerCords.orientation === 'z-' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xEnd))
      )
    ) {
      switch (targets.config.minerCords.orientation) {
        case 'x+':
          off = vec3(0, 0, 1)
          break
        case 'x-':
          off = vec3(0, 0, -1)
          break
        case 'z+':
          off = vec3(-1, 0, 0)
          break
        case 'z-':
          off = vec3(1, 0, 0)
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

  const calculateSideToPlaceBlock = (position) => {
    const sidesToPlaceBlock = []

    const sidesToCheck = getSidesToCheck(position.clone())
    sidesToCheck.forEach((currentSideToCheck) => {
      const block = bot.blockAt(currentSideToCheck.position)
      if (blocksToBeRplaced.includes(block.name)) {
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
