
module.exports = function (bot) {
  const startDig = (block) => {
    return new Promise((resolve, reject) => {
      bot.dig(block)
        .then(() => {
          resolve()
        })
        .catch(function (e) {
          reject(e)
        })
    })
  }

  const digBlock = (position) => {
    return new Promise((resolve, reject) => {
      const block = bot.blockAt(position)
      if (!block || !bot.canDigBlock(block)) {
        reject(new Error(`Error mining block: ${block.name}`))
        return
      }

      equipToolForBlock(block)
        .then(() => {
          startDig(block)
            .then(() => {
              resolve()
            })
            .catch((e) => {
              reject(e)
            })
        })
        .catch(function (err) {
          reject(err)
        })
    })
  }

  const equipToolForBlock = (block) => {
    return new Promise((resolve, reject) => {
      const tool = getBestTool(block)
      if (tool === undefined) {
        resolve()
        return
      }

      const hand = bot.heldItem

      if (hand !== null && hand.name === tool.name) {
        resolve()
        return
      }

      bot.equip(tool, 'hand')
        .then(() => {
          resolve()
        })
        .catch(() => {
          reject(new Error('Error on equip tool'))
        })
    })
  }

  const getBestTool = (block) => {
    const items = bot.inventory.items()
    const mcData = require('minecraft-data')(bot.version)
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
  return {
    digBlock
  }
}
