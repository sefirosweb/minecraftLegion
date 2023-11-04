import 'mineflayer'
import { Vec3 } from "vec3";
import mcDataLoader from 'minecraft-data'
import { Config } from 'base-types';

declare module 'mineflayer' {

    export type Dimension_V2 = 'overworld' | 'the_end' | 'the_nether'

    interface Bot {
        mcData: mcDataLoader.IndexedData
        config: Config
    }

    interface BotEvents {
        customEventPhysicTick: () => void
        checkPortalsOnSpawn: (portals: Array<Vec3>) => void
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

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
};