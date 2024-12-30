import { Bot } from 'mineflayer'
import { Vec3 } from 'vec3'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'minecraftlegion-statemachine'
import { plants, botWebsocket } from '@/modules'
import { BehaviorDigBlock, BehaviorEatFood, BehaviorInteractBlock, BehaviorMoveTo } from '@/BehaviorModules'
import { LegionStateMachineTargets } from 'base-types'

function harvestFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 325
  eatFood.y = 113

  const goPlant = new BehaviorMoveTo(bot, targets, 10000)
  goPlant.stateName = 'Go Plant'
  goPlant.movements = targets.movements
  goPlant.x = 525
  goPlant.y = 413

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 225
  exit.y = 413

  const checkArea = new BehaviorIdle()
  checkArea.stateName = 'Check Area for Harvest'
  checkArea.x = 525
  checkArea.y = 113

  const checkHarvest = new BehaviorIdle()
  checkHarvest.stateName = 'Exist Any Plant To Harvest'
  checkHarvest.x = 225
  checkHarvest.y = 263

  const harvestPlant = new BehaviorDigBlock(bot, targets)
  harvestPlant.stateName = 'Harvest Plant'
  harvestPlant.x = 625
  harvestPlant.y = 263

  const interactWithPlant = new BehaviorInteractBlock(bot, targets)
  interactWithPlant.stateName = 'Interact Plant'
  interactWithPlant.x = 425
  interactWithPlant.y = 263

  let harvestIsFinished = false

  function checkPlantAge() {
    const block = getPlantBlock()

    if (block === undefined) {
      harvestIsFinished = true
      return
    }
    targets.digBlock = block
    harvestIsFinished = false
  }

  function getPlantBlock() {
    if (!targets.farmerJob.plantArea) return undefined

    const plantArea = targets.farmerJob.plantArea

    const xStart = plantArea.layer.xStart! < plantArea.layer.xEnd! ? plantArea.layer.xStart! : plantArea.layer.xEnd!
    const xEnd = plantArea.layer.xStart! > plantArea.layer.xEnd! ? plantArea.layer.xStart! : plantArea.layer.xEnd!
    const zStart = plantArea.layer.zStart! < plantArea.layer.zEnd! ? plantArea.layer.zStart! : plantArea.layer.zEnd!
    const zEnd = plantArea.layer.zStart! > plantArea.layer.zEnd! ? plantArea.layer.zStart! : plantArea.layer.zEnd!
    const yLayer = plantArea.layer.yLayer! + 1
    const plant = plantArea.plant!
    const plantName = plants[plant].plantName
    const type = plants[plant].type
    const age = plants[plant].age

    if (type === 'normal' || type === 'sweet_berries') {
      for (let xCurrent = xStart; xCurrent <= xEnd; xCurrent++) {
        for (let zCurrent = zStart; zCurrent <= zEnd; zCurrent++) {
          const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent), true)
          if (block && block.name === plantName && block.metadata === age) {
            targets.position = new Vec3(block.position.x, yLayer, block.position.z)
            return block
          }
        }
      }
    }

    if (type === 'sapling') {
      for (let xCurrent = xStart; xCurrent <= xEnd; xCurrent++) {
        for (let zCurrent = zStart; zCurrent <= zEnd; zCurrent++) {
          const block = bot.blockAt(new Vec3(xCurrent, yLayer + 1, zCurrent), true)
          if (block && block.name === plantName) {
            targets.position = new Vec3(block.position.x, yLayer + 1, block.position.z)
            return block
          }
        }
      }
    }

    if (type === 'melon') {
      for (let xCurrent = xStart - 1; xCurrent <= xEnd + 1; xCurrent++) {
        for (let zCurrent = zStart - 1; zCurrent <= zEnd + 1; zCurrent++) {
          const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent), true)
          if (block && block.name === plantName) {
            targets.position = new Vec3(block.position.x, yLayer, block.position.z)
            return block
          }
        }
      }
    }

    if (type === 'tree') {
      for (let xCurrent = xStart - 2; xCurrent <= xEnd + 2; xCurrent++) {
        for (let zCurrent = zStart - 2; zCurrent <= zEnd + 2; zCurrent++) {
          for (let yCurrent = yLayer; yCurrent <= yLayer + 6; yCurrent++) {
            const block = bot.blockAt(new Vec3(xCurrent, yCurrent, zCurrent), true)
            if (block && block.name.includes('log') /* || block.name.includes('leave') */) {
              targets.position = new Vec3(block.position.x, yLayer, block.position.z)
              return block
            }
          }
        }
      }
    }

    return undefined
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: eatFood,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: eatFood,
      child: checkArea,
      onTransition: () => {
        harvestIsFinished = false
      },
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: checkArea,
      child: checkHarvest,
      onTransition: () => {
        checkPlantAge()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkHarvest,
      child: exit,
      shouldTransition: () => harvestIsFinished
    }),

    new StateTransition({
      parent: checkHarvest,
      child: goPlant,
      shouldTransition: () => !harvestIsFinished
    }),

    new StateTransition({
      parent: goPlant,
      child: harvestPlant,
      onTransition: () => {
        targets.position = targets.digBlock?.position.clone()
        // botWebsocket.log(`Error on go to plant ${targets.farmerJob.plantArea.plant}`)
      },
      shouldTransition: () => targets.digBlock !== undefined && bot.canDigBlock(targets.digBlock) && !bot.pathfinder.isMining() && targets.farmerJob.plantArea?.plant !== 'sweet_berries'
    }),

    new StateTransition({
      parent: goPlant,
      child: interactWithPlant,
      onTransition: () => {
        targets.position = targets.digBlock?.position.clone()
      },
      shouldTransition: () => targets.digBlock !== undefined && bot.canDigBlock(targets.digBlock) && bot.canSeeBlock(targets.digBlock) && !bot.pathfinder.isMining() && targets.farmerJob.plantArea?.plant === 'sweet_berries'
    }),

    new StateTransition({
      parent: goPlant,
      child: exit,
      onTransition: () => {
        botWebsocket.log(`Error on go to plant ${targets.farmerJob.plantArea?.plant}`)
      },
      shouldTransition: () => goPlant.isFinished() && !goPlant.isSuccess()
    }),

    new StateTransition({
      parent: interactWithPlant,
      child: checkArea,
      shouldTransition: () => interactWithPlant.isFinished()
    }),

    new StateTransition({
      parent: harvestPlant,
      child: checkArea,
      shouldTransition: () => harvestPlant.isFinished()
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'harvestFunction'
  return nestedState
}

export default harvestFunction
