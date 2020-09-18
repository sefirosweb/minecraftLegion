require('dotenv').config()
const USERNAME = process.env.USER
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
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    BehaviorIdle,
    BehaviorPrintServerStats,
    NestedStateMachine,
    BehaviorMoveTo
} = require("mineflayer-statemachine");
const BehaviorIsNight = require("./BehaviorModules/BehaviorIsNight");
const goSleepFunction = require('./NestedStateModules/goSleepFunction');
const baseFunction = require('./NestedStateModules/baseFunction');


bot.once("spawn", () => {
    const targets = {};
    const base = { position: { x: -85, y: 64, z: 90 } };

    const goBase = new BehaviorMoveTo(bot, base);
    const isNight = new BehaviorIsNight(bot);
    const printServerStates = new BehaviorPrintServerStats(bot);
    const idleState = new BehaviorIdle();
    const goSleep = goSleepFunction(bot)
    const baseCommands = baseFunction(bot)

    const transitions = [
        new StateTransition({
            parent: idleState,
            child: baseCommands,
            name: 'Chat listener',
        }),
        new StateTransition({
            parent: baseCommands,
            child: idleState,
            name: 'Finish Command',
            shouldTransition: () => baseCommands.isFinished(),
        }),
        new StateTransition({
            parent: printServerStates,
            child: goBase,
            name: '0 Starts',
            shouldTransition: () => true
        }),
        new StateTransition({
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
            },
        }),
        new StateTransition({
            parent: goSleep,
            child: idleState,
            shouldTransition: () => goSleep.isFinished(),
            name: "goSleep -> idleState",
        }),
    ];

    bot.on('death', function () {
        bot.chat('Omg im dead');
    })

    bot.on('time', () => {
        isNight.check()
    });

    bot.on("chat", (username, message) => {
        if (message === "hi " + bot.username) {
            transitions[0].trigger();
        }
    });

    const root = new NestedStateMachine(transitions, printServerStates);
    root.name = "main";
    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine);
    webserver.startServer();
});

