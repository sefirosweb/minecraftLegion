const botWebsocket = require('../modules/botWebsocket')
module.exports = class BehaviorMinerCurrentLayer {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentLayer'

    this.minerCords = false
    this.currentLayer = false
    this.endLayer = false

    this.nextLayer = false
    this.firstBlockLayer = true
    this.isEndFinished = false
    this.xIsInverted = false
  }

  isFinished () {
    return this.isEndFinished
  }

  setMinerCords (minerCords) {
    botWebsocket.log('BehaviorMinerCurrentLayer: Set new coords', minerCords)
    this.minerCords = minerCords
    this.firstBlockLayer = true
    this.isEndFinished = false
    this.startLayer()
  }

  startLayer () {
    if (this.minerCords.tunel === 'vertically') {
      this.currentLayer = Math.max(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
      this.endLayer = Math.min(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
    } else {
      // N & S => Z
      if (this.minerCords.orientation === 'n') {
        this.currentLayer = Math.max(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
        this.endLayer = Math.min(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
      }
      if (this.minerCords.orientation === 's') {
        this.currentLayer = Math.min(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
        this.endLayer = Math.max(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
      }
      // W & E => X
      // TODO X
      // throw console.error('No soportado otro metodo')
    }
  }

  onStateEntered () {
    if (this.currentLayer === this.endLayer) {
      this.isEndFinished = true
      botWebsocket.log('Finished all layers')
    } else {
      if (this.firstBlockLayer) {
        this.firstBlockLayer = false
      } else {
        this.currentLayer--
      }

      botWebsocket.log(`Current LAYER ${this.currentLayer}`)
    }
  }

  getCurrentLayerCoords () {
    const minerCoords = {}
    minerCoords.orientation = this.minerCords.orientation
    minerCoords.tunel = this.minerCords.tunel

    if (this.minerCords.tunel === 'vertically') { // => Y Layer
      minerCoords.xStart = parseInt(this.minerCords.xStart)
      minerCoords.xEnd = parseInt(this.minerCords.xEnd)

      minerCoords.yStart = parseInt(this.currentLayer)
      minerCoords.yEnd = parseInt(this.currentLayer)

      minerCoords.zStart = parseInt(this.minerCords.zStart)
      minerCoords.zEnd = parseInt(this.minerCords.zEnd)
    } else {
      if (this.minerCords.orientation === 'n' || this.minerCords.orientation === 's') { // => Z Layer
        minerCoords.xStart = this.minerCords.xStart
        minerCoords.xEnd = this.minerCords.xEnd

        minerCoords.yStart = Math.min(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
        minerCoords.yEnd = Math.max(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))

        minerCoords.zStart = this.currentLayer
        minerCoords.zEnd = this.currentLayer
      }

      // TODO X Layer
      // throw console.error('No soportado otro metodo')
    }

    return minerCoords
  }
}
