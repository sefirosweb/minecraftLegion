module.exports = class BehaviorLongAttack {
    constructor(bot, targets) {
        this.bot = bot
        this.targets = targets
        this.stateName = 'BehaviorLongAttack'
        this.playerIsFound = false
        this.lastAttack = Date.now()

        this.inventory = require('../modules/inventoryModule')(this.bot)

        this.preparingShot = false
        this.prevTime


    }

    onStateEntered = function () {
        this.shot()
    }

    shot = function () {
        if (!this.preparingShot) {
            this.bot.activateItem()
            this.preparingShot = true
            this.prevTime = Date.now()
        }

        if (!this.checkBowEquipped()) {
            this.equipBow()
            this.preparingShot = false
        }

        if (this.infoShot) {
            this.bot.look(this.infoShot.yaw, this.infoShot.pitch)

            const currentTime = Date.now()
            if (this.preparingShot && currentTime - this.prevTime > 1200) {
                this.bot.deactivateItem()
                this.preparingShot = false
            }
        }
    }

    setInfoShot(infoShot) {
        this.infoShot = infoShot
    }

    equipBow = function () {
        const itemEquip = this.bot.inventory.items().find(item => item.name.includes('bow'))
        if (itemEquip) {
            this.bot.equip(itemEquip, 'hand')
        }
    }

    checkBowEquipped = function () {
        const handleItem = this.bot.inventory.slots[this.bot.QUICK_BAR_START + this.bot.quickBarSlot]
        if (!handleItem) {
            return false
        }
        return handleItem.name === 'bow'
    }

}