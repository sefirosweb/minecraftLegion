const vec3 = require('vec3')

module.exports = function (bot) {
  const blocksCanBeReplaced = ['air', 'cave_air', 'lava', 'water', 'seagrass']

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

  return {
    getNewPositionForPlaceBlock,
    getOffsetPlaceBlock,
    blocksCanBeReplaced
  }
}
