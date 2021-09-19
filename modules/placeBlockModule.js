const vec3 = require('vec3')

module.exports = function (bot) {
  const blocksCanBeReplaced = ['air', 'cave_air', 'lava', 'water']
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
    getOffsetPlaceBlock,
    blocksCanBeReplaced
  }
}
