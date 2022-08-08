import { Facing, ChestPosition } from '@/types'
import { Vec3 } from 'vec3'

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const shuffle = (array: Array<any>) => {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }

  return array
}


export const getSecondBlockPosition = (facing: Facing, chestPosition: ChestPosition) => {
  if (chestPosition === 'single') {
    return false
  }

  if (facing === 'south' && chestPosition === 'right') {
    return new Vec3(1, 0, 0)
  }

  if (facing === 'south' && chestPosition === 'left') {
    return new Vec3(-1, 0, 0)
  }

  if (facing === 'north' && chestPosition === 'left') {
    return new Vec3(1, 0, 0)
  }

  if (facing === 'north' && chestPosition === 'right') {
    return new Vec3(-1, 0, 0)
  }

  if (facing === 'east' && chestPosition === 'right') {
    return new Vec3(0, 0, -1)
  }

  if (facing === 'east' && chestPosition === 'left') {
    return new Vec3(0, 0, 1)
  }

  if (facing === 'west' && chestPosition === 'left') {
    return new Vec3(0, 0, -1)
  }

  if (facing === 'west' && chestPosition === 'right') {
    return new Vec3(0, 0, 1)
  }

  return false
}