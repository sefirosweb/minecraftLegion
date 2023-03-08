import fs from 'fs'
import { Config } from 'types/index'
import { Jobs } from 'types/defaultTypes'

// @ts-ignore
import low from 'lowdb'
// @ts-ignore
import Filesync from 'lowdb/adapters/FileSync'
import path from 'path'
import { Vec3 } from 'vec3'

const defaultConfig: Config = {
  job: Jobs.none,
  mode: 'none', // none, pve, pvp
  distance: 10,
  helpFriends: false,
  pickUpItems: false,
  randomFarmArea: false,
  canDig: false,
  canSleep: false,
  sleepArea: undefined,
  canPlaceBlocks: false,
  allowSprinting: false,
  firstPickUpItemsFromKnownChests: true,
  canCraftItemWithdrawChest: true,
  itemsToBeReady: [
    {
      name: 'iron_sword',
      quantity: 1
    }
  ],
  itemsCanBeEat: [
    'bread',
    'carrot',
    'potato',
    'sweet_berries',
    'baked_potato',
    'cooked_chicken',
    'cooked_porkchop',
    'cooked_mutton'
  ],
  plantAreas: [],
  chestAreas: [],
  farmAreas: [],
  farmAnimalSeconds: 60,
  farmAnimal: {
    cow: 10,
    sheep: 10,
    wolf: 10,
    chicken: 10,
    cat: 10,
    horse: 10,
    donkey: 10,
    llama: 10,
    pig: 10,
    rabbit: 10,
    turtle: 10,
    panda: 10,
    fox: 10,
    bee: 10
  },
  minerCords: {
    orientation: 'x+',
    tunel: 'horizontally',
    world: 'overworld',
    xEnd: 0,
    xStart: 0,
    yEnd: 80,
    yStart: 80,
    zEnd: 0,
    zStart: 0,
    reverse: false
  },
  chests: [],
  patrol: []
}

