import { LegionStateMachineTargets, EntityWithDistance } from "base-types"
import { Bot } from "mineflayer";
import { StateBehavior } from "minecraftlegion-statemachine"
export class BehaviorFindItems implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean
  distanceToFind: number
  isOnFloor: boolean

  constructor(bot: Bot, targets: LegionStateMachineTargets, distanceToFind: number = 15, isOnFloor: boolean = false) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorFindItems'
    this.isEndFinished = false

    this.distanceToFind = distanceToFind
    this.isOnFloor = isOnFloor
  }

  onStateEntered() {
    this.targets.itemDrop = undefined
    this.isEndFinished = false
    if (this.bot.inventory.items().length >= 33) {
      this.isEndFinished = true
      return
    }

    this.search()
    this.isEndFinished = true
  }

  onStateExited() {
    this.isEndFinished = false
  }

  isFinished() {
    return this.isEndFinished
  }


  search() {
    if (!this.bot.config.pickUpItems) return false

    const entities = Object.keys(this.bot.entities)

    const itemsFound: Array<EntityWithDistance> = [];

    entities.forEach(entityName => {
      const entity = this.bot.entities[entityName]
      const disatanceToObject = entity.position.distanceTo(this.bot.entity.position)

      if (disatanceToObject < this.distanceToFind && (
        !this.isOnFloor ||
        Math.abs(entity.position.y - this.bot.entity.position.y) <= 1
      )) {
        if (entity.displayName === 'Item' /* || entity.displayName === 'Arrow' */) {
          entity.distance = disatanceToObject
          itemsFound.push(entity as EntityWithDistance)
        }
      }
    })

    if (itemsFound.length > 0) {
      itemsFound.sort((a, b) => {
        return a.distance - b.distance
      })
      this.targets.itemDrop = itemsFound[0]
      this.isEndFinished = true
      return true
    }

    return false
  }
}
