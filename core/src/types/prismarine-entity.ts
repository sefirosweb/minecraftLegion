import "prismarine-entity";

declare module 'prismarine-entity' {
    interface Entity {
        isEnemy?: boolean
        breededDate?: number
        distance?: number
    }
}
