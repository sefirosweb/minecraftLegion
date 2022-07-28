//@ts-nocheck
import low from 'lowdb'
import Filesync from 'lowdb/adapters/FileSync'
import path from 'path'

const botConfiguration = () => {
  const getConn = (botName: string) => {
    const adapter = new Filesync(
      path.join(__dirname, '../botConfig/') + botName + '.json'
    )
    const db = low(adapter)
    const defaultConfig = {
      name: botName,
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
          item: 'sword',
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

  const saveFullConfig = (botName: string, config) => {
    const db = getConn(botName)
    const fullConfig = db.get('config').value()
    const newFullConfig = {
      ...fullConfig,
      ...config
    }
    db.set('config', newFullConfig).write()
  }

  const setJob = (botName: String, job) => {
    const db = getConn(botName)
    db.set('config.job', job).write()
  }

  const getJob = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.job').value()
  }

  const setMode = (botName: string, mode) => {
    const db = getConn(botName)
    db.set('config.mode', mode).write()
  }

  const getMode = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.mode').value()
  }

  const setHelpFriends = (botName: string, mode) => {
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

  const setCanDig = (botName: string, mode) => {
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

  const setCanSleep = (botName: string, mode) => {
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

  const setSleepArea = (botName: string, coords) => {
    const db = getConn(botName)
    db.set('config.sleepArea', coords).write()
  }

  const getSleepArea = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.sleepArea').value()
  }

  const setCanPlaceBlocks = (botName: string, mode) => {
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

  const setFirstPickUpItemsFromKnownChests = (botName: string, mode) => {
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

  const setCanCraftItemWithdrawChest = (botName: string, mode) => {
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

  const setAllowSprinting = (botName: string, mode) => {
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

  const setPickUpItems = (botName: string, mode) => {
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

  const setRandomFarmArea = (botName: string, mode) => {
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

  const setDistance = (botName: string, distance) => {
    const db = getConn(botName)
    db.set('config.distance', distance).write()
  }

  const getDistance = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.distance').value()
  }

  const setPatrol = (botName: string, patrol) => {
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

  const setChests = (botName: string, chests) => {
    const db = getConn(botName)
    db.set('config.chests', chests).write()
  }

  const getAllChests = (botName: string) => {
    const db = getConn(botName)
    const chest = db.get('config.chests').value()
    if (chest === undefined) {
      return {}
    } else {
      return chest
    }
  }

  const setMinerCords = (botName: string, minerCords) => {
    const db = getConn(botName)
    db.set('config.minerCords', minerCords).write()
  }

  const getMinerCords = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.minerCords').value()
  }

  const setItemsToBeReady = (botName: string, itemsToBeReady) => {
    const db = getConn(botName)
    db.set('config.itemsToBeReady', itemsToBeReady).write()
  }

  const getItemsToBeReady = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.itemsToBeReady').value()
  }

  const setItemsCanBeEat = (botName: string, itemsToBeReady) => {
    const db = getConn(botName)
    db.set('config.itemsCanBeEat', itemsToBeReady).write()
  }

  const getItemsCanBeEat = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.itemsCanBeEat').value()
  }

  const setCopingPatrol = (botName: string, status) => {
    const db = getConn(botName)
    db.set('config.isCopingPatrol', status).write()
  }

  const getPlantAreas = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.plantAreas').value()
  }

  const setPlantAreas = (botName: string, plantAreas) => {
    const plantAreasConverted = plantAreas.map((plant) => {
      const copyPlant = {
        plant: plant.plant,
        yLayer: parseInt(plant.yLayer),
        xStart: parseInt(plant.xStart),
        xEnd: parseInt(plant.xEnd),
        zStart: parseInt(plant.zStart),
        zEnd: parseInt(plant.zEnd)
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

  const setFarmAreas = (botName: string, farmAreas) => {
    const farmAreasConverted = farmAreas.map((plant) => {
      const copyFarm = {
        yLayer: parseInt(plant.yLayer),
        xStart: parseInt(plant.xStart),
        xEnd: parseInt(plant.xEnd),
        zStart: parseInt(plant.zStart),
        zEnd: parseInt(plant.zEnd)
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

  const setFarmAnimal = (botName: string, farmAnimal) => {
    const db = getConn(botName)
    db.set('config.farmAnimal', farmAnimal).write()
  }

  const getChestArea = (botName: string) => {
    const db = getConn(botName)
    return db.get('config.chestAreas').value()
  }

  const setChestArea = (botName: string, farmAreas) => {
    const area = farmAreas.map((plant) => {
      const copyArea = {
        yLayer: parseInt(plant.yLayer),
        xStart: parseInt(plant.xStart),
        xEnd: parseInt(plant.xEnd),
        zStart: parseInt(plant.zStart),
        zEnd: parseInt(plant.zEnd)
      }
      return copyArea
    })
    const db = getConn(botName)
    db.set('config.chestAreas', area).write()
  }

  return {
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