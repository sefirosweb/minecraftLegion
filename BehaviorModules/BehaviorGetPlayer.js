module.exports = class BehaviorGetPlayer {
    constructor(bot, targets) {
        this.bot = bot
        this.targets = targets
        this.stateName = 'BehaviorGetPlayer'
        this.playerIsFound = false
        this.playername
    }

    onStateEntered() {
        this.getPlayerEntity(this.playerName)
    }

    getPlayerEntity = function (playerName) {
        this.targets.entity = this.checkPlayer(playerName) || undefined
        this.playerIsFound = this.targets.entity !== undefined
        if (this.playerIsFound) {
            this.playerName = playerName
        }
        return this.playerIsFound
    }

    checkPlayer = function (playerName) {
        for (let entityName of Object.keys(this.bot.entities)) {
            let entity = this.bot.entities[entityName]
            if (entity === this.bot.entity)
                continue
            if (entity.type !== 'player')
                continue
            if (entity.username == playerName)
                return entity
        }
        return null
    }

    playerFound = function () {
        return this.playerIsFound
    }

    getPlayerName = function () {
        return this.playerName
    }

}