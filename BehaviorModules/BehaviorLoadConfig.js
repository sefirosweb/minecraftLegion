const botConfig = require('../modules/botConfig');

module.exports = class BehaviorLoadConfig {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorLoadConfig';

        this.job = false;
        this.mode = 'none';
        this.distance = 10;
        this.patrol = [];
    }

    onStateEntered = function () {
        this.job = botConfig.getJob(this.bot.username);
        this.mode = botConfig.getMode(this.bot.username);
        this.distance = botConfig.getDistance(this.bot.username);
        this.patrol = botConfig.getPatrol(this.bot.username);
        this.chest = botConfig.getChest(this.bot.username);
    }

    getJob = function () {
        return this.job;
    }

    getMode = function () {
        return this.mode;
    }

    getDistance = function () {
        return this.distance;
    }

    getPatrol = function () {
        return this.patrol;
    }

    getChest = function () {
        return this.chest;
    }

}