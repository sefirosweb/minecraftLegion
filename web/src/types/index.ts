// @ts-nocheck

import { Vec3 } from "vec3"

export type Coords = {
    x: number
    y: number
    z: number
}

export type Layer = {
    xStart: number
    xEnd: number
    zStart: number
    zEnd: number
    yLayer: number
}

export type Chests = Record<string, ChestBlock>

export type ChestBlock = {
    position: Vec3
    position_2?: Vec3
    slots: Array<Slot>
    dimension: Dimension_v2
    lastTimeOpen?: number
    chestFound?: boolean
}

export type Bot = {
    socketId: string
    name: string,
    food: number,
    health: number,
    combat: false,
    events: Array<string>
    config: any
    viewerPort?: number
    inventoryPort?: number
    stateMachinePort?: number
}
