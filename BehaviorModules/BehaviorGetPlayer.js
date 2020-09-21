const BehaviorGetPlayer = (function() {
    function BehaviorGetPlayer(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorGetPlayer';
    }
    BehaviorGetPlayer.prototype.onStateEntered = function(playerName) {
        /*this.targets = {
            entity: this.checkPlayer(this.playerName) || undefined
        }*/
    }
    BehaviorGetPlayer.prototype.getPlayerEntity = function(playerName) {
        this.targets = {
            entity: this.checkPlayer(playerName) || undefined
        }
    }
    BehaviorGetPlayer.prototype.checkPlayer = function(playerName) {
        for (let entityName of Object.keys(this.bot.entities)) {
            let entity = this.bot.entities[entityName];
            if (entity === this.bot.entity)
                continue;
            if (entity.type !== 'player')
                continue;
            if (entity.username == playerName)
                return entity

        }
        return null;
    }


    return BehaviorGetPlayer;
}());

module.exports = BehaviorGetPlayer