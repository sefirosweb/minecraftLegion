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
    const _this = this
    const block = this.bot.blockAt(this.targets.position, true)
    if (!block || !this.bot.canDigBlock(block)) {
      console.log('Error en el bloque:')
      console.log(block)
    }

    const tool = this.getBestTool(block)

    if (tool) {
      this.bot.equip(tool, 'hand')
        .then(() => this.startDig(block))
        .catch(err => {
          console.log(err)
          setTimeout(function () {
            _this.onStateEntered()
          }, 5000)
        })
    } else {
      this.startDig(block)
    }
  }

  startDig (block) {
    const _this = this
    this.bot.dig(block)
      .then(() => {
        this.isEndFinished = true
      })
      .catch(err => {
        console.log(err)
        setTimeout(function () {
          _this.onStateEntered()
        }, 5000)
      })
  }

  getBestTool (block) {
    const items = this.bot.inventory.items()
    const mcData = require('minecraft-data')(this.bot.version)
    const toolsForMaterial = mcData.materials[block.material]
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
