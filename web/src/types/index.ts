
import { Config } from "base-types"

export type Bot = {
    socketId: string
    name: string
    food: number
    health: number
    combat: false
    events: Array<string>
    config: Config
    isCopingPatrol: boolean
    viewerPort?: number
    inventoryPort?: number
    stateMachinePort?: number
}
