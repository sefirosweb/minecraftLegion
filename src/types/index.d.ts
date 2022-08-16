import { Movements } from 'mineflayer-pathfinder'
import { StateMachineTargets } from 'mineflayer-statemachine'
import { Bot as MineflayerBot, Chest, Dispenser, Furnace } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Jobs } from './defaultTypes'
import { Block } from 'prismarine-block'
import { Entity } from 'prismarine-entity'
import { Item as PrismarineItem } from 'prismarine-item';

export type Layer = {
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
    tunel: 'horizontally' | 'vertically'
    orientation: 'z+' | 'z-' | 'x+' | 'x-'
    world: Dimensions
    reverse: boolean
}

export type PlantArea = {
    xStart?: number,
    xEnd?: number,
    zStart?: number,
    zEnd?: number,
    yLayer?: number,
    plant?: string
}

type GuardJob = {}
type ArcherJob = {}
type FarmerJob = {
    plantArea: PlantArea
}

type FarmAnimal = {
    seconds: number,
    cow: 10,
    sheep: 10,
    chicken: 10,
    horse: 10,
    donkey: 10,
    llama: 10,
    bee: 10,
    panda: 10,
    wolf: 10,
    cat: 10,
    rabbit: 10,
    pig: 10,
    turtles: 10,
}

type BreederJob = {
    farmAreas: Array<Layer>,
    breededAnimals: Array<Entity>,
    farmAnimal: FarmAnimal,
    animalsToBeFeed: Array<Entity>,
    feedEntity?: Entity
}

type SorterJob = {
    emptyChests: Array<any>
}

type CrafterJob = {}
type MinerJob = {
    blockForPlace: Array<any>
    original: MineCords
    mineBlock: Vec3,
    nextLayer?: Layer
}



export type DepositType = 'withdraw' | 'deposit' | 'depositAll'

export type Agro = 'none' | 'pve' | 'pvp'

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
}

export type Portals = {
    overworld: {
        the_nether: Array<Vec3>,
        the_end: Array<Vec3>
    },
    the_nether: Array<Vec3>,
    the_end: Array<Vec3>
};

export type ItemDrop = {
    position: Vec3
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
    dimension?: Dimensions
}
export interface LegionStateMachineTargets extends StateMachineTargets {
    movements: Movements;
    chests: Chests;
    portals: Portals;
    isNight: boolean;
    triedToSleep: boolean;

    config: Config;

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

export type BotwebsocketAction = {
    type: string,
    value: any
}

export type Coordinates = 'x+' | 'x-' | 'z+' | 'z-'

export type Master = {
    name: string,
    position?: Vec3
}
export interface Bot extends MineflayerBot {
    isABed: (bedBlock: Block) => boolean
}

export interface EntityWithDistance extends Entity {
    distance: number
}

declare module 'prismarine-entity' {
    export interface Entity {
        isEnemy?: boolean
        breededDate?: number
        distance?: number
    }
}
declare module 'mineflayer' {
    export interface BotEvents {
        webSocketLogin: () => Promise<void> | void
        customEventPhysicTick: Function | void
        reloadBotConfig: () => void
        beatMob: () => void

        customEventChat: (
            username: string,
            message: string,
            translate: string | null,
            jsonMsg: ChatMessage,
            matches: string[] | null
        ) => Promise<void> | void

        customEventMove: (position: Vec3) => Promise<void> | void

        newListener: (event: string | symbol, listener: Function) => Promise<void> | void
        removeListener: (event: string | symbol, listener: Function) => Promise<void> | void
    }
}

export type OptionsFind = {
    matching?: Array<string>
    point?: Vec3
    maxDistance?: number
    count?: number
    useExtraInfo?: any
}

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

// Final types state

export type PositionsChecked = {
    position: Vec3,
    parent: number | null
}

export type Chest = {
    items: Array<Item>
    name: string
    type: DepositType
    position: Vec3
    dimension: Dimensions
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

export type Slot = {
    name: string
    type: number
    count: number
}

export type Recpie = {
    items: Array<ItemRecipe>
    result: ItemRecipe
    needCraftingTable: boolean
}

export type ChestTransaction = {
    fromChest: number,
    fromSlot: number,
    toChest?: number,
    toSlot?: number,
    id: number
    name?: string,
    quantity: number,
}

export type ItemRecipe = {
    id: number
    name?: string,
    quantity: number,
    subRecipes?: Array<Recpie>
}

export type ChestBlock = Block & {
    dimension?: Dimensions
    secondBlock?: Vec3
    lastTimeOpen?: number
    slots: Array<Slot>
}

export type Dimensions = 'minecraft:overworld' | 'minecraft:the_nether' | 'minecraft:the_end'
export type Facing = 'south' | 'north' | 'east' | 'west'
export type ChestPosition = 'single' | 'left' | 'right'

export type ChestProperty = {
    facing: Facing
    type: ChestPosition
}

export type Chests = {
    [key: string]: ChestBlock
};

export type PendingTransaction = {
    chest: ChestBlock,
    items: Array<ChestTransaction>
}