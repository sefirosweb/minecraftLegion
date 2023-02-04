import { Dimension } from "mineflayer"
import { Vec3 } from "vec3"
import { FarmAnimal, Jobs } from './types'

type BotsConnected = {
    socketId: string,
    name: string,
    health: number,
    food: number,
    combat: boolean,
    stateMachinePort?: number,
    inventoryPort?: number,
    viewerPort?: number,
    events: [],
    config: Config
}

//** EXTERNAL **/
type Config = {
    job: Jobs
    sleepArea?: Vec3
    allowSprinting: boolean
    canDig: boolean
    canPlaceBlocks: boolean
    canSleep: boolean
    canCraftItemWithdrawChest: boolean
    pickUpItems: boolean
    minerCords: MineCordsConfig
    mode: Agro
    distance: number
    itemsToBeReady: Array<Item>
    itemsCanBeEat: Array<string>
    helpFriends: boolean
    randomFarmArea: boolean,
    firstPickUpItemsFromKnownChests: boolean,
    patrol: Array<Vec3>
    chests: Array<Chest>
    plantAreas: Array<PlantArea>
    farmAnimal: FarmAnimal
    farmAnimalSeconds: number
    farmAreas: Array<Layer>
    chestAreas: Array<Layer>
}

type DepositType = 'withdraw' | 'deposit' | 'depositAll'

type Chest = {
    items: Array<Item>
    name: string
    type: DepositType
    position: Vec3
    dimension: Dimension
};

type Agro = 'none' | 'pve' | 'pvp'

type Layer = {
    xStart: number,
    xEnd: number,
    zStart: number,
    zEnd: number,
    yLayer: number,
}

type PlantArea = {
    layer: Layer,
    plant: string
}

type Item = {
    quantity: number
} & ({
    id?: number
    name: string
} | {
    id: number
    name?: string
})

type MineCords = {
    xStart: number,
    xEnd: number
    yStart: number
    yEnd: number
    zStart: number
    zEnd: number
}

type MineCordsConfig = MineCords & {
    tunel: 'horizontally' | 'vertically'
    orientation: Coordinates
    world: Dimension
    reverse: boolean
}

type Coordinates = 'x+' | 'x-' | 'z+' | 'z-'
