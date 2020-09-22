const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");

class BehaviorMoveToArray {
    constructor(bot, targets, patrol) {
        this.bot = bot;
        this.targets = targets;
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
    }

    onStateEntered() {
        this.startMoving();
    }

    onStateExited = function() {
        this.stopMoving();
    };

    getEndPatrol = function() {
        console.log(this.distanceToTarget(), this.endPatrol);
        if (this.distanceToTarget() <= 2 && this.endPatrol == false) {
            this.startMoving();
            return false;
        }

        if (this.endPatrol) {
            return true;
        }

        return false;
    };

    setMoveTarget = function(position) {
        if (this.targets.position == position)
            return;
        this.targets.position = position;
        this.restart();
    };

    stopMoving = function() {
        const pathfinder = this.bot.pathfinder;
        pathfinder.setGoal(null);
    };

    startMoving = function() {
        this.targets = this.patrol[this.currentPosition];
        console.log("Next point", this.target)
        this.currentPosition++;

        if (this.currentPosition > this.patrol.length) {
            this.currentPosition = 0;
            this.endPatrol = true
            this.targets = this.patrol[this.currentPosition];
        } else {
            this.endPatrol = false
        }

        const position = this.targets.position;
        if (!position) {
            console.log("[MoveTo] Target not defined. Skipping.");
            return;
        }
        const pathfinder = this.bot.pathfinder;
        let goal;
        if (this.distance === 0)
            goal = new mineflayer_pathfinder_1.goals.GoalBlock(position.x, position.y, position.z);
        else
            goal = new mineflayer_pathfinder_1.goals.GoalNear(position.x, position.y, position.z, this.distance);
        pathfinder.setMovements(this.movements);
        pathfinder.setGoal(goal);
    };

    restart = function() {
        if (!this.active)
            return;
        this.stopMoving();
        this.startMoving();
    };

    isFinished = function() {
        const pathfinder = this.bot.pathfinder;
        return !pathfinder.isMoving();
    };

    distanceToTarget = function() {
        let position = this.targets.position;
        if (!position)
            return 0;
        let distance = this.bot.entity.position.distanceTo(position);
        return distance;
    };

}
module.exports = BehaviorMoveToArray
module.exports = BehaviorMoveToArray