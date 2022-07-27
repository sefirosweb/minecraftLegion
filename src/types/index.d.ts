import { Movements } from 'mineflayer-pathfinder'
import { StateMachineTargets } from 'mineflayer-statemachine'
import { Bot as MineflayerBot } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Jobs } from './defaultTypes'
import { Block } from 'prismarine-block'
import { Entity } from 'prismarine-entity'


export type PendingTransaction = {
    chest: any,
    items: any
}

export type Chests = {
    [key: string]: {};
};

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

type BreederJob = {
    farmAreas: Array<Layer>,
    breededAnimals: Array<Entity>,
    farmAnimal: {
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
    },
    animalsToBeFeed: Array<Entity>,
    feedEntity?: Entity
}

type SorterJob = {
    emptyChests: Array<any>
}

type CrafterJob = {}
type MinerJob = {
    blockForPlace: Array<any>
    original: any
    mineBlock: Vec3,
    nextLayer?: Layer
}

export type Item = {
    item: string
    quantity: number
}

export type itemsToCraft = {
    name: string
    quantity: number
}

export type Dimensions = 'minecraft:overworld' | 'minecraft:the_nether' | 'minecraft:the_end'

export type Chest = {
    items: Array<Item>
    type: 'withdraw' | 'deposit' | 'depositAll'
    position: Vec3
    dimension: Dimensions
};

export type Config = {
    job: Jobs
    sleepArea?: Vec3
    allowSprinting: boolean
    canDig: boolean
    canPlaceBlocks: boolean
    canSleep: boolean
    canCraftItemWithdrawChest: boolean
    minerCords: MineCordsConfig
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

type PositionWithVec3 = Vec3 & {
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
    position?: PositionWithVec3;
    pickUpItems?: any;
    items?: any;
    craftItemBatch?: any;
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
    name: string
}
export interface Bot extends MineflayerBot {
    isABed: (bedBlock: Block) => boolean
}

declare module 'prismarine-entity' {
    export interface Entity {
        isEnemy?: boolean
        breededDate?: number
    }
}
declare module 'mineflayer' {
    export interface BotEvents {
        webSocketLogin: () => Promise<void> | void
        customEventPhysicTick: () => Promise<void> | void

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
