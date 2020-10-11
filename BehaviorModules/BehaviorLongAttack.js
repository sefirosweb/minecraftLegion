const hawkEye = require("minecrafthawkeye");

class BehaviorLongAttack {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorLongAttack';
        this.playerIsFound = false;
        this.lastAttack = Date.now();

        this.inventory = require('../modules/inventoryModule')(this.bot);

        this.prevPlayerPositions = [];
        this.preparingShot = false;
        this.prevTime;

        this.canTarget = true;
    }

    nextAttack = function() {
        return true;
    }

    onStateEntered = function() {
        this.calc();
    };

    /*
    onStateExited() {
        this.targets.targetEntity = bot.nearestEntity(() => true)
    }
    */

    calc = function() {
        if (this.prevPlayerPositions.length > 10)
            this.prevPlayerPositions.shift();

        const position = {
            x: this.targets.entity.position.x,
            y: this.targets.entity.position.y,
            z: this.targets.entity.position.z
        }

        this.prevPlayerPositions.push(position);

        let speed = {
            x: 0,
            y: 0,
            z: 0
        };

        for (let i = 1; i < this.prevPlayerPositions.length; i++) {
            const pos = this.prevPlayerPositions[i];
            const prevPos = this.prevPlayerPositions[i - 1];
            speed.x += pos.x - prevPos.x;
            speed.y += pos.y - prevPos.y;
            speed.z += pos.z - prevPos.z;
        }

        speed.x = speed.x / this.prevPlayerPositions.length;
        speed.y = speed.y / this.prevPlayerPositions.length;
        speed.z = speed.z / this.prevPlayerPositions.length;

        if (!this.preparingShot) {
            this.bot.activateItem();
            this.preparingShot = true;
            this.prevTime = Date.now();
        }

        if (!this.checkBowEquipped()) {
            this.equipBow();
            this.preparingShot = false;
        }


        const infoShot = hawkEye.getMasterGrade(this.bot, this.targets.entity, speed);

        console.clear();
        console.log(speed)
        console.log(infoShot)

        if (infoShot) {
            this.bot.look(infoShot.yaw, infoShot.pitch);

            const currentTime = Date.now();
            if (this.preparingShot && currentTime - this.prevTime > 1200) {
                this.bot.deactivateItem();
                this.preparingShot = false;
            }
        } else {
            this.canTarget = false;
        }

    }

    getCanTarget() {
        return this.canTarget;
    }

    equipBow = function() {
        const itemEquip = this.bot.inventory.items().find(item => item.name.includes('bow'));
        if (itemEquip) {
            this.bot.equip(itemEquip, 'hand');
        }
    }

    checkBowEquipped = function() {
        const handleItem = this.bot.inventory.slots[this.bot.QUICK_BAR_START + this.bot.quickBarSlot];
        return handleItem.name === 'bow';
    }




}
module.exports = BehaviorLongAttack