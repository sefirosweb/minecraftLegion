const BehaviorGoToBed = (function () {
    function BehaviorGoToBed(bot, bed) {
        this.bot = bot;
        this.bed = bed;
        this.stateName = 'goToBed';
        this.isInBed = false;
    }
    BehaviorGoToBed.prototype.onStateEntered = function () {
        console.log('BehaviorGoToBed')
        setTimeout(() => {
            this.sleep();
        }, 500);

    };
    BehaviorGoToBed.prototype.sleep = function () {
        this.bot.sleep(this.bed, (err) => {
            if (err) {
                this.bot.chat(`I can't sleep: ${err.message}`)
                setTimeout(() => {
                    this.sleep();
                }, 10000);
            } else {
                this.isInBed = true;
            }
        })
    }
    BehaviorGoToBed.prototype.getIsInBed = function () {
        return this.isInBed;
    }
    return BehaviorGoToBed;
}());

module.exports = BehaviorGoToBed