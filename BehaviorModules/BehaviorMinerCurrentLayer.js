module.exports = class BehaviorMinerCurrentLayer {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentLayer'

    this.minerCords = false
    this.currentLayer = 0

    this.minerMethod = 'vertically' // Can use Horizontally or Vertically
    this.nextLayer = false
  }

  setMinerCords (minerCords) {
    console.log('BehaviorMinerCurrentLayer: Set new coords', minerCords)
    this.minerCords = minerCords
    this.startLayer()
  }

  startLayer () {
    if (this.minerMethod === 'vertically') {
      if (this.minerCords.yStart > this.minerCords.yEnd) {
        this.currentLayer = this.minerCords.yStart
      } else {
        this.currentLayer = this.minerCords.yEnd
      }
    } else {
      throw console.error('No soportado otro metodo')
    }
  }

  onStateEntered () {
    this.currentLayer--
  }

  getCurrentLayerCoords () {
    if (this.minerMethod === 'vertically') {
      const minerCoords = {
        xStart: this.minerCords.xStart,
        yStart: this.currentLayer,
        zStart: this.minerCords.zStart,
        xEnd: this.minerCords.xEnd,
        yEnd: this.currentLayer,
        zEnd: this.minerCords.zEnd
      }
      // console.log(minerCoords)
      return minerCoords
    } else {
      throw console.error('No soportado otro metodo')
    }
  }
}
