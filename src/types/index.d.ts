import { Movements } from 'mineflayer-pathfinder'
import { StateMachineTargets } from 'mineflayer-statemachine'
import { Bot as MineflayerBot, Dispenser, Furnace } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Jobs } from './defaultTypes'
import { Block } from 'prismarine-block'
import { Entity } from 'prismarine-entity'
import { Item as PrismarineItem } from 'prismarine-item';

type Layer = {
    xStart: number,
    xEnd: number,
    zStart: number,
    zEnd: number,
    yLayer: number,
}

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
    world: Dimensions
    reverse: boolean
}

type PlantArea = {
    layer: Layer,
    plant: string
}

type GuardJob = {}
type ArcherJob = {}
type FarmerJob = {
    plantArea: PlantArea
}

type FarmAnimal = {
    seconds: number,
    cow: number,
    sheep: number,
    chicken: number,
    horse: number,
    donkey: number,
    llama: number,
    bee: number,
    fox: number,
    panda: number,
    wolf: number,
    cat: number,
    rabbit: number,
    pig: number,
    turtles: number,
}

type BreederJob = {
    farmAreas: Array<Layer>,
    breededAnimals: Array<Entity>,
    farmAnimal: FarmAnimal,
    animalsToBeFeed: Array<Entity>,
    feedEntity: Entity
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

type DepositType = 'withdraw' | 'deposit' | 'depositAll'

type Agro = 'none' | 'pve' | 'pvp'

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
    farmAreas: Array<Layer>
}

type Portals = {
    overworld: {
        the_nether: Array<Vec3>,
        the_end: Array<Vec3>
    },
    the_nether: Array<Vec3>,
    the_end: Array<Vec3>
};

type ItemDrop = {
    position: Vec3
    isValid: boolean
}

type ItemsToPickUpBatch = {
    repicesUsed: Array<any>
    itemToPickup: Array<any>
    haveMaterials: 'all'
    needCraftingTable: boolean
}

type Recipes = {
    result: {
        name: string
    }
}

type Vec3WithDistance = Vec3 & {
    distance?: number
}

type Vec3WithDimension = Vec3 & {
    dimension?: Dimensions
}
interface LegionStateMachineTargets extends StateMachineTargets {
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

type BotwebsocketAction = {
    type: string,
    value: any
}

type Coordinates = 'x+' | 'x-' | 'z+' | 'z-'

type Master = {
    name: string,
    position?: Vec3
}
interface Bot extends MineflayerBot {
    isABed: (bedBlock: Block) => boolean
    test: {
        sayEverywhere: () => void
        clearInventory: () => void
        becomeSurvival: () => void
        becomeCreative: () => void
        fly: () => void
        resetState: () => Promise<void>
        setInventorySlot: () => void
        placeBlock: () => void
        runExample: () => void
        tellAndListen: () => void
        wait: (ms: number) => Promise<void>
    }
}

interface EntityWithDistance extends Entity {
    distance: number
}

declare module 'prismarine-entity' {
    interface Entity {
        isEnemy?: boolean
        breededDate?: number
        distance?: number
    }
}
declare module 'mineflayer' {
    interface BotEvents {
        webSocketLogin: () => Promise<void> | void
        customEventPhysicTick: Function | void
        reloadBotConfig: () => void
        beatMob: () => void
        finishedJob: () => void

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

type BlockChest = Block & {
    secondBlock?: BlockChest
}

type fakeVec3 = {
    x: number
    y: number
    z: number
}

type Queue = {
    position: Vec3,
    parent: number
}


type CustomEntity = Entity & {
    distance: number
}

type CustomItem = PrismarineItem & {
    speedTool: number
}

type botSocket = {
    botName: string
    botPassword?: string
}
type socketAuth = {
    auth: string
}

type botType = {
    username: string
}

// Final types state

type PositionsChecked = {
    position: Vec3,
    parent: number | null
}

type Chest = {
    items: Array<Item>
    name: string
    type: DepositType
    position: Vec3
    dimension: Dimensions
};

type ItemArmor = 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'sword' | 'shield' | 'bow'

type Item = {
    quantity: number
} & ({
    id?: number
    name: string
} | {
    id: number
    name?: string
})

type Food = Item & {
    id: NonNullable<Item['id']>
    name: NonNullable<Item['name']>
    priority: number
}

type Slot = {
    name: string
    type: number
    count: number
}

type Recpie = {
    items: Array<ItemRecipe>
    result: ItemRecipe
    needCraftingTable: boolean
}

type ChestTransaction = {
    fromChest: number,
    fromSlot: number,
    toChest?: number,
    toSlot?: number,
    id: number
    name?: string,
    quantity: number,
}

type ItemRecipe = {
    id: number
    name?: string,
    quantity: number,
    subRecipes?: Array<Recpie>
}

type ChestBlock = Block & {
    dimension?: Dimensions
    secondBlock?: Vec3
    lastTimeOpen?: number
    slots: Array<Slot>
}

type Dimensions = 'minecraft:overworld' | 'minecraft:the_nether' | 'minecraft:the_end'
type Facing = 'south' | 'north' | 'east' | 'west'
type ChestPosition = 'single' | 'left' | 'right'

type ChestProperty = {
    facing: Facing
    type: ChestPosition
}

type Chests = {
    [key: string]: ChestBlock
};

type PendingTransaction = {
    chest: ChestBlock,
    items: Array<ChestTransaction>
}

type ShotDirection = {
    yaw: number,
    pitch: number
}

type Test = {
    name: string,
    f: () => Promise<void>
}