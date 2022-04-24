module.exports = class template {
  constructor(bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorSleep'
    this.isEndFinished = false
    this.bedOcupped = false
    this.cantSleepNow = false
  }

  onStateEntered() {
    this.isEndFinished = false
    this.bedOcupped = false
    this.cantSleepNow = false
    this.interactBlock()
  }

  interactBlock() {
    if (this.targets.position == null) {
      this.isEndFinished = true
      console.log('Block is null')
      return
    }

    const block = this.bot.blockAt(this.targets.position)
    if (block == null || !this.bot.canSeeBlock(block) || !this.bot.isABed(block)) {
      this.isEndFinished = true
      return
    }

    this.bot.sleep(block)
      .then(e => {
        this.isEndFinished = true
      })
      .catch(err => {
        console.log(err.message)
        if (err.message === 'the bed is occupied') {
          this.bedOcupped = true
        } else {
          return this.cantSleepNow = true
        }
      })
  }

  isFinished() {
    return this.isEndFinished
  }

  isOccuped() {
    return this.bedOcupped
  }

  isCantSleepNow() {
    return this.cantSleepNow
  }
}
