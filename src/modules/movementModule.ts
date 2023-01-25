
import { Bot, Dimensions, LegionStateMachineTargets, Portals, Vec3WithDimension, Vec3WithDistance } from "@/types"
import botWebsocket from '@/modules/botWebsocket'
import mineflayerPathfinder from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'
import mcDataLoader from 'minecraft-data'

const dimensions = {
  'minecraft:overworld': 'overworld',
  'minecraft:the_end': 'the_end',
  'minecraft:the_nether': 'the_nether',
}

const movementModule = (bot: Bot, targets: LegionStateMachineTargets) => {
  const mcData = mcDataLoader(bot.version)
  const getNearestPortal = (dimension: Dimensions, destination: Vec3WithDimension) => {
    const portalsFound = findPortals(dimension)
    const portals: Array<Vec3WithDistance> = compareWithCurrentPortals(portalsFound, dimension)

    portals.map(
      (p) => {
        const distanceToPortal = bot.entity.position.distanceTo(p)

        if (
          (bot.game.dimension === 'minecraft:the_nether' && dimension === 'minecraft:overworld') ||
          (bot.game.dimension === 'minecraft:overworld' && dimension === 'minecraft:the_nether')
        ) {
          const otherDimensionPosition = new Vec3(p.x, p.y, p.z)
          if (dimension === 'minecraft:overworld') {
            otherDimensionPosition.x = otherDimensionPosition.x * 8
            otherDimensionPosition.z = otherDimensionPosition.z * 8
            const plusDistance = otherDimensionPosition.distanceTo(destination)
            p.distance = distanceToPortal + plusDistance
          }

          if (dimension === 'minecraft:the_nether') {
            otherDimensionPosition.x = otherDimensionPosition.x / 8
            otherDimensionPosition.z = otherDimensionPosition.z / 8
            const plusDistance = otherDimensionPosition.distanceTo(destination)
            p.distance = distanceToPortal + plusDistance
          }
        } else {
          p.distance = distanceToPortal
        }

        return p
      }
    )
      .sort(
        (a, b) => {
          return (a.distance ?? Infinity) - (b.distance ?? Infinity)
        }
      )

    const portal = portals[0]
    return portal
  }

  const checkPortalsOnSpawn = () => {
    let portals, dimension: Dimensions
    if (bot.game.dimension === 'minecraft:the_nether') {
      dimension = 'minecraft:overworld'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)
    }
    if (bot.game.dimension === 'minecraft:the_end') {
      dimension = 'minecraft:overworld'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)
    }

    if (bot.game.dimension === 'minecraft:overworld') {
      dimension = 'minecraft:the_nether'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)

      dimension = 'minecraft:the_end'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)
    }
  }

  const compareWithCurrentPortals = (portals: Array<Vec3>, dimension: Dimensions): Array<Vec3> => {
    let currentPortals: Array<Vec3> = []
    if (bot.game.dimension === 'minecraft:the_nether' && dimension === 'minecraft:overworld') {
      currentPortals = targets.portals.the_nether
    }
    if (bot.game.dimension === 'minecraft:the_end' && dimension === 'minecraft:overworld') {
      currentPortals = targets.portals.the_end
    }

    if (bot.game.dimension === 'minecraft:overworld' && dimension === 'minecraft:the_nether') {
      currentPortals = targets.portals.overworld.the_nether
    }

    if (bot.game.dimension === 'minecraft:overworld' && dimension === 'minecraft:the_end') {
      currentPortals = targets.portals.overworld.the_end
    }

    portals.forEach(portal => {
      const portalFound = currentPortals.find(cp => cp.x === portal.x && cp.y === portal.y && cp.z === portal.z)

      if (!portalFound) {
        currentPortals.push(portal)
      }
    })

    botWebsocket.sendAction('setPortals', targets.portals)
    return currentPortals
  }

  const findPortals = (dimension: Dimensions): Array<Vec3> => {
    let matching
    if ( // Nether portal
      dimension === 'minecraft:the_nether' && bot.game.dimension === 'minecraft:overworld' ||
      dimension === 'minecraft:overworld' && bot.game.dimension === 'minecraft:the_nether' ||
      dimension === 'minecraft:the_end' && bot.game.dimension === 'minecraft:the_nether'
    ) {
      matching = 'nether_portal'
    }

    if ( // End Portal
      dimension === 'minecraft:the_end' && bot.game.dimension === 'minecraft:overworld' ||
      dimension === 'minecraft:overworld' && bot.game.dimension === 'minecraft:the_end' ||
      dimension === 'minecraft:the_nether' && bot.game.dimension === 'minecraft:the_end'
    ) {
      matching = 'end_portal'
    }

    const matchingId = [matching].map(name => name && mcData.blocksByName[name].id) as number[]

    const blocksFound = bot.findBlocks({
      matching: matchingId,
      maxDistance: 128,
      count: 99
    })

    return blocksFound
  }

  const deleteOldPortal = (position: Vec3, dimension: Dimensions) => {
    const newPortals = JSON.parse(JSON.stringify(targets.portals)) as Portals

    const currentDim = dimensions[bot.game.dimension]
    const selectedDim = dimensions[dimension]

    //@ts-ignore
    const portalDimension = currentDim === 'overworld' ? newPortals['overworld'][selectedDim] as Array<Vec3> : newPortals[currentDim] as Array<Vec3>

    const portalsToSave = portalDimension.filter(portal => {
      return portal.x !== position.x || portal.y !== position.y || portal.z !== position.z
    })

    if (currentDim === 'overworld') {
      //@ts-ignore
      newPortals['overworld'][selectedDim] = portalsToSave
    } else {
      //@ts-ignore
      newPortals[selectedDim] = portalsToSave
    }

    targets.portals = newPortals;
    botWebsocket.sendAction('setPortals', targets.portals)
  }

  const crossThePortal = (dimension: Dimensions, destination: Vec3WithDimension): Promise<void> => {
    return new Promise((resolve, reject) => {
      const portal = getNearestPortal(dimension, destination)

      if (!portal) {
        reject(`Can't find the portal to dimension ${dimension}`)
        return
      }

      bot.on('customEventPhysicTick', () => {
        const block = bot.blockAt(new Vec3(portal.x, portal.y, portal.z))
        if (block !== undefined) {
          if (
            (dimension === 'minecraft:the_nether' && block?.name !== 'nether_portal') ||
            (dimension === 'minecraft:overworld' && block?.name !== 'nether_portal') ||
            (dimension === 'minecraft:the_end' && block?.name !== 'end_portal') ||
            (dimension === 'minecraft:overworld' && block?.name !== 'end_portal')
          ) {
            deleteOldPortal(portal, dimension)
            reject(`Portal not found!`) // TODO pending to check if works fine
          }
        }
      })

      goPosition(portal)
        .then(waitUntilSpawn)
        .then(resolve)
    })
  }

  const waitUntilSpawn = (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('spawn', () => {
        bot.removeAllListeners('customEventPhysicTick')
        setTimeout(() => {
          resolve()
        }, 2000)
      })
    })
  }

  const goPosition = (position: Vec3): Promise<void> => {
    const goal = new mineflayerPathfinder.goals.GoalBlock(position.x, position.y, position.z)
    bot.pathfinder.setMovements(targets.movements)
    bot.pathfinder.setGoal(goal)

    return new Promise((resolve) => {
      bot.once('goal_reached', () => {
        resolve()
      })
    })
  }

  const getAllBlocksExceptLeafs = () => {
    return mcData.blocksArray.filter(b => !b.name.includes('leave')).map(b => b.id)
  }

  return {
    getNearestPortal,
    checkPortalsOnSpawn,
    crossThePortal,
    getAllBlocksExceptLeafs
  }
}

export default movementModule