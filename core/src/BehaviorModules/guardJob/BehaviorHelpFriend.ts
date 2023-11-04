import botWebsocket from '@/modules/botWebsocket'
import { BotFriends, EntityWithDistance, LegionStateMachineTargets } from 'base-types'
import { Bot } from 'mineflayer';
import { StateBehavior } from 'mineflayer-statemachine'
import { Entity } from 'prismarine-entity'

export default class BehaviorHelpFriend implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  entity: Entity | undefined

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorHelpFriend'

    this.entity = undefined
  }

  onStateEntered() {
    this.targets.entity = this.entity
  }

  onStateExited() {
    this.entity = undefined
  }

  findHelpFriend() {
    if (!this.bot.config.helpFriends) return false
    const friends = botWebsocket.getFriends()
    const friendsNeedHelp = friends.filter(e => e.combat === true)
    if (friendsNeedHelp.length === 0) {
      return false
    }

    let entities = this.getFriendInVission(friendsNeedHelp)

    if (entities.length === 0) {
      return false
    }

    entities.sort(function (a, b) {
      return a.distance - b.distance
    })

    this.entity = entities[0]
    return true
  }

  getFriendInVission(friendsNeedHelp: Array<BotFriends>) {
    const entities: Array<EntityWithDistance> = []
    let index, dist
    for (const entityName of Object.keys(this.bot.entities)) {
      const entity = this.bot.entities[entityName] as EntityWithDistance
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


  targetIsFriend() {
    const friends = botWebsocket.getFriends()
    if (!this.targets.entity) return false

    if (this.targets.entity.type === 'player') {
      const index = friends.findIndex(f => this.targets.entity && f.name === this.targets.entity.username)
      if (index >= 0) {
        return true
      }
    }
    return false
  }

  stillNeedHelp() {
    const friends = botWebsocket.getFriends()
    if (this.targets.entity && this.targets.entity.type === 'player') {
      const index = friends.findIndex(f => this.targets.entity && f.name === this.targets.entity.username)
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
