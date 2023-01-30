import { Movements } from 'mineflayer-pathfinder'
import { StateMachineTargets } from 'mineflayer-statemachine'
import { Bot as MineflayerBot, Dimension, Dispenser, Furnace } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Jobs } from './defaultTypes'
import { Block } from 'prismarine-block'
import { Entity } from 'prismarine-entity'
import { Item as PrismarineItem } from 'prismarine-item';
import { animals, FarmAnimal } from '@/modules/animalType'

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
    world: Dimension
    reverse: boolean
}

type PlantArea = {
    layer: Layer,
    plant: string
}

type GuardJob = {}
type ArcherJob = {}
type FarmerJob = {
    plantArea: PlantArea | undefined
}

type BreederJob = {
    farmAreas: Config["farmAreas"],
    farmAnimal: Config["farmAnimal"],
    farmAnimalSeconds: Config["farmAnimalSeconds"]
    breededAnimals: Array<Entity>,
    animalsToBeFeed: Array<Entity>,
    feedEntity: Entity | undefined
}

type CorrectChest = {
    correct: boolean
}

type ChestTransaction = { // TODO quitar opcionales!
    name?: string,
    quantity: number,
    fromChest?: number,
    toChest?: number,
    fromSlot?: number,
    toSlot?: number,
    id: number
}

type NewChestBlock = {
    position: Vec3
    dimension: Dimension
}

type SorterJob = {
    emptyChests: Array<ChestBlock>
    correctChests: Array<Array<CorrectChest>>
    newChestSort: Array<Array<Slot>>
    newChests: Array<NewChestBlock>
    slotsToSort: Array<ChestTransaction>
    chest: Block | undefined
}

type CrafterJob = {}
type MinerJob = {
    blockForPlace: Array<any>
    original: MineCords
    mineBlock: Vec3,
    nextLayer: Layer | undefined
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
    farmAnimalSeconds: number
    farmAreas: Array<Layer>
    chestAreas: Array<Layer>
}

type Portals = {
    overworld_to_the_nether: Array<Vec3>
    overworld_to_the_end: Array<Vec3>
    the_nether_to_overworld: Array<Vec3>,
    the_end_to_overworld: Array<Vec3>,
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
    dimension?: Dimension
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
    dimension: Dimension
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
    stackSize: number
}

type Recpie = {
    items: Array<ItemRecipe>
    result: ItemRecipe
    needCraftingTable: boolean
}

type ItemRecipe = {
    id: number
    name?: string,
    quantity: number,
    subRecipes?: Array<Recpie>
}

type ChestBlock = {
    position: Vec3
    position_2?: Vec3
    slots: Array<Slot>
    dimension: Dimension
    lastTimeOpen?: number
    chestFound?: boolean
}

type Facing = 'south' | 'north' | 'east' | 'west'
type ChestPosition = 'single' | 'left' | 'right'

type ChestProperty = {
    facing: Facing
    type: ChestPosition
}

type Chests = Record<string, ChestBlock>

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

type BotFriends = {
    socketId: string,
    name: string,
    event: any
    health: string
    food: string
    combat: boolean
}
