

import { CustomEntity, LegionStateMachineTargets } from 'base-types'
import botWebsocket from '@/modules/botWebsocket'
import { Entity } from 'prismarine-entity'
import mineflayerPathfinder from 'mineflayer-pathfinder'
import { Bot } from 'mineflayer'

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

  const movements = new mineflayerPathfinder.Movements(bot)
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
      entity.displayName === 'Phantom' ||
      entity.displayName === 'Blaze' ||
      entity.displayName === 'Ender Dragon'
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
    if (bot.config.mode === 'pvp') {
      if (
        (entity.position.distanceTo(bot.player.entity.position) <= bot.config.distance) &&
        (entity.type === 'hostile' || entity.kind === 'Hostile mobs' || entity.type === 'player') &&
        // entity.kind !== 'Passive mobs' &&
        entity.displayName &&
        !ignoreMobs.includes(entity.displayName) &&
        entity.isValid
      ) {
        const botFriends = botWebsocket.getFriends()
        const bFriend = botFriends.find(b => b.name === entity.username)
        if (bFriend !== undefined) {
          return false
        }

        if (!entity.username) return true

        const masters = botWebsocket.getMasters()
        const mFriend = masters.find(b => b === entity.username)
        if (mFriend !== undefined) {
          return false
        }

        return true
      }
    }

    if (bot.config.mode === 'pve') {
      // console.log(`${entity.displayName} + ${entity.type} + ${entity.kind}`)
      return (entity.position.distanceTo(bot.player.entity.position) <= bot.config.distance) &&
        (entity.type === 'hostile' || entity.kind === 'Hostile mobs') &&
        // (entity.kind !== 'Passive mobs') &&
        entity.displayName &&
        !ignoreMobs.includes(entity.displayName) &&
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