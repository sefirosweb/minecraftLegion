module.exports = class BehaviorTransactionBetweenInventoryChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorTransactionBetweenInventoryChest'
    this.isEndFinished = false
    this.success = false
    this.pendinTransactions = []
  }

  onStateExited () {
    this.isEndFinished = false
    this.success = false
  }

  onStateEntered () {
    this.isEndFinished = false
    this.pendinTransactions = [...this.targets.sorterJob.nextTransactions]
    const indexChest = this.pendinTransactions[0].fromChest

    this.bot.openContainer(this.targets.chests[indexChest])
      .then((container) => {
        this.pickNextItem(container)
          .then(() => {
            container.close()
            setTimeout(() => {
              this.success = true
              this.isEndFinished = true
            }, 500)
          })
      })
  }

  pickNextItem (container) {
    return new Promise((resolve, reject) => {
      if (this.pendinTransactions.length === 0) {
        resolve()
        return
      }

      const transaction = this.pendinTransactions.shift()
      const sourceSlot = transaction.fromSlot
      const destSlot = transaction.toSlot + container.inventoryStart
      this.bot.moveSlotItem(sourceSlot, destSlot)
        .then(() => {
          this.pickNextItem(container)
            .then(() => {
              resolve()
            })
        })
    })
  }

  isFinished () {
    return this.isEndFinished
  }

  isSuccess () {
    return this.isSuccess
  }
}
