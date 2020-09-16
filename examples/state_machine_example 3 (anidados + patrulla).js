require('dotenv').config()
const USERNAME = process.env.USER
const SERVER = process.env.SERVER
const PORT = process.env.PORT

console.log("Bot: " + USERNAME + " Conecting to:" + SERVER)
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({
    username: USERNAME,
    host: SERVER,
    port: PORT
})

bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn))
bot.on('error', err => console.log(err))


bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine,
    StateMachineWebserver,
    BehaviorMoveTo,

    BehaviorIdle
} = require("mineflayer-statemachine");


bot.once("spawn", () => {
    const idleState = new BehaviorIdle();
    const patrolTheTownS = patrolTheTown();

    const transitions = [

        new StateTransition({
            parent: idleState,
            child: patrolTheTownS,
            shouldTransition: () => true,
            onTransition: () => bot.chat('Starting Patrol!'),
        }),

        new StateTransition({
            parent: patrolTheTownS,
            child: idleState,
            shouldTransition: () => patrolTheTownS.isFinished(),
        }),

    ];


    const root = new NestedStateMachine(transitions, idleState);
    root.stateName = "Main";

    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine);
    webserver.startServer();
});


const Movements = require('mineflayer-pathfinder').Movements
const mcData = require('minecraft-data')(bot.version)


function patrolTheTown() {
    const targets = {};
    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

    let points = [];

    let nextStep = {
        position: {
            x: -94,
            y: 60,
            z: -296
        }
    }
    points.push(nextStep);

    nextStep = {
        position: {
            x: -95,
            y: 61,
            z: -316
        }
    }
    points.push(nextStep);


    nextStep = {
        position: {
            x: -105,
            y: 61,
            z: -316
        }
    }
    points.push(nextStep);


    nextStep = {
        position: {
            x: -105,
            y: 61,
            z: -300
        }
    }
    points.push(nextStep);


    const patrol = new BehaviorMoveToArray(bot, points);

    const transitions = [

        new StateTransition({
            parent: enter,
            child: patrol,
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: patrol,
            child: patrol,
            shouldTransition: () => patrol.distanceToTarget() <= 2 && patrol.endPatrol == false,
        }),

        new StateTransition({
            parent: patrol,
            child: exit,
            shouldTransition: () => patrol.getEndPatrol(),
        }),

    ];

    const patrolTheTown = new NestedStateMachine(transitions, enter, exit);
    patrolTheTown.stateName = 'patrolTheTown'
    return patrolTheTown;
}

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

        this.bot = bot;
        const mcData = require('minecraft-data')(bot.version);
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

function createFollowPlayerState() {
    const targets = {};
    const playerFilter = EntityFilters().PlayersOnly;

    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, playerFilter);

    const transitions = [

        new StateTransition({
            parent: enter,
            child: getClosestPlayer,
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: getClosestPlayer,
            child: followPlayer,
            shouldTransition: () => targets.entity !== undefined,
        }),

        new StateTransition({
            parent: getClosestPlayer,
            child: exit,
            shouldTransition: () => targets.entity === undefined,
        }),

        new StateTransition({
            parent: followPlayer,
            child: exit,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

    ];

    const createFollowPlayerState = new NestedStateMachine(transitions, enter, exit);
    createFollowPlayerState.stateName = 'createFollowPlayerState'
    return createFollowPlayerState;
}