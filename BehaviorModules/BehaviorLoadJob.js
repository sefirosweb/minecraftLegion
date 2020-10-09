const botConfig = require('../modules/botConfig');

class BehaviorLoadJob {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorLoadJob';
        this.job = false;
    }

    onStateEntered = function() {
        this.job = botConfig.loadJob(this.bot.username);
    };

    getJob = function() {
        return this.job;
    };

}
module.exports = BehaviorLoadJob