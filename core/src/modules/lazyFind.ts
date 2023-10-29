// this file is a patch until PR:
// https://github.com/PrismarineJS/mineflayer/pull/3218

import { Bot } from "mineflayer"
import { Vec3 } from "vec3"
import { iterators } from "prismarine-world"

export const lazyFind = (bot: Bot) => {
    const paintingsByPos: any = {}

    const Block = require('prismarine-block')(bot.registry)
    const Chunk = require('prismarine-chunk')(bot.registry)
    const World = require('prismarine-world')(bot.registry)

    function getMatchingFunction(matching: any) {
        if (typeof (matching) !== 'function') {
            if (!Array.isArray(matching)) {
                matching = [matching]
            }
            return isMatchingType
        }
        return matching

        function isMatchingType(block: any) {
            return block === null ? false : matching.indexOf(block.type) >= 0
        }
    }

    function getFullMatchingFunction(matcher: any, useExtraInfo: any) {
        if (typeof (useExtraInfo) === 'boolean') {
            return fullSearchMatcher
        }

        return nonFullSearchMatcher

        function nonFullSearchMatcher(point: any) {
            const block = blockAt(point, true)
            return matcher(block) && useExtraInfo(block)
        }

        function fullSearchMatcher(point: any) {
            return matcher(bot.blockAt(point, useExtraInfo))
        }
    }

    function blockAt(absolutePoint: any, extraInfos = true) {
        const block = bot.world.getBlock(absolutePoint)
        // null block means chunk not loaded
        if (!block) return null

        if (extraInfos) {
            //@ts-ignore
            block.painting = paintingsByPos[block.position]
        }

        return block
    }

    function isBlockInSection(section: any, matcher: any) {
        if (!section) return false // section is empty, skip it (yay!)
        // If the chunk use a palette we can speed up the search by first
        // checking the palette which usually contains less than 20 ids
        // vs checking the 4096 block of the section. If we don't have a
        // match in the palette, we can skip this section.
        if (section.palette) {
            for (const stateId of section.palette) {
                if (matcher(Block.fromStateId(stateId, 0))) {
                    return true // the block is in the palette
                }
            }
            return false // skip
        }
        return true // global palette, the block might be in there
    }

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const findBlocks = async (options: any) => {

        var microtime = performance.now()

        const matcher = getMatchingFunction(options.matching)
        const point = (options.point || bot.entity.position).floored()
        const maxDistance = options.maxDistance || 16
        const count = options.count || 1
        const useExtraInfo = options.useExtraInfo || false
        const fullMatcher = getFullMatchingFunction(matcher, useExtraInfo)
        const start = new Vec3(Math.floor(point.x / 16), Math.floor(point.y / 16), Math.floor(point.z / 16))
        const it = new iterators.OctahedronIterator(start, Math.ceil((maxDistance + 8) / 16))
        // the octahedron iterator can sometime go through the same section again
        // we use a set to keep track of visited sections
        const visitedSections = new Set()

        let blocks = []
        let startedLayer = 0
        let next = start
        while (next) {
            const column = bot.world.getColumn(next.x, next.z)
            //@ts-ignore
            const sectionY = next.y + Math.abs(bot.game.minY >> 4)
            //@ts-ignore
            const totalSections = bot.game.height >> 4
            if (sectionY >= 0 && sectionY < totalSections && column && !visitedSections.has(next.toString())) {
                //@ts-ignore
                const section = column.sections[sectionY]
                if (useExtraInfo === true || isBlockInSection(section, matcher)) {
                    //@ts-ignore
                    const begin = new Vec3(next.x * 16, sectionY * 16 + bot.game.minY, next.z * 16)
                    const cursor = begin.clone()
                    const end = cursor.offset(16, 16, 16)
                    for (cursor.x = begin.x; cursor.x < end.x; cursor.x++) {
                        for (cursor.y = begin.y; cursor.y < end.y; cursor.y++) {
                            for (cursor.z = begin.z; cursor.z < end.z; cursor.z++) {
                                if (fullMatcher(cursor) && cursor.distanceTo(point) <= maxDistance) blocks.push(cursor.clone())
                            }
                        }
                    }
                }
                visitedSections.add(next.toString())
            }
            // If we started a layer, we have to finish it otherwise we might miss closer blocks
            //@ts-ignore
            if (startedLayer !== it.apothem && blocks.length >= count) {
                break
            }
            //@ts-ignore
            startedLayer = it.apothem
            //@ts-ignore
            next = it.next()
            await wait(0)
        }
        blocks.sort((a, b) => {
            return a.distanceTo(point) - b.distanceTo(point)
        })
        // We found more blocks than needed, shorten the array to not confuse people
        if (blocks.length > count) {
            blocks = blocks.slice(0, count)
        }

        console.log(`Found ${blocks.length} blocks in ${performance.now() - microtime}ms`)
        return blocks
    }

    return {
        findBlocks
    }
}
