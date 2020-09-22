class BehaviorAttack {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorAttack';
        this.playerIsFound = false;
        this.lastAttack = Date.now();
    }

    onStateEntered = function() {
        this.bot.lookAt(this.targets.entity.position);
        this.bot.attack(this.targets.entity, true)
    };

    nextAttack = function() {
        const currentDate = Date.now();
        if (currentDate - this.lastAttack > 500) {
            this.lastAttack = currentDate
            return true;
        }
        return false;
    };
    /*
    onStateExited() {
        this.targets.targetEntity = bot.nearestEntity(() => true)
    }
    */
}
module.exports = BehaviorAttack