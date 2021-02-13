module.exports = class template {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'template'

    this.isEndFinished = false
  }

  onStateEntered () {
    this.isEndFinished = false
  }

  onStateExited () {

  }

  doSomething () {

  }

  isFinished () {
    return this.isEndFinished
  }
}
