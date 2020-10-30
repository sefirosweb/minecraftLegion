const BehaviorGoToBed = (function () {
  function BehaviorGoToBed(bot, bed) {
    this.bot = bot
    this.bed = bed
    this.stateName = 'goToBed'

    this.isInBed = false
    this.wake = false

    this.bot.on('wake', () => {
      setTimeout(() => {
        this.wake = true
        this.isInBed = false
      }, 2000)
    })
  }
  BehaviorGoToBed.prototype.onStateEntered = function () {
    this.wake = false
    this.isInBed = false
    setTimeout(() => {
      this.sleep()
    }, 500)
  }
  BehaviorGoToBed.prototype.sleep = function () {
    this.bot.sleep(this.bed, (err) => {
      if (err) {
        botWebsocket.log(`I can't sleep: ${err.message}`)
        setTimeout(() => {
          this.sleep()
        }, 10000)
      } else {
        this.isInBed = true
      }
    })
  }
  BehaviorGoToBed.prototype.getIsInBed = function () {
    return this.isInBed
  }
  BehaviorGoToBed.prototype.getWake = function () {
    return this.wake
  }
  return BehaviorGoToBed
}())

module.exports = BehaviorGoToBed
