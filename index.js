require('dotenv').config()
const config = require('./config')

console.log("Bot: " + config.username + " Conecting to:" + config.server)
const mineflayer = require("mineflayer");


const bot = mineflayer.createBot({
    username: config.username,
    host: config.server,
    port: config.port
})



bot.on('kicked', (reason, loggedIn) => {
    reasonDecoded = JSON.parse(reason)
    console.log(reasonDecoded)
})

bot.on('error', err => console.log(err))

const inventoryViewer = require('mineflayer-web-inventory')
const prismarineViewer = require('./modules/viewer')

bot.once("spawn", () => {
    bot.chat('Im in!')
    inventoryViewer(bot)
    prismarineViewer.start(bot);
    // map.start(bot, 5000)
    /*
    mineflayerViewer(bot, { port: 4000 })
    const path = [bot.entity.position.clone()]
    bot.on('move', () => {
        if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
            path.push(bot.entity.position.clone())
            bot.viewer.drawLine('path', path)
        }
    })
    */

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
    const base = { position: { x: -60, y: 80, z: 125 } };

    const goBase = new BehaviorMoveTo(bot, base);
    const isNight = new BehaviorIsNight(bot);
    const printServerStates = new BehaviorPrintServerStats(bot);
    const idleState = new BehaviorIdle();
    const goSleep = goSleepFunction(bot)
    const baseCommands = baseFunction(bot)

    const transitions = [
        new StateTransition({ // 0
            parent: idleState,
            child: baseCommands,
            name: 'Chat listener',
        }),
        new StateTransition({ // 1
            parent: baseCommands,
            child: printServerStates,
            shouldTransition: () => false,
            name: "Restart when players die",
        }),
        new StateTransition({
            parent: baseCommands,
            child: idleState,
            name: 'Finish Command',
            shouldTransition: () => baseCommands.isFinished(),
        }),
        new StateTransition({
            parent: printServerStates,
            //child: goBase,
            child: idleState,
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

    bot.on('death', function() {
        bot.chat('Omg im dead');
        transitions[1].trigger();
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