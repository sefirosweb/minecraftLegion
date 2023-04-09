import'mineflayer'
import { Vec3 } from "vec3";
declare module 'mineflayer' {

    export type Dimension_V2 = 'overworld' | 'the_end' | 'the_nether'

    interface BotEvents {
        webSocketLogin: () => void
        customEventPhysicTick: () => void
        reloadBotConfig: () => void
        beatMob: () => void
        finishedJob: () => void

        customEventChat: (
            username: string,
            message: string,
            translate: string | null,
            jsonMsg: any,
            matches: Array<string> | null
        ) => Promise<void> | void

        customEventMove: (position: Vec3) => Promise<void> | void

        newListener: () => void
        removeListener: () => void
    }
}