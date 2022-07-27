import { Movements } from 'mineflayer-pathfinder'
import { StateMachineTargets } from 'mineflayer-statemachine'
import { Bot as MineflayerBot } from 'mineflayer'
import { Vec3 } from 'vec3'
import { Jobs } from './defaultTypes'
import { Block } from 'prismarine-block'

type GuardJob = {}
type ArcherJob = {}
type FarmerJob = {}
type BreederJob = {}
type BreederJob = {}
type SorterJob = {}
type CrafterJob = {}
type MinerJob = {
    blockForPlace: Array<any>
}
export type Chests = {
    [key: string]: {};
};

export type Config = {
    job: Jobs
    sleepArea?: Vec3
    allowSprinting: boolean
    canDig: boolean
    canPlaceBlocks: boolean
    canSleep: boolean
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

export interface LegionStateMachineTargets extends StateMachineTargets {
    movements: Movements;
    chests: Chests;
    portals: Portals;
    isNight: boolean;
    triedToSleep: boolean;

    config: Config;

    itemDrop?: ItemDrop; // TODO FIX

    guardJob?: GuardJob;
    archerJob?: ArcherJob;
    farmerJob?: FarmerJob;
    minerJob?: MinerJob;
    breederJob?: BreederJob;
    sorterJob?: SorterJob;
    crafterJob?: CrafterJob;
}

export type BotwebsocketAction = {
    type: string,
    value: any
}

export interface Bot extends MineflayerBot {
    isABed: (bedBlock: Block) => boolean
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

declare module 'prismarine-entity' {
    export interface Entity {
        isEnemy?: boolean
    }
}

export type Coordinates = 'x+' | 'x-' | 'z+' | 'z-'
export type Master = {
    name: string
}
