const botWebsocket = require('@modules/botWebsocket')
module.exports = class BehaviorMinerCurrentLayer {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentLayer'

    this.minerCords = false
    this.currentLayer = false
    this.endLayer = false

    this.nextLayer = false
    this.isEndFinished = false
    this.xIsInverted = false
  }

  isFinished () {
    return this.isEndFinished
  }

  setMinerCords (minerCords) {
    botWebsocket.log('BehaviorMinerCurrentLayer: Set new coords', minerCords)
    this.minerCords = minerCords
    this.isEndFinished = false
    this.startLayer()
  }

  startLayer () {
    if (this.minerCords.tunel === 'vertically') {
      this.currentLayer = Math.max(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
      this.endLayer = Math.min(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
    } else {
      // N & S => Z
      if (this.minerCords.orientation === 'z-') {
        this.currentLayer = Math.max(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
        this.endLayer = Math.min(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
      }
      if (this.minerCords.orientation === 'z+') {
        this.currentLayer = Math.min(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
        this.endLayer = Math.max(parseInt(this.minerCords.zStart), parseInt(this.minerCords.zEnd))
      }

      if (this.minerCords.orientation === 'x+') {
        this.currentLayer = Math.min(parseInt(this.minerCords.xStart), parseInt(this.minerCords.xEnd))
        this.endLayer = Math.max(parseInt(this.minerCords.xStart), parseInt(this.minerCords.xEnd))
      }

      if (this.minerCords.orientation === 'x-') {
        this.currentLayer = Math.max(parseInt(this.minerCords.xStart), parseInt(this.minerCords.xEnd))
        this.endLayer = Math.min(parseInt(this.minerCords.xStart), parseInt(this.minerCords.xEnd))
      }
    }
  }

  onStateEntered () {
    if (this.minerCords.tunel === 'vertically' && this.currentLayer < this.endLayer) { this.isEndFinished = true }

    if (this.minerCords.tunel === 'horizontally' && this.currentLayer < this.endLayer &&
      (
        this.minerCords.orientation === 'z-' ||
        this.minerCords.orientation === 'x-'
      )
    ) { this.isEndFinished = true }

    if (this.minerCords.tunel === 'horizontally' && this.currentLayer > this.endLayer &&
      (
        this.minerCords.orientation === 'z+' ||
        this.minerCords.orientation === 'x+'
      )
    ) { this.isEndFinished = true }
  }

  next () {
    switch (true) {
      case this.minerCords.tunel === 'vertically':
        this.currentLayer--
        break
      case this.minerCords.tunel === 'horizontally' &&
        (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'x-'):
        this.currentLayer--
        break
      case this.minerCords.tunel === 'horizontally' &&
        (this.minerCords.orientation === 'z+' || this.minerCords.orientation === 'x+'):
        this.currentLayer++
        break
    }
  }

  getCurrentLayerCoords () {
    const minerCoords = {}
    minerCoords.orientation = this.minerCords.orientation
    minerCoords.tunel = this.minerCords.tunel
    minerCoords.reverse = this.minerCords.reverse

    if (this.minerCords.tunel === 'vertically') { // => Y Layer
      minerCoords.xStart = parseInt(this.minerCords.xStart)
      minerCoords.xEnd = parseInt(this.minerCords.xEnd)

      minerCoords.yStart = parseInt(this.currentLayer)
      minerCoords.yEnd = parseInt(this.currentLayer)

      minerCoords.zStart = parseInt(this.minerCords.zStart)
      minerCoords.zEnd = parseInt(this.minerCords.zEnd)
    } else {
      minerCoords.yStart = Math.min(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
      minerCoords.yEnd = Math.max(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))

      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') { // => Z Layer
        minerCoords.xStart = parseInt(this.minerCords.xStart)
        minerCoords.xEnd = parseInt(this.minerCords.xEnd)

        minerCoords.zStart = parseInt(this.currentLayer)
        minerCoords.zEnd = parseInt(this.currentLayer)
      }

      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') { // => X Layer
        minerCoords.xStart = parseInt(this.currentLayer)
        minerCoords.xEnd = parseInt(this.currentLayer)

        minerCoords.zStart = parseInt(this.minerCords.zStart)
        minerCoords.zEnd = parseInt(this.minerCords.zEnd)
      }
      // TODO X Layer
      // throw console.error('No soportado otro metodo')
    }

    return minerCoords
  }
}
