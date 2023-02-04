import { Config } from "."

export type FarmAnimal = Record<keyof typeof AnimalList, number>

export enum AnimalList {
    sheep = "sheep",
    cow = "cow",
    wolf = "wolf",
    chicken = "chicken",
    cat = "cat",
    horse = "horse",
    donkey = "donkey",
    llama = "llama",
    pig = "pig",
    rabbit = "rabbit",
    turtle = "turtle",
    panda = "panda",
    fox = "fox",
    bee = "bee",
}

export enum Jobs {
    none = 'none',
    guard = 'guard',
    archer = 'archer',
    farmer = 'farmer',
    breeder = 'breeder',
    sorter = 'sorter',
    miner = 'miner',
    crafter = 'crafter'
}

export const defaultConfig: Config = {
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
      world: 'minecraft:overworld',
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