module.exports = function (bot, targets) {
    const mcData = require('minecraft-data')(bot.version)
    const getNearestPortal = (dimension) => {
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

        const matchingId = ["nether_portal"].map(name => mcData.blocksByName[name].id)

        const blocksFound = bot.findBlocks({
            matching: matchingId,
            maxDistance: 128,
            count: 16
        })

        if (blocksFound.length === 0) {
            return false;
        }

        blocksFound.map(
            (p) => {
                p.distance = bot.entity.position.distanceTo(p)
                return p
            }
        )
            .sort(
                (a, b) => {
                    return a.distance - b.distance
                }
            )

        const portal = blocksFound[0]
        return portal
    }


    return {
        getNearestPortal
    };
};
