
import { LegionStateMachineTargets } from "base-types"
import { botWebsocket } from '@/modules'
import { Item as PrismarineItem } from 'prismarine-item';
import { Bot, EquipmentDestination } from "mineflayer";
import { StateBehavior } from "mineflayer-statemachine";

export class BehaviorEquip implements StateBehavior {
  active: boolean;
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  x?: number
  y?: number

  isEndFinished: boolean
  wasEquipped: boolean
  timeLimit?: ReturnType<typeof setTimeout>
  destination?: EquipmentDestination

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEquip'

    this.isEndFinished = false
    this.wasEquipped = false
  }

  onStateEntered() {
    this.isEndFinished = false
    this.wasEquipped = false

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for equip item')
      this.isEndFinished = true
    }, 5000)

    if (!this.targets.item) {
      this.isEndFinished = true
      botWebsocket.log('No item selected for equip')
      return
    }

    this.destination = this.getEquipDestination(this.targets.item)

    this.equip()
      .then(() => {
        this.isEndFinished = true
        this.wasEquipped = true
      })
  }

  equip(): Promise<void> {
    return new Promise((resolve, reject) => {
      const itemId = this.bot.mcData.itemsByName[this.targets.item.name].id

      if (!this.destination) {
        reject(new Error('Destination not found'))
        return
      }

      this.bot.equip(itemId, this.destination)
        .then(() => {
          resolve()
        })

        .catch((err: Error) => {
          botWebsocket.log(`Error on change item ${this.targets.item.name} ${err.message}`)

          setTimeout(() => {
            this.equip()
              .then(() => {
                resolve()
              })
          }, 200)

        })
    })
  }

  onStateExited() {
    this.isEndFinished = false
    this.wasEquipped = false
    clearTimeout(this.timeLimit)
  }

  isFinished() {
    return this.isEndFinished
  }

  isWasEquipped() {
    return this.wasEquipped
  }

  getEquipDestination(item: PrismarineItem): EquipmentDestination {
    if (this.isHelmet(item)) return 'head'
    if (this.isChestplate(item)) return 'torso'
    if (this.isLeggings(item)) return 'legs'
    if (this.isBoots(item)) return 'feet'
    return 'hand'
  }

  isHelmet(item: PrismarineItem) {
    const id = item.type
    if (id === this.bot.mcData.itemsByName.leather_helmet.id) return true
    if (id === this.bot.mcData.itemsByName.iron_helmet.id) return true
    if (id === this.bot.mcData.itemsByName.golden_helmet.id) return true
    if (id === this.bot.mcData.itemsByName.diamond_helmet.id) return true
    if (id === this.bot.mcData.itemsByName.turtle_helmet.id) return true
    if (id === this.bot.mcData.itemsByName.turtle_helmet.id) return true
    if (id === this.bot.mcData.itemsByName.netherite_helmet.id) return true
    return false
  }

  isChestplate(item: PrismarineItem) {
    const id = item.type
    if (id === this.bot.mcData.itemsByName.leather_chestplate.id) return true
    if (id === this.bot.mcData.itemsByName.iron_chestplate.id) return true
    if (id === this.bot.mcData.itemsByName.golden_chestplate.id) return true
    if (id === this.bot.mcData.itemsByName.diamond_chestplate.id) return true
    if (id === this.bot.mcData.itemsByName.netherite_chestplate.id) return true
    return false
  }

  isLeggings(item: PrismarineItem) {
    const id = item.type
    if (id === this.bot.mcData.itemsByName.leather_leggings.id) return true
    if (id === this.bot.mcData.itemsByName.iron_leggings.id) return true
    if (id === this.bot.mcData.itemsByName.golden_leggings.id) return true
    if (id === this.bot.mcData.itemsByName.diamond_leggings.id) return true
    if (id === this.bot.mcData.itemsByName.netherite_leggings.id) return true
    return false
  }

  isBoots(item: PrismarineItem) {
    const id = item.type
    if (id === this.bot.mcData.itemsByName.leather_boots.id) return true
    if (id === this.bot.mcData.itemsByName.iron_boots.id) return true
    if (id === this.bot.mcData.itemsByName.golden_boots.id) return true
    if (id === this.bot.mcData.itemsByName.diamond_boots.id) return true
    if (id === this.bot.mcData.itemsByName.netherite_boots.id) return true
    return false
  }
}
