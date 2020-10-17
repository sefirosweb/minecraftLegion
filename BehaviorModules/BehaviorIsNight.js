const BehaviorIsNight = (function () {
  function BehaviorIsNight (bot) {
    this.bot = bot
    this.active = true
    this.stateName = 'isNight'
    this.night = false
    this.bed = false
  }
  BehaviorIsNight.prototype.check = function () {
    const timeOfDay = this.bot.time.timeOfDay
    if ((timeOfDay >= 100 && timeOfDay <= 12040)) {
      this.night = false
    } else {
      this.night = true
      this.checkNearBed()
    }
  }
  BehaviorIsNight.prototype.getIsNight = function () {
    return this.night
  }

  BehaviorIsNight.prototype.getBed = function () {
    return this.bed
  }

  BehaviorIsNight.prototype.checkNearBed = function () {
    const bed = this.bot.findBlock({
      matching: block => this.bot.isABed(block)
    })

    if (bed === null) {
      this.bed = false
    } else {
      this.bed = bed
    }
  }

  return BehaviorIsNight
}())

module.exports = BehaviorIsNight
