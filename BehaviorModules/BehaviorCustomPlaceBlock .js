const botWebsocket = require('../modules/botWebsocket')
module.exports = class BehaviorCustomPlaceBlock {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'Custom BehaviorPlaceBlock '
    this.isEndFinished = false
  }

  isFinished () {
    return this.isEndFinished
  }

  onStateEntered () {
    const _this = this
    this.isEndFinished = false
    if (this.targets.item == null) return

    this.bot.equip(this.targets.item, 'hand').catch(err => {
      console.log(err)
    })

    if (this.targets.position == null) return
    if (this.targets.blockFace == null) return

    const block = this.bot.blockAt(this.targets.position)
    if (block == null || !this.bot.canSeeBlock(block)) return
    botWebsocket.log('Placing... block')
    // this.bot.placeBlock(block, this.targets.blockFace)
    this.bot.placeBlock(block, this.targets.blockFace, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('finished')
      }
    })

    /*   .then(() => {
        botWebsocket.log('Block placed')
        _this.isEndFinished = true
      })
      .catch((err) => {
        botWebsocket.log('Error on block placed')
        console.log(err)
        _this.isEndFinished = false
      })
      */
  }
}
