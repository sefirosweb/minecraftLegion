require('dotenv').config()
const USERNAME = process.env.USER
const AUTOLOGIN = process.env.AUTOLOGIN
const SERVER = process.env.SERVER
const PORT = process.env.PORT

console.log("Bot: " + USERNAME + " Conecting to:" + SERVER)
const mineflayer = require("mineflayer");
const inventoryViewer = require('mineflayer-web-inventory')

const bot = mineflayer.createBot({
    username: USERNAME,
    host: SERVER,
    port: PORT
})

bot.on('kicked', (reason, loggedIn) => {
    reasonDecoded = JSON.parse(reason)
    console.log(reasonDecoded)
})

bot.on('error', err => console.log(err))

bot.once("spawn", () => {
    bot.chat('Im in!')
    inventoryViewer(bot)
})

bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

const {
    globalSettings,
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    EntityFilters,
    BehaviorIdle,
    BehaviorPrintServerStats,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine,
    BehaviorMoveTo
} = require("mineflayer-statemachine");
const BehaviorIsNight = require("./BehaviorModules/BehaviorIsNight");
const BehaviorGoToBed = require('./BehaviorModules/BehaviorGoToBed')


bot.once("spawn", () => {
    const targets = {};
    const base = {
        position: {
            x: -85,
            y: 64,
            z: 90
        }
    };

    const goBase = new BehaviorMoveTo(bot, base);

    const isNight = new BehaviorIsNight(bot);

    const printServerStates = new BehaviorPrintServerStats(bot);
    const idleState = new BehaviorIdle();
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);

    const goSleep = new goSleepFunction()



    // Create our transitions
    const transitions = [

        new StateTransition({ // 0
            parent: printServerStates,
            child: goBase,
            name: '0 Starts',
            shouldTransition: () => true
        }),

        new StateTransition({ // 1
            parent: idleState,
            child: getClosestPlayer,
            name: '1 player says "hi"',
            onTransition: () => bot.chat("Hi master!")
        }),

        new StateTransition({ // 2
            parent: getClosestPlayer,
            child: lookAtPlayersState,
            name: '2 get close entity',
            shouldTransition: () => true,
        }),

        new StateTransition({ // 3
            parent: lookAtPlayersState,
            child: idleState,
            name: '3 player says "bye"',
            onTransition: () => bot.chat("Good bye master!")
        }),

        new StateTransition({ // 4
            parent: lookAtPlayersState,
            child: followPlayer,
            name: '5 player says "come"',
            onTransition: () => bot.chat("Yes sr!")
        }),

        new StateTransition({ // 5
            parent: followPlayer,
            child: lookAtPlayersState,
            name: '5 player says "stay"',
            onTransition: () => bot.chat("Yes sr!!")
        }),

        new StateTransition({ //  6
            parent: followPlayer,
            child: idleState,
            name: '6 player says "bye"',
            onTransition: () => bot.chat("GB sr!")
        }),

        new StateTransition({ // 7
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: '7 closeToTarget',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        new StateTransition({ // 8
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: '8 farFromTarget',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
        }),

        new StateTransition({ // 9
            parent: lookAtFollowTarget,
            child: idleState,
            name: '9 player says "bye"',
            onTransition: () => bot.chat("goodbye")
        }),

        new StateTransition({ // 10
            parent: lookAtFollowTarget,
            child: lookAtPlayersState,
            name: '10 player says "stay"',
        }),

        new StateTransition({ // 11
            parent: goBase,
            child: idleState,
            name: '11 Near base',
            shouldTransition: () => goBase.distanceToTarget() < 2,
            onTransition: () => {
                bot.chat("Im are on base!")
            },
        }),

        new StateTransition({
            parent: idleState,
            child: isNight,
            shouldTransition: () => isNight.getIsNight() && isNight.getBed() !== false,
            name: "idleState -> isNight",
            onTransition: () => {
                goSleep.targets = isNight.bed;
            },
        }),

        new StateTransition({
            parent: isNight,
            child: goSleep,
            shouldTransition: () => true,
            name: "isNight -> goSleep",
            onTransition: () => {
                goSleep.targets = isNight.bed
                //console.log(goSleep)
            },
        }),

        new StateTransition({
            parent: goSleep,
            child: idleState,
            shouldTransition: () => goSleep.isFinished(),
            name: "goSleep -> idleState",
        }),


    ];

    const root = new NestedStateMachine(transitions, printServerStates);
    root.name = "main";

    bot.on('death', function () {
        bot.chat('Omg im dead');
    })


    bot.on("chat", (username, message) => {
        if (message === "hi " + bot.username) {
            transitions[1].trigger();   // parent: idleState,               child: getClosestPlayer,
        }

        if (message === "bye") {
            transitions[3].trigger();   // parent: lookAtPlayersState,      child: idleState,
            transitions[6].trigger();   // parent: followPlayer,            child: idleState,
            transitions[9].trigger();   // parent: lookAtFollowTarget,      child: idleState,
        }

        if (message === "come")
            transitions[4].trigger();   // parent: lookAtPlayersState,      child: followPlayer,

        if (message === "stay") {
            transitions[5].trigger();   // parent: followPlayer,            child: lookAtPlayersState,
            transitions[10].trigger();  // parent: lookAtFollowTarget,      child: lookAtPlayersState,
        }

    });

    bot.on('time', () => {
        isNight.check()
    });

    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine);
    webserver.startServer();
});


function goSleepFunction() {
    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

    const moveToBed = new BehaviorMoveTo(bot);
    const goSleep = new BehaviorGoToBed(bot);
    const isNight = new BehaviorIsNight(bot)

    const transitions = [

        new StateTransition({
            parent: enter,
            child: moveToBed,
            name: 'Move To Bed when is night',
            shouldTransition: () => true,
            onTransition: () => {
                isNight.checkNearBed();
                moveToBed.targets = isNight.getBed()
            },
        }),

        new StateTransition({
            parent: moveToBed,
            child: goSleep,
            shouldTransition: () => moveToBed.distanceToTarget() < 2,
            name: "Click Sleep on Bed",
            onTransition: () => goSleep.bed = moveToBed.targets,
        }),

        new StateTransition({
            parent: goSleep,
            child: exit,
            shouldTransition: () => goSleep.getWake(),
            name: "Finished Sleep",
        }),

    ];

    const goSleepFunction = new NestedStateMachine(transitions, enter, exit);
    goSleepFunction.stateName = 'goSleep'
    return goSleepFunction;
}