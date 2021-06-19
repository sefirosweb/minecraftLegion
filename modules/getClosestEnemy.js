const botWebsocket = require('@modules/botWebsocket')
module.exports = function (bot, targets) {
  let entities = []
  let currentEntity = false

  const mcData = require('minecraft-data')(bot.version)
  const mineflayerPathfinder = require('mineflayer-pathfinder')
  const movements = new mineflayerPathfinder.Movements(bot, mcData)
  movements.digCost = 100
  movements.canDig = false

  const check = () => {
    if (targets.config.mode === 'none') {
      targets.entity = undefined
    } else {
      if (!currentEntity || entities.length <= currentEntity) {
        entities = sortEntitiesDistance()
        currentEntity = 0
      }

      if (entities.length > 0) {
        const validEntity = getValidPath(entities[currentEntity])
        if (validEntity) {
          const blockPosition = bot.blockAt(entities[currentEntity].position.offset(0, entities[currentEntity].height, 0))
          if (bot.canSeeBlock(blockPosition)) {
            targets.entity = entities[currentEntity]
          }
        }

        currentEntity++
      }
    }
  }

  const getValidPath = (entity) => {
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
        (entity.mobType !== 'Armor Stand') &&
        (entity.kind !== 'Passive mobs') &&
        (entity.isValid)
    }

    return false
  }

  return {
    check
  }
}