const botConfiguration = (botName: string) => {
  const getConn = () => {

    const dir = path.join(__dirname, '..', 'botConfig')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const adapter = new Filesync(path.join(dir, `${botName}.json`))
    const db = low(adapter)

    db.defaults({ config: defaultConfig }).write()

    db.get('config').value()

    let allDataIsCorrect = true
    const botConfig = db.get('config').value()
    Object.entries(defaultConfig).forEach(entry => {
      const key = entry[0]
      const value = entry[1]

      if (botConfig[key] === undefined) {
        allDataIsCorrect = false
        botConfig[key] = value
      }
    })

    if (!allDataIsCorrect) {
      db.set('config', botConfig).write()
    }

    return db
  }

  const getAll = (): Config => {
    const db = getConn()
    return db.get('config').value()
  }

  const saveFullConfig = (config: Partial<Config>) => {
    const db = getConn()
    const fullConfig = db.get('config').value()
    const newFullConfig = {
      ...fullConfig,
      ...config
    }
    db.set('config', newFullConfig).write()
  }

  const setJob = (job: Config['job']) => {
    const db = getConn()
    db.set('config.job', job).write()
  }

  const getJob = (): Config['job'] => {
    const db = getConn()
    return db.get('config.job').value()
  }

  const setMode = (agro: Config['mode']) => {
    const db = getConn()
    db.set('config.mode', agro).write()
  }

  const getMode = (): Config['mode'] => {
    const db = getConn()
    return db.get('config.mode').value()
  }

  const setHelpFriends = (mode: Config['helpFriends']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.helpFriends', mode).write()
  }

  const getHelpFriends = (): Config['helpFriends'] => {
    const db = getConn()
    return db.get('config.helpFriends').value()
  }

  const setCanDig = (mode: Config['canDig']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canDig', mode).write()
  }

  const getCanDig = (): Config['canDig'] => {
    const db = getConn()
    return db.get('config.canDig').value()
  }

  const setCanSleep = (mode: Config['canSleep']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canSleep', mode).write()
  }

  const getCanSleep = (): Config['canSleep'] => {
    const db = getConn()
    return db.get('config.canSleep').value()
  }

  const setSleepArea = (coords: Config['sleepArea']) => {
    const db = getConn()
    db.set('config.sleepArea', coords).write()
  }

  const getSleepArea = (): Config['sleepArea'] => {
    const db = getConn()
    const coords = db.get('config.sleepArea').value()
    if (!coords) return undefined
    return new Vec3(coords.x, coords.y, coords.z)
  }

  const setCanPlaceBlocks = (mode: Config['canPlaceBlocks']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canPlaceBlocks', mode).write()
  }

  const getCanPlaceBlocks = (): Config['canPlaceBlocks'] => {
    const db = getConn()
    return db.get('config.canPlaceBlocks').value()
  }

  const setFirstPickUpItemsFromKnownChests = (mode: Config['firstPickUpItemsFromKnownChests']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.firstPickUpItemsFromKnownChests', mode).write()
  }

  const getFirstPickUpItemsFromKnownChests = (): Config['firstPickUpItemsFromKnownChests'] => {
    const db = getConn()
    return db.get('config.firstPickUpItemsFromKnownChests').value()
  }

  const setCanCraftItemWithdrawChest = (mode: Config['canCraftItemWithdrawChest']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canCraftItemWithdrawChest', mode).write()
  }

  const getCanCraftItemWithdrawChest = (): Config['canCraftItemWithdrawChest'] => {
    const db = getConn()
    return db.get('config.canCraftItemWithdrawChest').value()
  }

  const setAllowSprinting = (mode: Config['allowSprinting']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.allowSprinting', mode).write()
  }

  const getAllowSprinting = (): Config['allowSprinting'] => {
    const db = getConn()
    return db.get('config.allowSprinting').value()
  }

  const setPickUpItems = (mode: Config['pickUpItems']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }

    db.set('config.pickUpItems', mode).write()
  }

  const getPickUpItems = (): Config['pickUpItems'] => {
    const db = getConn()
    return db.get('config.pickUpItems').value()
  }

  const setRandomFarmArea = (mode: Config['randomFarmArea']) => {
    const db = getConn()
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }

    db.set('config.randomFarmArea', mode).write()
  }

  const getRandomFarmArea = (): Config['randomFarmArea'] => {
    const db = getConn()
    return db.get('config.randomFarmArea').value()
  }

  const setDistance = (distance: Config['distance']) => {
    const db = getConn()
    db.set('config.distance', distance).write()
  }

  const getDistance = (): Config['distance'] => {
    const db = getConn()
    return db.get('config.distance').value()
  }

  const setPatrol = (patrol: Config['patrol']) => {
    const db = getConn()
    db.set('config.patrol', patrol).write()
  }

  const getPatrol = (): Config['patrol'] => {
    const db = getConn()
    return db.get('config.patrol').value()
  }

  const setChests = (chests: Config['chests']) => {
    const db = getConn()
    db.set('config.chests', chests).write()
  }

  const getChests = (): Config['chests'] => {
    const db = getConn()
    return db.get('config.chests').value()
  }

  const getAllChests = (): Config['chests'] => {
    const chest = getChests()

    if (chest === undefined) {
      return []
    } else {
      chest.map(c => {
        return {
          dimension: c.dimension,
          items: c.items,
          type: c.type,
          position: new Vec3(c.position.x, c.position.y, c.position.z)
        }
      })

      return chest
    }
  }

  const setMinerCords = (minerCords: Config['minerCords']) => {
    const db = getConn()
    db.set('config.minerCords', minerCords).write()
  }

  const getMinerCords = (): Config['minerCords'] => {
    const db = getConn()
    return db.get('config.minerCords').value()
  }

  const setItemsToBeReady = (itemsToBeReady: Config['itemsToBeReady']) => {
    const db = getConn()
    db.set('config.itemsToBeReady', itemsToBeReady).write()
  }

  const getItemsToBeReady = (): Config['itemsToBeReady'] => {
    const db = getConn()
    return db.get('config.itemsToBeReady').value()
  }

  const setItemsCanBeEat = (itemsCanBeEat: Config['itemsCanBeEat']) => {
    const db = getConn()
    db.set('config.itemsCanBeEat', itemsCanBeEat).write()
  }

  const getItemsCanBeEat = (): Config['itemsCanBeEat'] => {
    const db = getConn()
    return db.get('config.itemsCanBeEat').value()
  }

  const setPlantAreas = (plantAreas: Config['plantAreas']) => {
    const db = getConn()
    db.set('config.plantAreas', plantAreas).write()
  }

  const getPlantAreas = (): Config['plantAreas'] => {
    const db = getConn()
    return db.get('config.plantAreas').value()
  }

  const setFarmAreas = (farmAreas: Config['farmAreas']) => {
    const farmAreasConverted = farmAreas.map((plant) => {
      const copyFarm = {
        yLayer: plant.yLayer,
        xStart: plant.xStart,
        xEnd: plant.xEnd,
        zStart: plant.zStart,
        zEnd: plant.zEnd
      }
      return copyFarm
    })
    const db = getConn()
    db.set('config.farmAreas', farmAreasConverted).write()
  }

  const getFarmAreas = (): Config['farmAreas'] => {
    const db = getConn()
    return db.get('config.farmAreas').value()
  }

  const setFarmAnimal = (farmAnimal: Config['farmAnimal']) => {
    const db = getConn()
    db.set('config.farmAnimal', farmAnimal).write()
  }

  const getFarmAnimal = (): Config['farmAnimal'] => {
    const db = getConn()
    return db.get('config.farmAnimal').value()
  }

  const setChestArea = (farmAreas: Config['chestAreas']) => {
    const area = farmAreas.map((plant) => {
      const copyArea = {
        yLayer: plant.yLayer,
        xStart: plant.xStart,
        xEnd: plant.xEnd,
        zStart: plant.zStart,
        zEnd: plant.zEnd
      }
      return copyArea
    })
    const db = getConn()
    db.set('config.chestAreas', area).write()
  }

  const getChestArea = (): Config['chestAreas'] => {
    const db = getConn()
    return db.get('config.chestAreas').value()
  }

  return {
    defaultConfig,
    getAll,
    saveFullConfig,
    setJob,
    getJob,
    setMode,
    getMode,
    setHelpFriends,
    getHelpFriends,
    setDistance,
    getDistance,
    setPatrol,
    getPatrol,
    getAllChests,
    setMinerCords,
    getMinerCords,
    setPickUpItems,
    getPickUpItems,
    setItemsToBeReady,
    getItemsToBeReady,
    getItemsCanBeEat,
    setItemsCanBeEat,
    getChests,
    setChests,
    setCanDig,
    getCanDig,
    setCanSleep,
    getCanSleep,
    setSleepArea,
    getSleepArea,
    setCanPlaceBlocks,
    getCanPlaceBlocks,
    setFirstPickUpItemsFromKnownChests,
    getFirstPickUpItemsFromKnownChests,
    setCanCraftItemWithdrawChest,
    getCanCraftItemWithdrawChest,
    setAllowSprinting,
    getAllowSprinting,
    getPlantAreas,
    setPlantAreas,
    getFarmAreas,
    setFarmAreas,
    getFarmAnimal,
    setFarmAnimal,
    getRandomFarmArea,
    setRandomFarmArea,
    getChestArea,
    setChestArea
  }
}

export default botConfiguration