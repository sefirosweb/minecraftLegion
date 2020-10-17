const mineflayer_pathfinder = require("mineflayer-pathfinder");

class BehaviorMoveToArray {
    constructor(bot, targets, patrol = [], startNearestPoint = false) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = 'BehaviorMoveToArray';

        this.currentPosition = 0;
        this.endPatrol = false;
        this.active = false;
        this.patrol = patrol
        this.startNearestPoint = startNearestPoint
        this.position;

        const mcData = require('minecraft-data')(this.bot.version);
        this.movements = new mineflayer_pathfinder.Movements(bot, mcData);

        this.bot.on('path_update', (r) => {
            if (r.status === 'noPath') {
                // this.endPatrol = true;
            }
        });

        if (this.startNearestPoint === true && this.patrol !== undefined) {
            this.sortPatrol();
        }
    }

    onStateEntered() {
        this.startMoving();
    }

    onStateExited = function () {
        this.stopMoving();
    }

    sortPatrol() {
        let nearestDistance = false;
        let nearestPoint = 0;
        let currentPoint = 0;
        if (this.patrol.length == 0) {
            return;
        }
        this.patrol.forEach(position => {
            let distance = this.getDistance(position);
            if (distance < nearestDistance || !nearestDistance) {
                nearestDistance = distance;
                nearestPoint = currentPoint;
            }
            currentPoint++;
        });
        this.currentPosition = nearestPoint;
    }

    getEndPatrol = function () {
        if (this.distanceToTarget() <= 2 && this.endPatrol == false) {
            this.startMoving();
            return false;
        }

        if (this.endPatrol) {
            return true;
        }

        return false;
    };

    stopMoving = function () {
        const pathfinder = this.bot.pathfinder;
        pathfinder.setGoal(null);
    };

    startMoving = function () {
        this.position = this.patrol[this.currentPosition];
        this.currentPosition++;

        if (this.currentPosition > this.patrol.length) {
            this.currentPosition = 0;
            this.endPatrol = true
            this.position = this.patrol[this.currentPosition];
        } else {
            this.endPatrol = false
        }

        const position = this.position;
        if (!position) {
            console.log("[MoveTo] Target not defined. Skipping.");
            return;
        }

        const pathfinder = this.bot.pathfinder;
        let goal = new mineflayer_pathfinder.goals.GoalBlock(position.x, position.y, position.z);
        pathfinder.setMovements(this.movements);
        pathfinder.setGoal(goal);
    }

    restart = function () {
        this.stopMoving();
        this.startMoving();
    }

    distanceToTarget = function () {
        let position = this.position;
        return this.getDistance(position)
    }

    getDistance(position) {
        if (!position)
            return 0;
        return this.bot.entity.position.distanceTo(position);
    }

    setPatrol(patrol, startNearestPoint = false) {
        this.patrol = patrol;
        if (startNearestPoint === true && this.patrol !== undefined) {
            this.sortPatrol();
        }
    }

}
module.exports = BehaviorMoveToArray