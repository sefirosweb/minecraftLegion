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
    const block = this.bot.blockAt(this.targets.position, true)
    if (!block || !this.bot.canDigBlock(block)) {
      console.log(`Block error: ${block.name}`)
      this.isEndFinished = true
      return
    }

    this.equipToolForBlock(block)
      .then(() => this.startDig(block))
      .catch(err => {
        console.log(err)
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 200)
      })
  }

  startDig (block) {
    this.bot.dig(block)
      .then(() => {
        this.isEndFinished = true
      })
      .catch(err => {
        console.log(err)
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 200)
      })
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
        .catch(err => {
          console.log(`Error on equip tool: ${tool.name}`)
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
