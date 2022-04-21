const botWebsocket = require('@modules/botWebsocket')
module.exports = function (bot, targets) {
  let entities = []
  let currentEntity = false

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
    'Allay',
    'Bat',
    'Bee',
    'Blaze',
    'Chicken',
    'Ender Dragon',
    'Ghast',
    'Parrot',
    'Phantom',
    'Vex',
    'Wither',
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

      if (bot.canSeeBlock(blockPosition)) {
        targets.entity = entity
      }

      // }

      currentEntity++
    }
  }

  const getValidPath = (entity) => { // UNUSED FOR A NOW
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

  const getAllEntities = () => {
    const entities = []
    for (const entityName of Object.keys(bot.entities)) {
      const entity = bot.entities[entityName]
      if (entity === bot.entity) { continue }

      if (!filter(entity)) { continue }

      const dist = entity.position.distanceTo(bot.entity.position)
      entity.distance = dist
      entity.isEnemy = true
      entities.push(entity)
    }
    return entities
  }

  const filter = (entity) => {
    if (targets.config.mode === 'pvp') {
      if (
        (entity.position.distanceTo(bot.player.entity.position) <= targets.config.distance) &&
        (entity.type === 'mob' || entity.type === 'player') &&
        (entity.mobType !== 'Armor Stand') &&
        (entity.mobType !== 'Iron Golem') &&
        (entity.kind !== 'Passive mobs') &&
        (entity.isValid)
      ) {
        const botFriends = botWebsocket.getFriends()
        const bFriend = botFriends.find(b => b.name === entity.username)
        if (bFriend !== undefined) {
          return false
        }

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
        (entity.isValid) &&
        !ignoreMobs.includes(entity.mobType)
    }

    return false
  }

  return {
    check,
    ignoreMobs
  }
}


