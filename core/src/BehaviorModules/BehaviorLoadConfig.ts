import { StateBehavior } from "mineflayer-statemachine"
import { Bot, Config, LegionStateMachineTargets } from "@/types"
import botConfigLoader from '@/modules/botConfig'
import { Jobs } from "@/types/defaultTypes"

export default class BehaviorLoadConfig implements StateBehavior {
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
  minerCords: Config['minerCords']
  firstPickUpItemsFromKnownChests: Config['firstPickUpItemsFromKnownChests']
  randomFarmArea: Config['randomFarmArea']
  farmAnimal: Config['farmAnimal']
  farmAreas: Config['farmAreas']

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLoadConfig'
    this.active = true

    const botConfig = botConfigLoader(this.bot.username)

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
    this.minerCords = botConfig.defaultConfig.minerCords
    this.firstPickUpItemsFromKnownChests = false
    this.randomFarmArea = botConfig.defaultConfig.randomFarmArea
    this.farmAnimal = botConfig.defaultConfig.farmAnimal
    this.farmAreas = botConfig.defaultConfig.farmAreas
  }

  onStateEntered() {
    const botConfig = botConfigLoader(this.bot.username)
    this.job = botConfig.getJob()
    this.mode = botConfig.getMode()
    this.helpFriends = botConfig.getHelpFriends()
    this.distance = botConfig.getDistance()
    this.patrol = botConfig.getPatrol()
    this.minerCords = botConfig.getMinerCords()
    this.chests = botConfig.getAllChests()
    this.firstPickUpItemsFromKnownChests = botConfig.getFirstPickUpItemsFromKnownChests()
    this.itemsToBeReady = botConfig.getItemsToBeReady()
    this.pickUpItems = botConfig.getPickUpItems()
    this.itemsCanBeEat = botConfig.getItemsCanBeEat()
    this.canDig = botConfig.getCanDig()
    this.canSleep = botConfig.getCanSleep()
    this.allowSprinting = botConfig.getAllowSprinting()
    this.plantAreas = botConfig.getPlantAreas()
    this.randomFarmArea = botConfig.getRandomFarmArea()
    this.farmAnimal = botConfig.getFarmAnimal()
    this.farmAreas = botConfig.getFarmAreas()
  }

  getAllConfig() {
    const botConfig = botConfigLoader(this.bot.username)
    return botConfig.getAll()
  }

  getJob() {
    return this.job
  }

  getMode() {
    return this.mode
  }

  getHelpFriend() {
    return this.helpFriends
  }

  getDistance() {
    return this.distance
  }

  getPatrol() {
    return this.patrol
  }

  getMinerCords() {
    return this.minerCords
  }

  getAllChests() {
    return this.chests
  }

  getItemsToBeReady() {
    return this.itemsToBeReady
  }

  getPickUpItems() {
    return this.pickUpItems
  }

  getItemsCanBeEat() {
    return this.itemsCanBeEat
  }

  getCanDig() {
    return this.canDig
  }

  getAllowSprinting() {
    return this.allowSprinting
  }

  getPlantAreas() {
    return this.plantAreas
  }

  getRandomFarmArea() {
    return this.randomFarmArea
  }

  getFarmAnimal() {
    return this.farmAnimal
  }

  getFarmAreas() {
    return this.farmAreas
  }

  getFirstPickUpItemsFromKnownChests() {
    return this.firstPickUpItemsFromKnownChests
  }
}
