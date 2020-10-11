class BehaviorAttack {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorAttack';
        this.playerIsFound = false;
        this.lastAttack = Date.now();

        this.inventory = require('../modules/inventoryModule')(this.bot);
    }

    onStateEntered = function() {
        this.bot.lookAt(this.targets.entity.position.offset(0, 1, 0));
        this.checkHandleSword();
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

    checkHandleSword = function() {
        const swordHandled = this.inventory.checkItemEquiped('sword');

        if (swordHandled)
            return;

        const itemEquip = this.bot.inventory.items().find(item => item.name.includes('sword'));
        if (itemEquip) {
            this.bot.equip(itemEquip, 'hand');
        }
    }


    /*
    onStateExited() {
        this.targets.targetEntity = bot.nearestEntity(() => true)
    }
    */
}
module.exports = BehaviorAttack