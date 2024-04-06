import { StateBehavior } from "mineflayer-statemachine"
import { Config, LegionStateMachineTargets, Jobs } from "base-types"
import { Bot } from "mineflayer"
// TODO delete this file
export class BehaviorLoadConfig implements StateBehavior {
  active: boolean
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  playername?: string

  job: Config['job']
  mode: Config['mode']
  helpFriends: Config['helpFriends']
  distance: Config['distance']
  pickUpItems: Config['pickUpItems']
  canDig: Config['canDig']
  canSleep: Config['canSleep']
  allowSprinting: Config['allowSprinting']
  patrol: Config['patrol']
  chests: Config['chests']
  plantAreas: Config['plantAreas']
  itemsCanBeEat: Config['itemsCanBeEat']
  itemsToBeReady: Config['itemsToBeReady']

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLoadConfig'
    this.active = true

    this.job = Jobs.none
    this.mode = 'none'
    this.helpFriends = false
    this.distance = 10

    this.pickUpItems = false
    this.canDig = false
    this.canSleep = false
    this.allowSprinting = false
    this.patrol = []
    this.chests = []
    this.plantAreas = []
    this.itemsCanBeEat = []
    this.itemsToBeReady = []
  }

  onStateEntered() {
  }
}
