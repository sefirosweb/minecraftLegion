const hawkEye = require("minecrafthawkeye");

class BehaviorLongAttack {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorLongAttack';
        this.playerIsFound = false;
        this.lastAttack = Date.now();
    }

    onStateEntered = function() {
        this.bot.lookAt(this.targets.entity.position.offset(0, 1, 0));
        this.bot.attack(this.targets.entity, true)
    };

    nextAttack = function() {
        const currentDate = Date.now();
        if (currentDate - this.lastAttack > 1200) {
            this.lastAttack = currentDate
            return true;
        }
        return false;
    };
}
module.exports = BehaviorLongAttack