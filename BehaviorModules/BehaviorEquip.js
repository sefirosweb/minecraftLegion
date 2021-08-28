const botWebsocket = require('@modules/botWebsocket')

module.exports = class BehaviorEquip {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEquip'

    this.mcData = require('minecraft-data')(this.bot.version)

    this.isEndFinished = false
    this.wasEquipped = false
  }

  onStateEntered () {
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

  equip () {
    return new Promise((resolve, reject) => {
      this.bot.equip(this.targets.item, this.destination)
        .then(() => {
          resolve()
        }).catch(function (err) {
          botWebsocket.log(`Error on change item ${this.targets.item.name} ${err.message}`)
          setTimeout(function () {
            this.equip()
              .then(() => {
                resolve()
              })
          }.bind(this), 200)
        }.bind(this))
    })
  }

  onStateExited () {
    this.isEndFinished = false
    this.wasEquipped = false
    clearTimeout(this.timeLimit)
  }

  isFinished () {
    return this.isEndFinished
  }

  isWasEquipped () {
    return this.wasEquipped
  }

  getEquipDestination (item) {
    if (this.isHelmet(item)) return 'head'
    if (this.isChestplate(item)) return 'torso'
    if (this.isLeggings(item)) return 'legs'
    if (this.isBoots(item)) return 'feet'

    // TODO Uncomment this when mineflayer updates
    // if (this.isOffhandUsable(item))
    //     return "off-hand";
    // pending to add nether armor

    return 'hand'
  }

  isHelmet (item) {
    const id = item.type
    if (id === this.mcData.itemsByName.leather_helmet.id) return true
    if (id === this.mcData.itemsByName.iron_helmet.id) return true
    if (id === this.mcData.itemsByName.golden_helmet.id) return true
    if (id === this.mcData.itemsByName.diamond_helmet.id) return true
    if (id === this.mcData.itemsByName.turtle_helmet.id) return true
    return false
  }

  isChestplate (item) {
    const id = item.type
    if (id === this.mcData.itemsByName.leather_chestplate.id) return true
    if (id === this.mcData.itemsByName.iron_chestplate.id) return true
    if (id === this.mcData.itemsByName.golden_chestplate.id) return true
    if (id === this.mcData.itemsByName.diamond_chestplate.id) return true
    return false
  }

  isLeggings (item) {
    const id = item.type
    if (id === this.mcData.itemsByName.leather_leggings.id) return true
    if (id === this.mcData.itemsByName.iron_leggings.id) return true
    if (id === this.mcData.itemsByName.golden_leggings.id) return true
    if (id === this.mcData.itemsByName.diamond_leggings.id) return true
    return false
  }

  isBoots (item) {
    const id = item.type
    if (id === this.mcData.itemsByName.leather_boots.id) return true
    if (id === this.mcData.itemsByName.iron_boots.id) return true
    if (id === this.mcData.itemsByName.golden_boots.id) return true
    if (id === this.mcData.itemsByName.diamond_boots.id) return true
    return false
  }
}
