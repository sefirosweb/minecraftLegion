const botWebsocket = require('@modules/botWebsocket')
const { sleep, getSecondBlockPosition } = require('@modules/utils')
const vec3 = require('vec3')
module.exports = class BehaviorDepositItemChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDepositItemChest'
    this.isEndFinished = false

    this.items = []
  }

  onStateEntered () {
    this.isEndFinished = false
    botWebsocket.log('Items to deposit ' + JSON.stringify(this.targets.items))
    this.items = [...this.targets.items]

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for deposit items, forcing close')
      this.isEndFinished = true
    }, 5000)

    this.depositAllItems()
  }

  onStateExited () {
    this.isEndFinished = false
    this.targets.items = []
    clearTimeout(this.timeLimit)
  }

  isFinished () {
    return this.isEndFinished
  }

  async depositAllItems () {
    const chestToOpen = this.bot.blockAt(vec3(this.targets.position))
    if (!['chest', 'ender_chest', 'trapped_chest'].includes(chestToOpen.name)) {
      botWebsocket.log('No chest found')
      this.isEndFinished = true
      return
    }

    this.bot.openContainer(chestToOpen)
      .then((container) => {
        this.depositItems(container)
          .then(async () => {
            this.refreshChest(chestToOpen, container)
            await sleep(200)
            await container.close()
            await sleep(500)
            this.isEndFinished = true
          })
          .catch(async (err) => {
            this.refreshChest(chestToOpen, container)
            console.log(err)
            await sleep(200)
            await container.close()
            await sleep(500)
            this.isEndFinished = true
          })
      })
  }

  refreshChest (chestToOpen, container) {
    const chest = this.targets.chests.find(c => {
      if (vec3(c.position).equals(chestToOpen.position)) return true
      if (c.secondBlock && vec3(c.secondBlock.position).equals(chestToOpen.position)) return true
      return false
    })

    const slots = container.slots.slice(0, container.inventoryStart)
    if (!chest) {
      chestToOpen.slots = slots
      chestToOpen.lastTimeOpen = Date.now()

      const props = chestToOpen.getProperties()
      const offset = getSecondBlockPosition(props.facing, props.type)
      if (offset) {
        chestToOpen.secondBlock = this.bot.blockAt(chestToOpen.position.offset(offset.x, offset.y, offset.z))
      }

      chestToOpen.dimension = this.bot.game.dimension

      this.targets.chests.push(chestToOpen)
    } else {
      chest.slots = slots
      chest.lastTimeOpen = Date.now()
    }
    botWebsocket.sendAction('setChests', this.targets.chests)
  }

  checkItemDestinationAndMoveToInventory (container, toSlot) {
    return new Promise((resolve, reject) => {
      if (container.slots[toSlot] === null) {
        resolve()
        return
      }

      const emptySlot = container.slots.findIndex((s, sIndex) => s === null && sIndex > container.inventoryStart)
      this.bot.moveSlotItem(toSlot, emptySlot)
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  depositItems (container) {
    return new Promise((resolve, reject) => {
      if (this.items.length === 0) {
        resolve()
        return
      }
      const itemToDeposit = this.items.shift()

      if (itemToDeposit.toSlot !== undefined) {
        // If the destination is specific
        const options = {
          windows: container,
          itemType: itemToDeposit.type,
          metadata: null,
          count: itemToDeposit.quantity,
          sourceStart: container.inventoryStart,
          sourceEnd: container.inventoryEnd,
          destStart: itemToDeposit.toSlot,
          destEnd: itemToDeposit.toSlot + 1
        }

        this.checkItemDestinationAndMoveToInventory(container, itemToDeposit.toSlot)
          .then(() => {
            this.bot.transfer(options)
              .then(() => {
                this.depositItems(container)
                  .then(() => {
                    resolve()
                  })
                  .catch(err => {
                    reject(err)
                  })
              })
              .catch(err => {
                reject(err)
              })
          })
          .catch(err => {
            reject(err)
          })
      } else {
        // If the destination is NOT specific
        if (container.containerItems().length === container.inventoryStart) {
          reject(new Error('The chest is full'))
          return
        }

        container.deposit(itemToDeposit.type, null, itemToDeposit.quantity)
          .then(() => {
            this.depositItems(container)
              .then(() => {
                resolve()
              })
              .catch(err => {
                reject(err)
              })
          })
          .catch(err => {
            reject(err)
          })
      }
    })
  }
}
