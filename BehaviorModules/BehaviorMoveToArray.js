const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");

const BehaviorMoveToArray = (function () {
    function BehaviorMoveToArray(bot, patrol) {
        this.bot = bot;
        this.stateName = 'BehaviorMoveToArray';
        this.isFinished = false;

        this.currentPosition = 0;
        this.endPatrol = false;
        this.active = false;
        this.distance = 0;
        this.patrol = patrol

        const mcData = require('minecraft-data')(this.bot.version);
        this.movements = new mineflayer_pathfinder_1.Movements(bot, mcData);

        bot.on('path_update', (r) => {
            if (r.status === 'noPath')
                console.log("[MoveTo] No path to target!");
        });

        bot.on('goal_reached', () => {
            console.log("[MoveTo] Target reached.");
        });

    }

    BehaviorMoveToArray.prototype.onStateEntered = function () {
        this.targets = this.patrol[this.currentPosition];
        //console.log('Go to:', this.patrol[this.currentPosition]);
        this.currentPosition++;

        if (this.currentPosition > this.patrol.length) {
            this.currentPosition = 0;
            this.endPatrol = true
            this.targets = this.patrol[this.currentPosition];
        } else {
            this.endPatrol = false
        }

        this.startMoving();
    };

    BehaviorMoveToArray.prototype.onStateExited = function () {
        this.stopMoving();
    };

    BehaviorMoveToArray.prototype.getEndPatrol = function () {
        return this.endPatrol;
    };

    BehaviorMoveToArray.prototype.setMoveTarget = function (position) {
        if (this.targets.position == position)
            return;
        this.targets.position = position;
        this.restart();
    };

    BehaviorMoveToArray.prototype.stopMoving = function () {
        const pathfinder = this.bot.pathfinder;
        pathfinder.setGoal(null);
    };

    BehaviorMoveToArray.prototype.startMoving = function () {
        const position = this.targets.position;
        if (!position) {
            console.log("[MoveTo] Target not defined. Skipping.");
            return;
        }

        // console.log("[MoveTo] Moving from " + this.bot.entity.position + " to " + position);

        const pathfinder = this.bot.pathfinder;
        let goal;
        if (this.distance === 0)
            goal = new mineflayer_pathfinder_1.goals.GoalBlock(position.x, position.y, position.z);
        else
            goal = new mineflayer_pathfinder_1.goals.GoalNear(position.x, position.y, position.z, this.distance);
        pathfinder.setMovements(this.movements);
        pathfinder.setGoal(goal);
    };

    BehaviorMoveToArray.prototype.restart = function () {
        if (!this.active)
            return;
        this.stopMoving();
        this.startMoving();
    };

    BehaviorMoveToArray.prototype.isFinished = function () {
        const pathfinder = this.bot.pathfinder;
        return !pathfinder.isMoving();
    };


    BehaviorMoveToArray.prototype.distanceToTarget = function () {
        let position = this.targets.position;
        if (!position)
            return 0;
        let distance = this.bot.entity.position.distanceTo(position);
        // console.log(distance)
        return distance;
    };


    return BehaviorMoveToArray;
}());

module.exports = BehaviorMoveToArray