const botWebsocket = require('@modules/botWebsocket')

module.exports = class BehaviorHelpFriend {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorHelpFriend'

    this.entity = undefined
  }

  onStateEntered () {
    this.targets.entity = this.entity
  }

  onStateExited () {
    this.entity = undefined
  }

  findHelpFriend () {
    if (!this.targets.config.helpFriends) return false
    const friends = botWebsocket.getFriends()
    const friendsNeedHelp = friends.filter(e => e.combat === true)
    if (friendsNeedHelp.length === 0) {
      return false
    }

    let entities = this.getFriendInVission(friendsNeedHelp)

    if (entities.length === 0) {
      return false
    }

    entities = this.sortEntitiesDistance(entities)

    this.entity = entities[0]
    return true
  }

  getFriendInVission (friendsNeedHelp) {
    const entities = []
    let index, dist
    for (const entityName of Object.keys(this.bot.entities)) {
      const entity = this.bot.entities[entityName]
      if (entity.type === 'player') {
        index = friendsNeedHelp.findIndex(f => f.name === entity.username)
        if (index >= 0) {
          dist = entity.position.distanceTo(this.bot.entity.position)
          entity.distance = dist
          entities.push(entity)
        }
      }
    }
    return entities
  }

  sortEntitiesDistance (entities) {
    entities.sort(function (a, b) {
      return a.distance - b.distance
    })
    return entities
  }

  isFinished () {
    return this.isEndEating
  }

  targetIsFriend () {
    const friends = botWebsocket.getFriends()
    if (this.targets.entity.type === 'player') {
      const index = friends.findIndex(f => f.name === this.targets.entity.username)
      if (index >= 0) {
        return true
      }
    }
    return false
  }

  stillNeedHelp () {
    const friends = botWebsocket.getFriends()
    if (this.targets.entity.type === 'player') {
      const index = friends.findIndex(f => f.name === this.targets.entity.username)
      if (index >= 0) {
        if (friends[index].combat) {
          return true
        }
      }
    }
    this.targets.entity = undefined
    return false
  }
}
