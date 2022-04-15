const low = require("lowdb");
const Filesync = require("lowdb/adapters/FileSync");
const path = require("path");

function getConn(botName) {
  const adapter = new Filesync(
    path.join(__dirname, "../botConfig/") + botName + ".json"
  );
  const db = low(adapter);
  const defaultConfig = {
    name: botName,
    job: "none", // guard, miner -- For a now...
    mode: "none", // none, pve, pvp
    distance: 10,
    helpFriends: false,
    pickUpItems: false,
    randomFarmArea: false,
    isCopingPatrol: false,
    canDig: false,
    canPlaceBlocks: false,
    allowSprinting: false,
    firstPickUpItemsFromKnownChests: true,
    canCraftItemWithdrawChest: true,
    itemsToBeReady: [
      {
        item: "sword",
        quantity: 1,
      },
    ],
    itemsCanBeEat: [
      "bread",
      "carrot",
      "potato",
      "sweet_berries",
      "baked_potato",
      "cooked_chicken",
      "cooked_porkchop",
      "cooked_mutton",
      "golden_carrot",
    ],
    chests: {},
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
      bee: 10,
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
    },
  };

  db.defaults({ config: defaultConfig }).write();
  return db;
}

function getAll(botName) {
  const db = getConn(botName);
  return db.get("config").value();
}

function saveFullConfig(botName, config) {
  const db = getConn(botName);
  const fullConfig = db.get("config").value();
  const newFullConfig = {
    ...fullConfig,
    ...config
  };
  db.set("config", newFullConfig).write();
}

function setJob(botName, job) {
  const db = getConn(botName);
  db.set("config.job", job).write();
}

function getJob(botName) {
  const db = getConn(botName);
  return db.get("config.job").value();
}

function setMode(botName, mode) {
  const db = getConn(botName);
  db.set("config.mode", mode).write();
}

function getMode(botName) {
  const db = getConn(botName);
  return db.get("config.mode").value();
}

function setHelpFriends(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }
  db.set("config.helpFriends", mode).write();
}

function getHelpFriends(botName) {
  const db = getConn(botName);
  return db.get("config.helpFriends").value();
}

function setCanDig(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }
  db.set("config.canDig", mode).write();
}

function getCanDig(botName) {
  const db = getConn(botName);
  return db.get("config.canDig").value();
}

function setCanPlaceBlocks(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }
  db.set("config.canPlaceBlocks", mode).write();
}

function getCanPlaceBlocks(botName) {
  const db = getConn(botName);
  return db.get("config.canPlaceBlocks").value();
}

function setFirstPickUpItemsFromKnownChests(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }
  db.set("config.firstPickUpItemsFromKnownChests", mode).write();
}

function getFirstPickUpItemsFromKnownChests(botName) {
  const db = getConn(botName);
  return db.get("config.firstPickUpItemsFromKnownChests").value();
}

function setCanCraftItemWithdrawChest(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }
  db.set("config.canCraftItemWithdrawChest", mode).write();
}

function getCanCraftItemWithdrawChest(botName) {
  const db = getConn(botName);
  return db.get("config.canCraftItemWithdrawChest").value();
}

function setAllowSprinting(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }
  db.set("config.allowSprinting", mode).write();
}

function getAllowSprinting(botName) {
  const db = getConn(botName);
  return db.get("config.allowSprinting").value();
}

function setPickUpItems(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }

  db.set("config.pickUpItems", mode).write();
}

function getPickUpItems(botName) {
  const db = getConn(botName);
  return db.get("config.pickUpItems").value();
}

function setRandomFarmArea(botName, mode) {
  const db = getConn(botName);
  if (mode === true) {
    mode = true;
  } else {
    mode = false;
  }

  db.set("config.randomFarmArea", mode).write();
}

function getRandomFarmArea(botName) {
  const db = getConn(botName);
  return db.get("config.randomFarmArea").value();
}

