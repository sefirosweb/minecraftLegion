const vec3 = require('vec3')

module.exports = function (bot) {
  const blocksCanBeReplaced = ['air', 'cave_air', 'lava', 'water', 'bubble_column', 'seagrass', 'tall_seagrass', 'kelp_plant']
  const blocksToBeRplaced = ['kelp'].concat(blocksCanBeReplaced)
  let isJumping

  const getNewPositionForPlaceBlock = (position) => {
    const offset = getOffsetPlaceBlock(position)
    const newPosition = position.clone().add(offset)

    const blockOffset = vec3(offset.x * -1, offset.y * -1, offset.z * -1)

    return {
      newPosition,
      blockOffset,
      offset
    }
  }

  let queue = []
  let positions_checked = []

  const getPathToPlace = (position) => {
    queue = []
    positions_checked = []

    let result = getRecursivePosition(position, null)
    while (!result) {
      const newPosition = queue.shift()
      result = getRecursivePosition(newPosition.position, newPosition.parent)
    }

    const positionsToPlaceBlocks = []
    let currentParent = result.parent
    do {
      const positionToplaceBlock = positions_checked[currentParent]
      positionsToPlaceBlocks.push(positionToplaceBlock)
      currentParent = positionToplaceBlock.parent
    } while (currentParent !== null)

    return positionsToPlaceBlocks
  }

  const getRecursivePosition = (position, parent) => {
    let newPosition
    let offset
    positions_checked.push({ position, parent })
    const currentParent = positions_checked.length - 1

    const offsetPlaceBlock = getOffsetPlaceBlock(position)
    if (offsetPlaceBlock) {
      return {
        position,
        parent: currentParent
      }
    }

    // down
    offset = vec3(0, -1, 0)
    newPosition = position.clone().add(offset)
    if (!positions_checked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // front
    offset = vec3(1, 0, 0)
    newPosition = position.clone().add(offset)
    if (!positions_checked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // back
    offset = vec3(-1, 0, 0)
    newPosition = position.clone().add(offset)
    if (!positions_checked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // right
    offset = vec3(0, 0, 1)
    newPosition = position.clone().add(offset)
    if (!positions_checked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // left
    offset = vec3(0, 0, -1)
    newPosition = position.clone().add(offset)
    if (!positions_checked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // up
    offset = vec3(0, 1, 0)
    newPosition = position.clone().add(offset)
    if (!positions_checked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }

    return false
  }

  const getOffsetPlaceBlock = (position) => {
    let newBlock
    let offset
    // down
    offset = vec3(0, -1, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // front
    offset = vec3(1, 0, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // back
    offset = vec3(-1, 0, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // right
    offset = vec3(0, 0, 1)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // left
    offset = vec3(0, 0, -1)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // up
    offset = vec3(0, 1, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    return false
  }

  const place = (position, offset, canJump = true) => {
    return new Promise((resolve, reject) => {
      const block = bot.blockAt(position)

      if (!block) {
        reject(new Error('Error on block!'))
        return
      }

      isJumping = false

      if (
        Math.floor(bot.entity.position.x) === block.position.x &&
        Math.floor(bot.entity.position.y) === block.position.y &&
        Math.floor(bot.entity.position.z) === block.position.z &&
        canJump
      ) {
        isJumping = true
        bot.setControlState('jump', true)
      }

      bot.placeBlock(block, offset)
        .then(() => {
          if (isJumping) { bot.setControlState('jump', false) }
          resolve()
        })
        .catch(err => {
          if (isJumping) { bot.setControlState('jump', false) }
          reject(err)
        })
    })
  }

  return {
    getNewPositionForPlaceBlock,
    getOffsetPlaceBlock,
    blocksCanBeReplaced,
    blocksToBeRplaced,
    getPathToPlace,
    place
  }
}
