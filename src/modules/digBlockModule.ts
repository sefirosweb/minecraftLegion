
import { Bot, CustomItem } from "@/types"
import { Vec3 } from "vec3"
import { Block } from 'prismarine-block'
import mcDataLoader from 'minecraft-data'
import { Item } from 'prismarine-item';

const digBlockModule = (bot: Bot) => {
  const startDig = (block: Block) => {
    return new Promise((resolve, reject) => {
      bot.dig(block)
        .then(resolve)
        .catch((e) => {
          bot.stopDigging()
          reject(e)
        })
    })
  }

  const digBlock = (position: Vec3) => {
    return new Promise((resolve, reject) => {
      const block = bot.blockAt(position)
      if (!block || !bot.canDigBlock(block)) {
        reject(new Error(`Error mining block: ${position.toString()}`))
        return
      }

      equipToolForBlock(block)
        .then(() => startDig(block))
        .then(resolve)
        .catch(reject)
    })
  }

  const equipToolForBlock = (block: Block): Promise<void> => {
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
        .then(resolve)
        .catch(() => {
          reject(new Error('Error on equip tool'))
        })
    })
  }

  const getBestTool = (block: Block): Item | undefined => {
    const items = bot.inventory.items() as Array<CustomItem>
    const mcData = mcDataLoader(bot.version)

    if (!block.material) {
      return undefined
    }

    const toolsForMaterial = mcData.materials[block.material]

    if (toolsForMaterial === undefined) {
      return undefined
    }

    const toolsIdForMaterial = Object.keys(toolsForMaterial).map(function (x) {
      return parseInt(x, 10)
    })

    const tools: Array<CustomItem> = []

    // Get all valid tools and add speed
    items.forEach((tool) => {
      const index = toolsIdForMaterial.findIndex(m => m === tool.type)
      if (index >= 0) {
        tool.speedTool = toolsForMaterial[toolsIdForMaterial[index]]
        tools.push(tool)
      }
    })

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


export default digBlockModule