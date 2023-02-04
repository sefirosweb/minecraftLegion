import { Bot, ChestBlock, ChestProperty, LegionStateMachineTargets } from "@/types"
import { Chest } from "mineflayer"
import { Block } from "prismarine-block"
import { Vec3 } from "vec3"
import { getSecondBlockPosition } from "./utils"
import botWebsocket from '@/modules/botWebsocket'
import { v4 as uuidv4 } from 'uuid';

const refreshChest = (chestToOpen: Block, container: Chest, bot: Bot, targets: LegionStateMachineTargets) => {
    const chest = Object.values(targets.chests).find(c => {
        const chestPosition = new Vec3(c.position.x, c.position.y, c.position.z)
        if (chestPosition.equals(chestToOpen.position)) return true

        if (!c.position_2) return false
        const chestSecondBlock = new Vec3(c.position_2.x, c.position_2.y, c.position_2.z)
        if (chestSecondBlock.equals(chestToOpen.position)) return true
        return false
    })

    const slots = container.slots.slice(0, container.inventoryStart)
    const props = chestToOpen.getProperties() as ChestProperty

    const offset = getSecondBlockPosition(props.facing, props.type)
    const position_2 = offset ? chestToOpen.position.offset(offset.x, offset.y, offset.z) : undefined

    if (!chest) {
        const chestOpened: ChestBlock = {
            dimension: bot.game.dimension,
            slots,
            position: chestToOpen.position,
            position_2,
            lastTimeOpen: Date.now()
        }

        const chestIndext = uuidv4()
        targets.chests[chestIndext] = chestOpened
    } else {

        chest.position = chestToOpen.position,
            chest.position_2 = position_2
        chest.slots = slots
        chest.lastTimeOpen = Date.now()
    }

    botWebsocket.sendAction('setChests', targets.chests)
}

export default refreshChest