
import { LegionStateMachineTargets, MineCordsConfig } from '@/types'

import botWebsocket from '@/modules/botWebsocket'
import { StateBehavior } from 'mineflayer-statemachine';
import { Bot } from 'mineflayer';

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
  x?: number
  y?: number

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
    if (this.minerCords === undefined) {
      throw new Error('Not setted: this.minerCords === undefined')
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
    if (this.minerCords === undefined || this.currentLayer === undefined || this.endLayer === undefined) {
      throw new Error('Not setted: this.minerCords === undefined || this.currentLayer === undefined || this.endLayer === undefined')
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
    if (this.minerCords === undefined || this.currentLayer === undefined) {
      throw new Error('Not setted: this.minerCords === undefined || this.currentLayer === undefined')
    }

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

  getCurrentLayerCoords(): MineCordsConfig {
    if (this.minerCords === undefined || this.currentLayer === undefined) {
      throw new Error('Not setted: this.minerCords === undefined || this.currentLayer === undefined')
    }

    const minerCoords = { ...this.minerCords }

    if (this.minerCords.tunel === 'vertically') { // => Y Layer
      minerCoords.xStart = this.minerCords.xStart
      minerCoords.xEnd = this.minerCords.xEnd

      minerCoords.yStart = this.currentLayer
      minerCoords.yEnd = this.currentLayer

      minerCoords.zStart = this.minerCords.zStart
      minerCoords.zEnd = this.minerCords.zEnd
    } else {
      minerCoords.yStart = Math.min(this.minerCords.yStart, this.minerCords.yEnd)
      minerCoords.yEnd = Math.max(this.minerCords.yStart, this.minerCords.yEnd)

      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') { // => Z Layer
        minerCoords.xStart = this.minerCords.xStart
        minerCoords.xEnd = this.minerCords.xEnd

        minerCoords.zStart = this.currentLayer
        minerCoords.zEnd = this.currentLayer
      }

      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') { // => X Layer
        minerCoords.xStart = this.currentLayer
        minerCoords.xEnd = this.currentLayer

        minerCoords.zStart = this.minerCords.zStart
        minerCoords.zEnd = this.minerCords.zEnd
      }

    }

    return minerCoords
  }
}
