const botWebsocket = require('../modules/botWebsocket')
module.exports = class template {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDigBlock'

    this.isEndFinished = false
  }

  isFinished () {
    return this.isEndFinished
  }

  onStateEntered () {
    this.isEndFinished = false
    this.checkBlock()
  }

  checkBlock () {
    const block = this.bot.blockAt(this.targets.position)
    if (!block || !this.bot.canDigBlock(block)) {
      botWebsocket.log(`Error mining block: ${block.name}`)
      this.isEndFinished = true
      return
    }

    this.equipToolForBlock(block)
      .then(() => this.startDig(block))
      .catch(function () {
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 200)
      }.bind(this))
  }

  startDig (block) {
    this.bot.dig(block)
      .then(() => {
        this.isEndFinished = true
      })
      .catch(function (err) {
        botWebsocket.log(JSON.stringify(err))
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 200)
      }.bind(this))
  }

  equipToolForBlock (block) {
    return new Promise((resolve, reject) => {
      const tool = this.getBestTool(block)
      if (tool === undefined) {
        resolve()
        return
      }

      const hand = this.bot.heldItem

      if (hand !== null && hand.name === tool.name) {
        resolve()
        return
      }

      this.bot.equip(tool, 'hand')
        .then(() => {
          resolve()
        })
        .catch((err) => {
          botWebsocket.log(`Error on equip tool: ${JSON.stringify(err)}`)
          reject(err)
        })
    })
  }

  getBestTool (block) {
    const items = this.bot.inventory.items()
    const mcData = require('minecraft-data')(this.bot.version)
    const toolsForMaterial = mcData.materials[block.material]

    if (toolsForMaterial === undefined) {
      return undefined
    }

    const toolsIdForMaterial = Object.keys(toolsForMaterial).map(function (x) {
      return parseInt(x, 10)
    })

    // Get all valid tools and add speed
    const tools = items.reduce((validTools, tool) => {
      const returnValidTools = [...validTools]
      const index = toolsIdForMaterial.findIndex(m => m === tool.type)
      if (index >= 0) {
        tool.speedTool = toolsForMaterial[toolsIdForMaterial[index]]
        returnValidTools.push(tool)
      }
      return returnValidTools
    }, [])

    if (tools.length === 0) {
      return undefined
    }

    // Sort the best tool
    tools.sort(function (a, b) {
      return b.speedTool - a.speedTool
    })

    return tools.shift()
  }
}
