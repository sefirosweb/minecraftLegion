
//@ts-nocheck
import { Bot, LegionStateMachineTargets } from "@/types"
import botConfigLoader from '@/modules/botConfig'

module.exports = class BehaviorLoadConfig {

  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  playername?: string


  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLoadConfig'

    this.job = false
    this.mode = 'none'
    this.helpFriends = false
    this.pickUpItems = false
    this.canDig = true
    this.canSleep = true
    this.allowSprinting = true
    this.distance = 10
    this.patrol = []
    this.chests = []
    this.plantAreas = []
    this.itemsCanBeEat = []
    this.itemsToBeReady = []
    this.minerCords = {}
  }

  onStateEntered() {
    const botConfig = botConfigLoader()
    this.job = botConfig.getJob(this.bot.username)
    this.mode = botConfig.getMode(this.bot.username)
    this.helpFriends = botConfig.getHelpFriends(this.bot.username)
    this.distance = botConfig.getDistance(this.bot.username)
    this.patrol = botConfig.getPatrol(this.bot.username)
    this.minerCords = botConfig.getMinerCords(this.bot.username)
    this.chests = botConfig.getAllChests(this.bot.username)
    this.firstPickUpItemsFromKnownChests = botConfig.getFirstPickUpItemsFromKnownChests(this.bot.username)
    this.itemsToBeReady = botConfig.getItemsToBeReady(this.bot.username)
    this.pickUpItems = botConfig.getPickUpItems(this.bot.username)
    this.itemsCanBeEat = botConfig.getItemsCanBeEat(this.bot.username)
    this.canDig = botConfig.getCanDig(this.bot.username)
    this.canSleep = botConfig.getCanSleep(this.bot.username)
    this.allowSprinting = botConfig.getAllowSprinting(this.bot.username)
    this.plantAreas = botConfig.getPlantAreas(this.bot.username)
    this.randomFarmArea = botConfig.getRandomFarmArea(this.bot.username)
    this.farmAnimal = botConfig.getFarmAnimal(this.bot.username)
    this.farmAreas = botConfig.getFarmAreas(this.bot.username)
  }

  getAllConfig() {
    const botConfig = botConfigLoader()
    return botConfig.getAll(this.bot.username)
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
