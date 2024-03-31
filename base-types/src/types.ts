import { Movements } from 'mineflayer-pathfinder'
import { StateMachineTargets } from 'mineflayer-statemachine'
import { Bot, Dimension_V2 } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Jobs } from './defaultTypes'
import { Block } from 'prismarine-block'
import { Entity } from 'prismarine-entity'
import { Item as PrismarineItem } from 'prismarine-item';
import { FarmAnimal } from './animals'

export type DepositType = 'withdraw' | 'deposit' | 'depositAll'
export type Agro = 'none' | 'pve' | 'pvp'
export type tunnelType = 'horizontally' | 'vertically'

export type Layer = {
    uuid: string,
    xStart: number,
    xEnd: number,
    zStart: number,
    zEnd: number,
    yLayer: number,
}

export type MineCords = {
    xStart: number,
    xEnd: number
    yStart: number
    yEnd: number
    zStart: number
    zEnd: number
}

export type MineCordsConfig = MineCords & {
    tunnel: tunnelType
    orientation: Coordinates
    world: Dimension_V2
    reverse: boolean
}

export type PlantArea = {
    uuid: string,
    plant: string,
    layer: Layer,
}

export type GuardJob = {}
export type ArcherJob = {}
export type FarmerJob = {
    plantArea: PlantArea | undefined
}

export type BreederJob = {
    farmAreas: Config["farmAreas"],
    farmAnimal: Config["farmAnimal"],
    farmAnimalSeconds: Config["farmAnimalSeconds"]
    breededAnimals: Array<Entity>,
    animalsToBeFeed: Array<Entity>,
    feedEntity: Entity | undefined
}

export type CorrectChest = {
    correct: boolean
}

export type ChestTransaction = { // TODO quitar opcionales!
    name?: string,
    quantity: number,
    fromChest?: string,
    toChest?: string,
    fromSlot?: number,
    toSlot?: number,
    id: number
}

export type CorrectChests = Record<string, Array<CorrectChest>>
export type NewChestSort = Record<string, Array<Slot>>


export type SorterJob = {
    emptyChests: Array<ChestBlock>
    correctChests: CorrectChests
    newChestSort: NewChestSort
    newChests: Array<NewChestBlock>
    slotsToSort: Array<ChestTransaction>
    chest: NewChestBlock | undefined
}

export type CrafterJob = {}

export type MinerJob = {
    blockForPlace: Array<any>
    original: MineCords
    mineBlock: Vec3,
    nextLayer: Layer | undefined
}

export type Config = {
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
export type PortalType = 'nether_portal' | 'end_portal'
export type Portals = {
    overworld_to_the_nether: Array<Vec3>
    overworld_to_the_end: Array<Vec3>
    the_nether_to_overworld: Array<Vec3>,
    the_end_to_overworld: Array<Vec3>,
};

export type ItemDrop = {
    position: Vec3
    isValid: boolean
}

export type ItemsToPickUpBatch = {
    repicesUsed: Array<any>
    itemToPickup: Array<any>
    haveMaterials: 'all'
    needCraftingTable: boolean
}

export type Recipes = {
    result: {
        name: string
    }
}

export type Vec3WithDistance = Vec3 & {
    distance?: number
}

export type Vec3WithDimension = Vec3 & {
    dimension?: Dimension_V2
}

export type BotwebsocketAction = {
    type: string,
    value: any
}

export type Coordinates = 'x+' | 'x-' | 'z+' | 'z-'

export type Master = string

export type BlockChest = Block & {
    secondBlock?: BlockChest
}

export type fakeVec3 = {
    x: number
    y: number
    z: number
}

export type Queue = {
    position: Vec3,
    parent: number
}

export type CustomEntity = Entity & {
    distance: number
}

export type CustomItem = PrismarineItem & {
    speedTool: number
}

export type botSocket = {
    botName: string
    botPassword?: string
}
export type socketAuth = {
    auth: string
}

export type botType = {
    username: string
}


export type PositionsChecked = {
    position: Vec3,
    parent: number | null
}

export type Chest = {
    uuid: string
    items: Array<Item>
    name: string
    type: DepositType
    position: Vec3
    dimension: Dimension_V2
};

export type ItemArmor = 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'sword' | 'shield' | 'bow'

export type Item = {
    quantity: number
} & ({
    id?: number
    name: string
} | {
    id: number
    name?: string
})

export type Food = Item & {
    id: NonNullable<Item['id']>
    name: NonNullable<Item['name']>
    priority: number
}

export type Slot = {
    name: string
    type: number
    count: number
    stackSize: number
}

export type Recpie = {
    items: Array<ItemRecipe>
    result: ItemRecipe
    needCraftingTable: boolean
}

export type ItemRecipe = {
    id: number
    name?: string,
    quantity: number,
    subRecipes?: Array<Recpie>
}

export type NewChestBlock = {
    position: Vec3
    dimension: Dimension_V2
}

export type ChestBlock = {
    position: Vec3
    position_2?: Vec3
    slots: Array<Slot>
    dimension: Dimension_V2
    lastTimeOpen?: number
    chestFound?: boolean
}

export type Facing = 'south' | 'north' | 'east' | 'west'
export type ChestPosition = 'single' | 'left' | 'right'

export type ChestProperty = {
    facing: Facing
    type: ChestPosition
}

export type Chests = Record<string, ChestBlock>

export type PendingTransaction = {
    chest: ChestBlock,
    items: Array<ChestTransaction>
}

export type Test = {
    name: string,
    f: () => Promise<void>
}

export type BotFriends = {
    socketId: string,
    name: string,
    event: any
    health: string
    food: string
    combat: boolean
}

export interface EntityWithDistance extends Entity {
    distance: number
}


export interface LegionStateMachineTargets extends StateMachineTargets {
    movements: Movements;
    chests: Chests;
    portals: Portals;
    isNight: boolean;
    triedToSleep: boolean;

    itemDrop?: ItemDrop; // TODO FIX
    position?: Vec3WithDimension;
    pickUpItems?: any;
    items?: any;
    craftItemBatch?: Array<Item>;
    craftItem?: any
    digBlock?: Block;

    block?: Block;
    interactEntity?: Entity

    guardJob?: GuardJob;
    archerJob?: ArcherJob;
    farmerJob: FarmerJob;
    minerJob: MinerJob;
    breederJob: BreederJob;
    sorterJob: SorterJob;
    crafterJob?: CrafterJob;
}


export interface TestBot extends Bot {
    test: {
        groundY: number,
        sayEverywhere: (msg: string) => void
        clearInventory: () => void
        becomeSurvival: () => void
        becomeCreative: () => void
        fly: (delta: Vec3) => Promise<void>
        resetState: () => Promise<void>
        placeBlock: (slot: number, position: Vec3) => void

        wait: (ms: number) => Promise<void>
    }
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
        tunnel: 'horizontally',
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

export type BotsConnected = {
    socketId: string,
    name: string,
    health: number,
    food: number,
    combat: boolean,
    stateMachinePort?: number,
    inventoryPort?: number,
    viewerPort?: number,
    events: [],
    config: Config,
    address: string
}