const vec3 = require('vec3')

module.exports = function (bot) {
  const blocksCanBeReplaced = ['air', 'cave_air', 'lava', 'water', 'seagrass', 'tall_seagrass', 'kelp_plant']
  let isJumping

  const getNewPositionForPlaceBlock = (position) => {
    const offset = getOffsetPlaceBlock(bot.blockAt(position))
    const newPosition = position.clone().add(offset)

    const blockOffset = vec3(offset.x * -1, offset.y * -1, offset.z * -1)

    return {
      newPosition,
      blockOffset,
      offset
    }
  }

  const getOffsetPlaceBlock = (block) => {
    let newBlock
    let offset
    // down
    offset = vec3(0, -1, 0)
    newBlock = bot.blockAt(block.position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // front
    offset = vec3(1, 0, 0)
    newBlock = bot.blockAt(block.position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // back
    offset = vec3(-1, 0, 0)
    newBlock = bot.blockAt(block.position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // right
    offset = vec3(0, 0, 1)
    newBlock = bot.blockAt(block.position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // left
    offset = vec3(0, 0, -1)
    newBlock = bot.blockAt(block.position.clone().add(offset))
    if (!blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // up
    offset = vec3(0, 1, 0)
    newBlock = bot.blockAt(block.position.clone().add(offset))
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
    place
  }
}
