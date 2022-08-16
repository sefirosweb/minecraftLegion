
import { Agro, Chests, Config, FarmAnimal, Item, Layer, MineCordsConfig, PlantArea } from '@/types'
import { Jobs } from '@/types/defaultTypes'

//@ts-ignore
import low from 'lowdb'
//@ts-ignore
import Filesync from 'lowdb/adapters/FileSync'
import path from 'path'
import { Vec3 } from 'vec3'

const defaultConfig = {
  job: 'none', // guard, miner -- For a now...
  mode: 'none', // none, pve, pvp
  distance: 10,
  helpFriends: false,
  pickUpItems: false,
  randomFarmArea: false,
  isCopingPatrol: false,
  canDig: false,
  canSleep: true,
  sleepArea: {
    x: null,
    y: null,
    z: null
  },
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
  chests: [],
  patrol: [],
  plantAreas: [],
  chestAreas: [],
  farmAreas: [],
  farmAnimal: {
    seconds: 60,
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
    turtles: 10,
    panda: 10,
    fox: 10,
    bee: 10
  },
  minerCords: {
    xStart: null,
    yStart: null,
    zStart: null,
    xEnd: null,
    yEnd: null,
    zEnd: null,
    orientation: null,
    tunel: null,
    reverse: false
  }
}

const botConfiguration = () => {
  const getConn = (botName: string) => {
    const adapter = new Filesync(
      path.join(__dirname, '../botConfig/') + botName + '.json'
    )
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

  const getAll = (botName: string) => {
    const db = getConn(botName)
    return db.get('config').value()
  }

  const saveFullConfig = (botName: string, config: Partial<Config>) => {
    const db = getConn(botName)
    const fullConfig = db.get('config').value()
    const newFullConfig = {
      ...fullConfig,
      ...config
    }
    db.set('config', newFullConfig).write()
  }

  const setJob = (botName: string, job: Jobs) => {
    const db = getConn(botName)
    db.set('config.job', job).write()
  }

  const getJob = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.job').value()
  }

  const setMode = (botName: string, agro: Agro) => {
    const db = getConn(botName)
    db.set('config.mode', agro).write()
  }

  const getMode = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.mode').value()
  }

  const setHelpFriends = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.helpFriends', mode).write()
  }

  const getHelpFriends = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.helpFriends').value()
  }

  const setCanDig = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canDig', mode).write()
  }

  const getCanDig = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.canDig').value()
  }

  const setCanSleep = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canSleep', mode).write()
  }

  const getCanSleep = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.canSleep').value()
  }

  const setSleepArea = (botName: string, coords: Vec3) => {
    const db = getConn(botName)
    db.set('config.sleepArea', coords).write()
  }

  const getSleepArea = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.sleepArea').value()
  }

  const setCanPlaceBlocks = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canPlaceBlocks', mode).write()
  }

  const getCanPlaceBlocks = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.canPlaceBlocks').value()
  }

  const setFirstPickUpItemsFromKnownChests = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.firstPickUpItemsFromKnownChests', mode).write()
  }

  const getFirstPickUpItemsFromKnownChests = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.firstPickUpItemsFromKnownChests').value()
  }

  const setCanCraftItemWithdrawChest = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.canCraftItemWithdrawChest', mode).write()
  }

  const getCanCraftItemWithdrawChest = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.canCraftItemWithdrawChest').value()
  }

  const setAllowSprinting = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }
    db.set('config.allowSprinting', mode).write()
  }

  const getAllowSprinting = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.allowSprinting').value()
  }

  const setPickUpItems = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }

    db.set('config.pickUpItems', mode).write()
  }

  const getPickUpItems = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.pickUpItems').value()
  }

  const setRandomFarmArea = (botName: string, mode: boolean) => {
    const db = getConn(botName)
    if (mode === true) {
      mode = true
    } else {
      mode = false
    }

    db.set('config.randomFarmArea', mode).write()
  }

  const getRandomFarmArea = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.randomFarmArea').value()
  }

  const setDistance = (botName: string, distance: number) => {
    const db = getConn(botName)
    db.set('config.distance', distance).write()
  }

  const getDistance = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.distance').value()
  }

  const setPatrol = (botName: string, patrol: Array<Vec3>) => {
    const db = getConn(botName)
    db.set('config.patrol', patrol).write()
  }

  const getPatrol = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.patrol').value()
  }

  const getChests = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.chests').value()
  }

  const setChests = (botName: string, chests: Chests) => {
    const db = getConn(botName)
    db.set('config.chests', chests).write()
  }

  const getAllChests = (botName: string) => {
    const db = getConn(botName)
    //@ts-ignore
    const chest = db.get('config.chests').value().map(c => {
      return {
        dimension: c.dimension,
        items: c.items,
        type: c.type,
        position: new Vec3(c.position.x, c.position.y, c.position.z)
      }
    })
    if (chest === undefined) {
      return {}
    } else {
      return chest
    }
  }

  const setMinerCords = (botName: string, minerCords: MineCordsConfig) => {
    const db = getConn(botName)
    db.set('config.minerCords', minerCords).write()
  }

  const getMinerCords = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.minerCords').value()
  }

  const setItemsToBeReady = (botName: string, itemsToBeReady: Array<Item>) => {
    const db = getConn(botName)
    db.set('config.itemsToBeReady', itemsToBeReady).write()
  }

  const getItemsToBeReady = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.itemsToBeReady').value()
  }

  const setItemsCanBeEat = (botName: string, itemsToBeReady: Array<Item>) => {
    const db = getConn(botName)
    db.set('config.itemsCanBeEat', itemsToBeReady).write()
  }

  const getItemsCanBeEat = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.itemsCanBeEat').value()
  }

  const setCopingPatrol = (botName: string, status: boolean) => {
    const db = getConn(botName)
    db.set('config.isCopingPatrol', status).write()
  }

  const getPlantAreas = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.plantAreas').value()
  }

  const setPlantAreas = (botName: string, plantAreas: Array<PlantArea>) => {
    const plantAreasConverted: Array<PlantArea> = plantAreas.map((plant) => {
      const copyPlant = {
        plant: plant.plant,
        yLayer: typeof plant.yLayer === 'string' ? parseInt(plant.yLayer) : plant.yLayer,
        xStart: typeof plant.xStart === 'string' ? parseInt(plant.xStart) : plant.xStart,
        xEnd: typeof plant.xEnd === 'string' ? parseInt(plant.xEnd) : plant.xEnd,
        zStart: typeof plant.zStart === 'string' ? parseInt(plant.zStart) : plant.zStart,
        zEnd: typeof plant.zEnd === 'string' ? parseInt(plant.zEnd) : plant.zEnd
      }
      return copyPlant
    })
    const db = getConn(botName)
    db.set('config.plantAreas', plantAreasConverted).write()
  }

  const getFarmAreas = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.farmAreas').value()
  }

  const setFarmAreas = (botName: string, farmAreas: Array<Layer>) => {
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
    const db = getConn(botName)
    db.set('config.farmAreas', farmAreasConverted).write()
  }

  const getFarmAnimal = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.farmAnimal').value()
  }

  const setFarmAnimal = (botName: string, farmAnimal: FarmAnimal) => {
    const db = getConn(botName)
    db.set('config.farmAnimal', farmAnimal).write()
  }

  const getChestArea = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.chestAreas').value()
  }

  const setChestArea = (botName: string, farmAreas: Array<Layer>) => {
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
    const db = getConn(botName)
    db.set('config.chestAreas', area).write()
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
    setCopingPatrol,
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