class BehaviorGetPlayer {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorGetPlayer';
        this.playerIsFound = false;
    }

    /*
    onStateExited() {
        this.targets.targetEntity = bot.nearestEntity(() => true)
    }
    */

    getPlayerEntity = function(playerName) {
        this.targets.entity = this.checkPlayer(playerName) || undefined
        this.playerIsFound = this.targets.entity !== undefined
    }

    checkPlayer = function(playerName) {
        for (let entityName of Object.keys(this.bot.entities)) {
            let entity = this.bot.entities[entityName];
            if (entity === this.bot.entity)
                continue;
            if (entity.type !== 'player')
                continue;
            if (entity.username == playerName)
                return entity;
        }
        return null;
    }

    playerFound = function() {
        return this.playerIsFound;
    }

}
module.exports = BehaviorGetPlayer