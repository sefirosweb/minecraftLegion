require('dotenv').config()
const USERNAME = process.env.USER
const SERVER = process.env.SERVER
const PORT = process.env.PORT

console.log("Bot: " + USERNAME + " conected!")
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
    username: USERNAME,
    host: SERVER,
    port: PORT
})

// Console logs for issues
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

const BehaviorMoveToArray = require('../BehaviorModules/BehaviorMoveToArray')


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


function patrolTheTown() {
    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

    let points = [];
    let nextStep = {
        position: {
            x: -100,
            y: 64,
            z: 100
        }
    }
    points.push(nextStep);
    nextStep = {
        position: {
            x: -100,
            y: 64,
            z: 90
        }
    }
    points.push(nextStep);
    nextStep = {
        position: {
            x: -90,
            y: 64,
            z: 90
        }
    }
    points.push(nextStep);
    nextStep = {
        position: {
            x: -90,
            y: 64,
            z: 100
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
