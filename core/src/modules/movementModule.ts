
import { LegionStateMachineTargets, Portals, PortalType, Vec3WithDimension, Vec3WithDistance } from "base-types"
import botWebsocket from '@/modules/botWebsocket'
import mineflayerPathfinder from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'
import mcDataLoader from 'minecraft-data'
import { Bot, Dimension_V2 } from "mineflayer"

const parseDestination = (origin: Dimension_V2, destination: Dimension_V2): keyof Portals => {
  if (origin === "overworld" && destination === "the_end") {
    return "overworld_to_the_end"
  }

  if (origin === "overworld" && destination === "the_nether") {
    return "overworld_to_the_nether"
  }

  if (origin === "the_end" && destination === "overworld") {
    return "the_end_to_overworld"
  }

  if (origin === "the_nether" && destination === "overworld") {
    return "the_nether_to_overworld"
  }

  return 'overworld_to_the_nether'
}

const movementModule = (bot: Bot, targets: LegionStateMachineTargets) => {
  const mcData = mcDataLoader(bot.version)
  const getNearestPortal = (dimension: Dimension_V2, destination: Vec3WithDimension) => {
    const portalsFound = findPortals(dimension)
    const portals: Array<Vec3WithDistance> = compareWithCurrentPortals(portalsFound, dimension)

    portals.map(
      (p) => {
        const distanceToPortal = bot.entity.position.distanceTo(p)

        if (
          (bot.game.dimension as Dimension_V2 === 'the_nether' && dimension === 'overworld') ||
          (bot.game.dimension as Dimension_V2 === 'overworld' && dimension === 'the_nether')
        ) {
          const otherDimensionPosition = new Vec3(p.x, p.y, p.z)
          if (dimension === 'overworld') {
            otherDimensionPosition.x = otherDimensionPosition.x * 8
            otherDimensionPosition.z = otherDimensionPosition.z * 8
            const plusDistance = otherDimensionPosition.distanceTo(destination)
            p.distance = distanceToPortal + plusDistance
          }

          if (dimension === 'the_nether') {
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
    let portals: Array<Vec3>
    let dimension: Dimension_V2
    if (bot.game.dimension as Dimension_V2 === 'the_nether') {
      dimension = 'overworld'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)
    }
    if (bot.game.dimension as Dimension_V2 === 'the_end') {
      dimension = 'overworld'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)
    }

    if (bot.game.dimension as Dimension_V2 === 'overworld') {
      dimension = 'the_nether'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)

      dimension = 'the_end'
      portals = findPortals(dimension)
      compareWithCurrentPortals(portals, dimension)
    }
  }

  const compareWithCurrentPortals = (portals: Array<Vec3>, dimension: Dimension_V2): Array<Vec3> => {
    let currentPortals: Array<Vec3> = []

    const selectDimension = parseDestination(bot.game.dimension as Dimension_V2, dimension)
    currentPortals = targets.portals[selectDimension]

    portals.forEach(portal => {
      const portalFound = currentPortals.find(cp => cp.x === portal.x && cp.y === portal.y && cp.z === portal.z)

      if (!portalFound) {
        currentPortals.push(portal)
      }
    })

    botWebsocket.sendAction('setPortals', targets.portals)
    return currentPortals
  }

  const findPortals = (dimension: Dimension_V2): Array<Vec3> => {
    let matching: PortalType | undefined

    if (
      dimension === 'the_nether' && bot.game.dimension as Dimension_V2 === 'overworld' ||
      dimension === 'overworld' && bot.game.dimension as Dimension_V2 === 'the_nether' ||
      dimension === 'the_end' && bot.game.dimension as Dimension_V2 === 'the_nether'
    ) {
      matching = 'nether_portal'
    }

    if (
      dimension === 'the_end' && bot.game.dimension as Dimension_V2 === 'overworld' ||
      dimension === 'overworld' && bot.game.dimension as Dimension_V2 === 'the_end' ||
      dimension === 'the_nether' && bot.game.dimension as Dimension_V2 === 'the_end'
    ) {
      matching = 'end_portal'
    }

    if (!matching) throw new Error('Portal type not found')

    const matchingId = mcData.blocksByName[matching].id

    const blocksFound = bot.findBlocks({
      matching: matchingId,
      maxDistance: 128,
      count: 99
    })

    return blocksFound
  }

  const deleteOldPortal = (position: Vec3, dimension: Dimension_V2) => {
    const newPortals = structuredClone(targets.portals)
    const selectedDim = parseDestination(bot.game.dimension as Dimension_V2, dimension)

    newPortals[selectedDim] = newPortals[selectedDim].filter(portal => {
      return portal.x !== position.x || portal.y !== position.y || portal.z !== position.z
    })

    targets.portals = newPortals;
    botWebsocket.sendAction('setPortals', targets.portals)
  }

  const crossThePortal = (dimension: Dimension_V2, destination: Vec3WithDimension): Promise<void> => {
    return new Promise((resolve, reject) => {
      const portal = getNearestPortal(dimension as Dimension_V2, destination)

      if (!portal) {
        reject(`Can't find the portal to dimension ${dimension}`)
        return
      }

      bot.on('customEventPhysicTick', () => {
        const block = bot.blockAt(new Vec3(portal.x, portal.y, portal.z))
        if (block !== undefined) {
          if (
            (dimension === 'the_nether' && block?.name !== 'nether_portal') ||
            (dimension === 'overworld' && block?.name !== 'nether_portal') ||
            (dimension === 'the_end' && block?.name !== 'end_portal') ||
            (dimension === 'overworld' && block?.name !== 'end_portal')
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