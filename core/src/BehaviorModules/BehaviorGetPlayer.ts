

import { LegionStateMachineTargets } from "@/types"
import { Bot } from "mineflayer";
import { StateBehavior } from "mineflayer-statemachine"

export default class BehaviorGetPlayer implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  playerIsFound: boolean
  playerName?: string

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetPlayer'

    this.playerIsFound = false
  }

  onStateEntered() {
    if (!this.playerName) return
    this.getPlayerEntity(this.playerName)
  }

  getPlayerEntity(playerName: string) {
    this.targets.entity = this.checkPlayer(playerName) || undefined
    this.playerIsFound = this.targets.entity !== undefined
    if (this.playerIsFound) {
      this.playerName = playerName
    }
    return this.playerIsFound
  }

  checkPlayer(playerName: string) {
    for (const entityName of Object.keys(this.bot.entities)) {
      const entity = this.bot.entities[entityName]
      if (entity === this.bot.entity) { continue }
      if (entity.type !== 'player') { continue }
      if (entity.username === playerName) { return entity }
    }
    return null
  }

  playerFound() {
    return this.playerIsFound
  }

  getPlayerName() {
    return this.playerName
  }
}
