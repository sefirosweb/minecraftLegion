require('dotenv').config()
const config = require('./config')
const mineflayer = require("mineflayer");
const inventoryViewer = require('mineflayer-web-inventory')
const prismarineViewer = require('./modules/viewer')
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
const { start } = require('repl');

const botsToStart = [
    { username: "Guard1" },
    { username: "Guard2" },
    { username: "Archer1" },
    { username: "Archer2" },
    { username: "Archer3" },
    { username: "Archer4" },
];

let i = 0;
let totalBots = botsToStart.length;

function startBots() {
    botToStart = botsToStart[i];
    i++;
    if (i < totalBots) {
        setTimeout(() => {
            createNewBot(botToStart.username)
            startBots()
        }, 500)
    }
};
startBots();



function createNewBot(botName, portBotStateMachine = null, portPrismarineViewer = null, portInventory = null) {
    const bot = mineflayer.createBot({
        username: botName,
        host: config.server,
        port: config.port
    })

    bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

    bot.on('kicked', (reason, loggedIn) => {
        reasonDecoded = JSON.parse(reason)
        console.log(reasonDecoded)
    })

    bot.on('error', err => console.log(err))

    bot.once("spawn", () => {
        bot.chat('Im in!')
        if (portInventory !== portInventory) {
            inventoryViewer(bot, { port: portInventory })
        }
        if (portPrismarineViewer !== null) {
            prismarineViewer.start(bot, portPrismarineViewer);
        }
    })

    bot.once("spawn", () => {
        const targets = {};
        const base = { position: { x: -81, y: 68, z: 96 } };

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
                child: goBase,
                //child: idleState,
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

        const root = new NestedStateMachine(transitions, goBase);
        root.name = "main";
        const stateMachine = new BotStateMachine(bot, root);
        if (portBotStateMachine !== null) {
            const webserver = new StateMachinefserver(bot, stateMachine, portBotStateMachine);
            webserver.startServer();
        }
    });

}