import { Movements } from 'mineflayer-pathfinder'
import { StateMachineTargets } from 'mineflayer-statemachine'
import { Vec3 } from 'vec3'
import { Jobs } from './defaultTypes'

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
    sleepArea: Vec3
}

export type Portals = {
    overworld: {
        the_nether: Array<Vec3>,
        the_end: Array<Vec3>
    },
    the_nether: Array<Vec3>,
    the_end: Array<Vec3>
};

export interface LegionStateMachineTargets extends StateMachineTargets {
    movements: Movements;
    chests: Chests;
    portals: Portals;
    isNight: boolean;
    triedToSleep: boolean;

    config?: Config;

    guardJob?: GuardJob;
    archerJob?: ArcherJob;
    farmerJob?: FarmerJob;
    minerJob?: MinerJob;
    breederJob?: BreederJob;
    sorterJob?: SorterJob;
    crafterJob?: CrafterJob;
}