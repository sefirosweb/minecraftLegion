const hawkEye = require("minecrafthawkeye");

class BehaviorLongAttack {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorLongAttack';
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
        if (currentDate - this.lastAttack > 1200) {
            this.lastAttack = currentDate
            return true;
        }
        return false;
    };

    checkHandleSword = function() {
        const bowHandled = this.inventory.checkItemEquiped('bow');

        if (bowHandled)
            return;

        const itemEquip = this.bot.inventory.items().find(item => item.name.includes('bow'));
        if (itemEquip) {
            if (itemEquip) {
                this.bot.equip(itemEquip, 'hand');
            }
        }
    }
}
module.exports = BehaviorLongAttack