function setDistance(botName, distance) {
  const db = getConn(botName);
  db.set("config.distance", distance).write();
}

function getDistance(botName) {
  const db = getConn(botName);
  return db.get("config.distance").value();
}

function setPatrol(botName, patrol) {
  const db = getConn(botName);
  db.set("config.patrol", patrol).write();
}

function getPatrol(botName) {
  const db = getConn(botName);
  return db.get("config.patrol").value();
}

function getChests(botName) {
  const db = getConn(botName);
  return db.get("config.chests").value();
}

function setChests(botName, chests) {
  const db = getConn(botName);
  db.set("config.chests", chests).write();
}

function getAllChests(botName) {
  const db = getConn(botName);
  const chest = db.get("config.chests").value();
  if (chest === undefined) {
    return {};
  } else {
    return chest;
  }
}

function setMinerCords(botName, minerCords) {
  const db = getConn(botName);
  db.set("config.minerCords", minerCords).write();
}

function getMinerCords(botName) {
  const db = getConn(botName);
  return db.get("config.minerCords").value();
}

function setItemsToBeReady(botName, itemsToBeReady) {
  const db = getConn(botName);
  db.set("config.itemsToBeReady", itemsToBeReady).write();
}

function getItemsToBeReady(botName) {
  const db = getConn(botName);
  return db.get("config.itemsToBeReady").value();
}

function setItemsCanBeEat(botName, itemsToBeReady) {
  const db = getConn(botName);
  db.set("config.itemsCanBeEat", itemsToBeReady).write();
}

function getItemsCanBeEat(botName) {
  const db = getConn(botName);
  return db.get("config.itemsCanBeEat").value();
}

function setCopingPatrol(botName, status) {
  const db = getConn(botName);
  db.set("config.isCopingPatrol", status).write();
}

function getPlantAreas(botName) {
  const db = getConn(botName);
  return db.get("config.plantAreas").value();
}

function setPlantAreas(botName, plantAreas) {
  const plantAreasConverted = plantAreas.map((plant) => {
    const copyPlant = {
      plant: plant.plant,
      yLayer: parseInt(plant.yLayer),
      xStart: parseInt(plant.xStart),
      xEnd: parseInt(plant.xEnd),
      zStart: parseInt(plant.zStart),
      zEnd: parseInt(plant.zEnd),
    };
    return copyPlant;
  });
  const db = getConn(botName);
  db.set("config.plantAreas", plantAreasConverted).write();
}

function getFarmAreas(botName) {
  const db = getConn(botName);
  return db.get("config.farmAreas").value();
}

function setFarmAreas(botName, farmAreas) {
  const farmAreasConverted = farmAreas.map((plant) => {
    const copyFarm = {
      yLayer: parseInt(plant.yLayer),
      xStart: parseInt(plant.xStart),
      xEnd: parseInt(plant.xEnd),
      zStart: parseInt(plant.zStart),
      zEnd: parseInt(plant.zEnd),
    };
    return copyFarm;
  });
  const db = getConn(botName);
  db.set("config.farmAreas", farmAreasConverted).write();
}

function getFarmAnimal(botName) {
  const db = getConn(botName);
  return db.get("config.farmAnimal").value();
}

function setFarmAnimal(botName, farmAnimal) {
  const db = getConn(botName);
  db.set("config.farmAnimal", farmAnimal).write();
}

function getChestArea(botName) {
  const db = getConn(botName);
  return db.get("config.chestAreas").value();
}

function setChestArea(botName, farmAreas) {
  const area = farmAreas.map((plant) => {
    const copyArea = {
      yLayer: parseInt(plant.yLayer),
      xStart: parseInt(plant.xStart),
      xEnd: parseInt(plant.xEnd),
      zStart: parseInt(plant.zStart),
      zEnd: parseInt(plant.zEnd),
    };
    return copyArea;
  });
  const db = getConn(botName);
  db.set("config.chestAreas", area).write();
}

module.exports = {
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
  setChestArea,
};
