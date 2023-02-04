type Coords = {
    x: number
    y: number
    z: number
}

type Layer = {
    xStart: number
    xEnd: number
    zStart: number
    zEnd: number
    yLayer: number
}

type Chests = Record<string, ChestBlock>

type ChestBlock = {
    position: Vec3
    position_2?: Vec3
    slots: Array<Slot>
    dimension: Dimension
    lastTimeOpen?: number
    chestFound?: boolean
}

type Bot = {
    socketId: string
    name: string,
    food: number,
    health: number,
    combat: false,
    events: Array<string>
    config: any
}
