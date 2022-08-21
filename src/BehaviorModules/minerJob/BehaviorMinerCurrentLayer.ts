
import { Bot, LegionStateMachineTargets, MineCordsConfig } from '@/types'

import botWebsocket from '@/modules/botWebsocket'
import { StateBehavior } from 'mineflayer-statemachine';

export default class BehaviorMinerCurrentLayer implements StateBehavior {
  active: boolean;
  readonly bot: Bot;
  readonly targets: LegionStateMachineTargets;
  stateName: string;

  isEndFinished: boolean
  xIsInverted: boolean


  minerCords: MineCordsConfig | undefined
  currentLayer: number | undefined
  endLayer: number | undefined

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentLayer'

    // this.nextLayer = false
    this.isEndFinished = false
    this.xIsInverted = false
  }

  isFinished() {
    return this.isEndFinished
  }

  setMinerCords(minerCords: MineCordsConfig) {
    botWebsocket.log('BehaviorMinerCurrentLayer: Set new coords' + JSON.stringify(minerCords))
    this.minerCords = minerCords
    this.isEndFinished = false
    this.startLayer()
  }

  startLayer() {
    if (!this.minerCords) {
      return new Error('No mineCords setted')
    }

    if (this.minerCords.tunel === 'vertically') {
      this.currentLayer = Math.max(this.minerCords.yStart, this.minerCords.yEnd)
      this.endLayer = Math.min(this.minerCords.yStart, this.minerCords.yEnd)
    } else {
      // N & S => Z
      if (this.minerCords.orientation === 'z-') {
        this.currentLayer = Math.max(this.minerCords.zStart, this.minerCords.zEnd)
        this.endLayer = Math.min(this.minerCords.zStart, this.minerCords.zEnd)
      }
      if (this.minerCords.orientation === 'z+') {
        this.currentLayer = Math.min(this.minerCords.zStart, this.minerCords.zEnd)
        this.endLayer = Math.max(this.minerCords.zStart, this.minerCords.zEnd)
      }

      if (this.minerCords.orientation === 'x+') {
        this.currentLayer = Math.min(this.minerCords.xStart, this.minerCords.xEnd)
        this.endLayer = Math.max(this.minerCords.xStart, this.minerCords.xEnd)
      }

      if (this.minerCords.orientation === 'x-') {
        this.currentLayer = Math.max(this.minerCords.xStart, this.minerCords.xEnd)
        this.endLayer = Math.min(this.minerCords.xStart, this.minerCords.xEnd)
      }
    }
  }

  onStateEntered() {
    if (!this.minerCords) {
      return new Error('No mineCords setted')
    }

    if (!this.currentLayer) {
      return new Error('No currentLayer setted')
    }

    if (!this.endLayer) {
      return new Error('No v setted')
    }


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

  next() {
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

  getCurrentLayerCoords() {
    const minerCoords: MineCordsConfig = {}
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
