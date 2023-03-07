import { PositionsChecked, Queue } from '@/types'
import { Vec3 } from 'vec3'
import { Block } from 'prismarine-block'
import { Bot } from 'mineflayer'

const placeBlockModule = (bot: Bot) => {
  const blocksCanBeReplaced = ['air', 'cave_air', 'lava', 'water', 'bubble_column', 'seagrass', 'tall_seagrass', 'kelp_plant']
  const blocksToBeRplaced = ['kelp'].concat(blocksCanBeReplaced)
  let isJumping: boolean

  const getNewPositionForPlaceBlock = (position: Vec3) => {
    const offset = getOffsetPlaceBlock(position)
    const newPosition = offset ? position.clone().add(offset) : offset
    const blockOffset = offset ? new Vec3(offset.x * -1, offset.y * -1, offset.z * -1) : offset

    return {
      newPosition,
      blockOffset,
      offset
    }
  }

  let queue: Array<Queue> = []
  let positionsChecked: Array<PositionsChecked> = []

  const getPathToPlace = (position: Vec3): Array<PositionsChecked> => {
    queue = []
    positionsChecked = []

    let result = getRecursivePosition(position, null)
    while (!result) {
      const newPosition = queue.shift()
      if (newPosition) {
        result = getRecursivePosition(newPosition.position, newPosition.parent)
      }
    }

    const positionsToPlaceBlocks: Array<PositionsChecked> = []
    let currentParent: number | null = result.parent
    do {
      const positionToplaceBlock: PositionsChecked = positionsChecked[currentParent]
      positionsToPlaceBlocks.push(positionToplaceBlock)
      currentParent = positionToplaceBlock.parent
    } while (currentParent !== null)

    return positionsToPlaceBlocks
  }

  const getRecursivePosition = (position: Vec3, parent: number | null) => {
    let newPosition: Vec3
    let offset
    positionsChecked.push({ position, parent })
    const currentParent = positionsChecked.length - 1

    const offsetPlaceBlock = getOffsetPlaceBlock(position)
    if (offsetPlaceBlock) {
      return {
        position,
        parent: currentParent
      }
    }

    // down
    offset = new Vec3(0, -1, 0)
    newPosition = position.clone().add(offset)
    if (!positionsChecked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // front
    offset = new Vec3(1, 0, 0)
    newPosition = position.clone().add(offset)
    if (!positionsChecked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // back
    offset = new Vec3(-1, 0, 0)
    newPosition = position.clone().add(offset)
    if (!positionsChecked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // right
    offset = new Vec3(0, 0, 1)
    newPosition = position.clone().add(offset)
    if (!positionsChecked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // left
    offset = new Vec3(0, 0, -1)
    newPosition = position.clone().add(offset)
    if (!positionsChecked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }
    // up
    offset = new Vec3(0, 1, 0)
    newPosition = position.clone().add(offset)
    if (!positionsChecked.find((p) => p.position.equals(newPosition))) { queue.push({ position: newPosition, parent: currentParent }) }

    return false
  }

  const getOffsetPlaceBlock = (position: Vec3) => {
    let newBlock: Block | null
    let offset: Vec3
    // down
    offset = new Vec3(0, -1, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (newBlock && !blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // front
    offset = new Vec3(1, 0, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (newBlock && !blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // back
    offset = new Vec3(-1, 0, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (newBlock && !blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // right
    offset = new Vec3(0, 0, 1)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (newBlock && !blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // left
    offset = new Vec3(0, 0, -1)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (newBlock && !blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    // up
    offset = new Vec3(0, 1, 0)
    newBlock = bot.blockAt(position.clone().add(offset))
    if (newBlock && !blocksCanBeReplaced.includes(newBlock.name)) {
      return offset
    }

    return undefined
  }

  const place = (position: Vec3, offset: Vec3, canJump = true): Promise<void> => {
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

export default placeBlockModule