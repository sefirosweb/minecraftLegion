

import { Bot, CustomEntity, LegionStateMachineTargets } from '@/types'
import botWebsocket from '@/modules/botWebsocket'
import { Entity } from 'prismarine-entity'

const getClosestEnemy = (bot: Bot, targets: LegionStateMachineTargets) => {
  let entities: Array<CustomEntity> = []
  let currentEntity: number | undefined

  const ignoreMobs = [
    'Glow Squid',
    'Armor Stand',
    'Iron Golem',
    'Squid',
    'Tropical Fish',
    'Pufferfish',
    'Axolotl',
    'Bat',
    'Cod',
    'Bee',
    'Salmon',
    'Cat'
  ]

  const flyingMobs = [
    'allay',
    'Bat',
    'bee',
    'blaze',
    'chicken',
    'ender_dragon',
    'ghast',
    'parrot',
    'phantom',
    'vex',
    'Wither'
  ]

  const mcData = require('minecraft-data')(bot.version)
  const mineflayerPathfinder = require('mineflayer-pathfinder')

  const movements = new mineflayerPathfinder.Movements(bot, mcData)
  movements.canDig = false

  // const movementsForFliyingMobs = new mineflayerPathfinder.Movements(bot, mcData)
  // movementsForFliyingMobs.canDig = false
  // movementsForFliyingMobs.allow1by1towers = false
  // movementsForFliyingMobs.scafoldingBlocks = []

  const check = () => {
    if (!currentEntity || entities.length <= currentEntity) {
      entities = sortEntitiesDistance()
      currentEntity = 0
    }

    if (entities.length > 0) {
      const entity = entities[currentEntity]
      // const validPath = getValidPath(entity)
      // if (validPath) {

      const entityPosition = entity.position.offset(0, entity.height, 0)
      const blockPosition = bot.blockAt(entityPosition)

      if (blockPosition && bot.canSeeBlock(blockPosition)) {
        targets.entity = entity
      }

      // }

      currentEntity++
    }
  }

  const getValidPath = (entity: Entity) => { // UNUSED FOR A NOW
    if (entity.type === 'mob' && (
      entity.mobType === 'Phantom' ||
      entity.mobType === 'Blaze' ||
      entity.mobType === 'Ender Dragon'
    )) { return true }

    const goal = new mineflayerPathfinder.goals.GoalNear(entity.position.x, entity.position.y, entity.position.z, 2)
    const result = bot.pathfinder.getPathTo(movements, goal, 40)

    return result.status === 'success'
  }

  const sortEntitiesDistance = () => {
    const entities = getAllEntities()
    entities.sort(function (a, b) {
      return a.distance - b.distance
    })
    return entities
  }

  const getAllEntities = (): Array<CustomEntity> => {
    const entities = []

    for (const entityName of Object.keys(bot.entities)) {
      const entity = bot.entities[entityName] as CustomEntity
      if (entity === bot.entity) { continue }

      if (!filter(entity)) { continue }

      const dist = entity.position.distanceTo(bot.entity.position)
      entity.distance = dist
      entity.isEnemy = true
      entities.push(entity)
    }

    return entities
  }

  const filter = (entity: CustomEntity) => {
    if (targets.config.mode === 'pvp') {
      if (
        (entity.position.distanceTo(bot.player.entity.position) <= targets.config.distance) &&
        (entity.type === 'mob' || entity.type === 'player') &&
        (entity.kind !== 'Passive mobs') &&
        entity.mobType &&
        !ignoreMobs.includes(entity.mobType) &&
        (entity.isValid)
      ) {
        const botFriends = botWebsocket.getFriends()
        const bFriend = botFriends.find(b => b.name === entity.username)
        if (bFriend !== undefined) {
          return false
        }

        if (!entity.username) return true

        const masters = botWebsocket.getMasters()
        const mFriend = masters.find(b => b.name === entity.username)
        if (mFriend !== undefined) {
          return false
        }

        return true
      }
    }

    if (targets.config.mode === 'pve') {
      return (entity.position.distanceTo(bot.player.entity.position) <= targets.config.distance) &&
        (entity.type === 'mob') &&
        (entity.kind !== 'Passive mobs') &&
        entity.mobType &&
        !ignoreMobs.includes(entity.mobType) &&
        (entity.isValid)
    }

    return false
  }

  return {
    check,
    ignoreMobs,
    flyingMobs
  }
}

export default getClosestEnemy