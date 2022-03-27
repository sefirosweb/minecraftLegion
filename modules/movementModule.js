const botWebsocket = require('@modules/botWebsocket')
const mineflayerPathfinder = require('mineflayer-pathfinder')


module.exports = function (bot, targets) {
    const mcData = require('minecraft-data')(bot.version)
    const getNearestPortal = (dimension) => {

        const portalsFound = findPortals(dimension)

        const portals = compareWithCurrentPortals(portalsFound, dimension)

        // blocksFound.map(
        //     (p) => {
        //         p.distance = bot.entity.position.distanceTo(p)
        //         return p
        //     }
        // )
        //     .sort(
        //         (a, b) => {
        //             return a.distance - b.distance
        //         }
        //     )

        const portal = portals[0]
        return portal
    }

    const checkPortalsOnSpawn = () => {

        let portals, dimension

        if (bot.game.dimension === 'minecraft:the_nether') {
            dimension = "minecraft:overworld"
            portals = findPortals(dimension)
            compareWithCurrentPortals(portals, dimension)
        }

        if (bot.game.dimension === 'minecraft:the_end') {
            dimension = "minecraft:overworld"
            portals = findPortals(dimension)
            compareWithCurrentPortals(portals, dimension)
        }

        if (bot.game.dimension === 'minecraft:overworld') {
            dimension = "minecraft:the_nether"
            portals = findPortals(dimension)
            compareWithCurrentPortals(portals, dimension)

            dimension = "minecraft:the_end"
            portals = findPortals(dimension)
            compareWithCurrentPortals(portals, dimension)
        }
    }

    const compareWithCurrentPortals = (portals, dimension) => {
        let currentPortals
        if (bot.game.dimension === 'minecraft:the_nether' && dimension === 'minecraft:overworld') {
            currentPortals = targets.portals.the_nether
        }

        if (bot.game.dimension === 'minecraft:the_end' && dimension === 'minecraft:overworld') {
            currentPortals = targets.portals.the_end
        }

        if (bot.game.dimension === 'minecraft:overworld' && dimension === 'minecraft:the_nether') {
            currentPortals = targets.portals.overworld.the_nether
        }

        if (bot.game.dimension === 'minecraft:overworld' && dimension === 'minecraft:the_end') {
            currentPortals = targets.portals.overworld.the_end
        }


        portals.forEach(portal => {
            const portalFound = currentPortals.find(cp => cp.x === portal.x && cp.y === portal.y && cp.z === portal.z)

            if (!portalFound) {
                currentPortals.push(portal)
            }
        })

        botWebsocket.sendAction('setPortals', targets.portals)
        return currentPortals
    }

    const findPortals = (dimension) => {
        let matching
        if ( //Nether portal
            dimension === 'minecraft:the_nether' && bot.game.dimension === 'minecraft:overworld'
            || dimension === 'minecraft:overworld' && bot.game.dimension === 'minecraft:the_nether'
            || dimension === 'minecraft:the_end' && bot.game.dimension === 'minecraft:the_nether'
        ) {

            matching = "nether_portal"
        }

        if ( // End Portal
            dimension === 'minecraft:the_end' && bot.game.dimension === 'minecraft:overworld'
            || dimension === 'minecraft:overworld' && bot.game.dimension === 'minecraft:the_end'
            || dimension === 'minecraft:the_nether' && bot.game.dimension === 'minecraft:the_end'
        ) {
            matching = "end_portal"
        }

        const matchingId = [matching].map(name => mcData.blocksByName[name].id)

        const blocksFound = bot.findBlocks({
            matching: matchingId,
            maxDistance: 128,
            count: 99
        })

        return blocksFound;
    }

    const crossThePortal = (dimension) => {
        return new Promise((resolve, reject) => {
            const portal = getNearestPortal(dimension)

            if (!portal) {
                reject(`Can't find the portal to dimension ${dimension}`)
                return
            }

            goPosition(portal)
                .then(() => {
                    return new Promise((resolve) => {
                        bot.once('spawn', () => {
                            setTimeout(() => {
                                resolve();
                            }, 2000)
                        })
                    });
                })
                .then(resolve)
        })

    }

    const goPosition = (position) => {
        const goal = new mineflayerPathfinder.goals.GoalBlock(position.x, position.y, position.z)
        bot.pathfinder.setMovements(targets.movements);
        bot.pathfinder.setGoal(goal);

        return new Promise((resolve) => {
            bot.once("goal_reached", () => {
                resolve()
            });
        });
    }

    const goSeeBlock = (block) => {

    }

    return {
        getNearestPortal,
        checkPortalsOnSpawn,
        crossThePortal,
        goSeeBlock
    };
};
