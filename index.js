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
    NestedStateMachine,
    BehaviorMoveTo,
} = require("mineflayer-statemachine");
const BehaviorIsNight = require("./BehaviorModules/BehaviorIsNight");
const BehaviorGetPlayer = require("./BehaviorModules/BehaviorGetPlayer");
const BehaviorMoveToArray = require("./BehaviorModules/BehaviorMoveToArray");

const goSleepFunction = require('./NestedStateModules/goSleepFunction');
const baseFunction = require('./NestedStateModules/baseFunction');

// const { start } = require('repl');

const botsToStart = [
    { username: "Guard1", portBotStateMachine: 4000, portPrismarineViewer: null, portInventory: null },
    // { username: "Guard2", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    // { username: "Guard3", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    // { username: "Archer1", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    // { username: "Archer2", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    // { username: "Archer3", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    // { username: "Archer4", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },



];

let i = 0;
let totalBots = botsToStart.length;

function startBots() {
    botToStart = botsToStart[i];
    i++;
    if (i <= totalBots) {
        setTimeout(() => {
            createNewBot(botToStart.username, botToStart.portBotStateMachine, botToStart.portPrismarineViewer, botToStart.portInventory)
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
        if (portInventory !== null) {
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
        const isNight = new BehaviorIsNight(bot, targets);
        const idleState = new BehaviorIdle(targets);
        const goSleep = goSleepFunction(bot, targets)
        const baseCommands = baseFunction(bot, targets)
        const playerEntity = new BehaviorGetPlayer(bot, targets)

        let moveToArray = [];
        let nextStep = {
            position: {
                x: 150,
                y: 4,
                z: -200
            }
        }
        moveToArray.push(nextStep);
        nextStep = {
            position: {
                x: 170,
                y: 4,
                z: -200
            }
        }
        moveToArray.push(nextStep);
        nextStep = {
            position: {
                x: 170,
                y: 4,
                z: -220
            }
        }
        moveToArray.push(nextStep);
        nextStep = {
            position: {
                x: 150,
                y: 4,
                z: -220
            }
        }
        moveToArray.push(nextStep);


        const patrol = new BehaviorMoveToArray(bot, moveToArray);

        const transitions = [
            new StateTransition({ // Trigger -> 0
                parent: idleState,
                child: playerEntity,
                name: 'Chat listener',
                shouldTransition: () => playerEntity.playerFound(),
                onTransition: () => playerEntity.playerIsFound = false,
            }),
            new StateTransition({
                parent: playerEntity,
                child: baseCommands,
                name: 'Transfer to sub nestered commands',
                shouldTransition: () => true,
            }),
            new StateTransition({
                parent: baseCommands,
                child: idleState,
                name: "Restart when players die",
                shouldTransition: () => false,
            }),
            new StateTransition({
                parent: baseCommands,
                child: idleState,
                name: 'Finish Command',
                shouldTransition: () => baseCommands.isFinished(),
                onTransition: () => playerEntity.playerIsFound = false,
            }),
            new StateTransition({
                parent: goBase,
                child: idleState,
                name: '11 Near base',
                shouldTransition: () => goBase.distanceToTarget() < 2,
                onTransition: () => bot.chat("Im are on base!"),
            }),
            new StateTransition({
                parent: idleState,
                child: isNight,
                name: "idleState -> isNight",
                shouldTransition: () => isNight.getIsNight() && isNight.getBed() !== false,
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

            new StateTransition({
                parent: idleState,
                child: patrol,
                name: "idleState -> patrol",
                shouldTransition: () => true,
            }),

            new StateTransition({
                parent: patrol,
                child: patrol,
                name: "patrol bucle",
                shouldTransition: () => patrol.distanceToTarget() <= 2 && patrol.endPatrol == false,
            }),

            new StateTransition({
                parent: patrol,
                child: idleState,
                shouldTransition: () => patrol.getEndPatrol(),
                name: "patrol -> idleState",
            }),

        ];

        bot.on('death', function() {
            bot.chat('Omg im dead');
            transitions[3].trigger();
        })

        bot.on('time', () => {
            isNight.check()
        });

        bot.on("chat", (username, message) => {
            if (message === "hi " + bot.username || message === "hi all") {
                playerEntity.getPlayerEntity(username);
                transitions[0].trigger();
            }
        });

        const root = new NestedStateMachine(transitions, idleState);
        root.name = "main";
        const stateMachine = new BotStateMachine(bot, root);
        if (portBotStateMachine !== null) {
            const webserver = new StateMachineWebserver(bot, stateMachine, portBotStateMachine);
            webserver.startServer();
        }
    });

}