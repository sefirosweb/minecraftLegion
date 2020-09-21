class template {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'template';
    }

    onStateEntered() {
        this.targets.targetEntity = bot.nearestEntity(() => true)
    }

    onStateExited() {
        this.targets.targetEntity = bot.nearestEntity(() => true)
    }

    getPlayerEntity = function(playerName) {
        this.targets.entity = this.checkPlayer(playerName) || undefined
        this.playerIsFound = this.targets.entity !== undefined
    }

}
module.exports = template