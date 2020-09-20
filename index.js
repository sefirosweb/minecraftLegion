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

    ,
    BehaviorFollowEntity,
    BehaviorGetClosestEntity,
    EntityFilters,
    BehaviorLookAtEntity
} = require("mineflayer-statemachine");
const BehaviorIsNight = require("./BehaviorModules/BehaviorIsNight");
const BehaviorGetPlayer = require("./BehaviorModules/BehaviorGetPlayer");

const goSleepFunction = require('./NestedStateModules/goSleepFunction');
// const baseFunction = require('./NestedStateModules/baseFunction');

// const { start } = require('repl');

const botsToStart = [
    { username: "Guard1", portBotStateMachine: 4000, portPrismarineViewer: null, portInventory: null },
    { username: "Guard2", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    { username: "Guard3", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    { username: "Archer1", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    { username: "Archer2", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    { username: "Archer3", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },
    { username: "Archer4", portBotStateMachine: null, portPrismarineViewer: null, portInventory: null },


];

let i = 0;
let totalBots = botsToStart.length;

function startBots() {
    botToStart = botsToStart[i];
    i++;
    if (i <= totalBots) {
        setTimeout(() => {
            createNewBot(botToStart.username, botToStart.pwortBotStateMachine, botToStart.portPrismarineViewer, botToStart.portInventory)
            startBots()
        }, 500)
    }
};
startBots();

let playerName = {};


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
                child: idleState,
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
                onTransition: () => bot.chat("Im are on base!"),
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
            if (message === "hi " + bot.username || message === "hi all") {
                playerName = username;
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


function baseFunction(bot) {
    const targets = {};
    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();
    const idleState = new BehaviorIdle();

    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().AllEntities);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);

    const playerEntity = new BehaviorGetPlayer(bot, targets)

    const transitions = [
        new StateTransition({ // 0
            parent: enter,
            child: playerEntity,
            name: 'enter -> playerEntity',
            shouldTransition: () => true,
            onTransition: () => playerEntity.getPlayerEntity(playerName),
        }),
        new StateTransition({ // 1
            parent: playerEntity,
            child: lookAtPlayersState,
            name: 'playerEntity -> lookAtPlayersState',
            onTransition: () => {
                lookAtPlayersState.targets = playerEntity.targets
                bot.chat("Hello " + playerEntity.targets.entity.username + "!");
            },
            shouldTransition: () => true,
        }),
        new StateTransition({ // 2
            parent: lookAtPlayersState,
            name: 'Player say: bye',
            child: exit,
            shouldTransition: () => false,
        }),
        new StateTransition({ // 3
            parent: lookAtPlayersState,
            child: followPlayer,
            name: 'Player say: come',
            onTransition: () => {
                followPlayer.targets = lookAtPlayersState.targets
                bot.chat("Yes sr!");
            },
            shouldTransition: () => false,
        }),
        new StateTransition({ // 4
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: 'The player is too far',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
            onTransition: () => lookAtFollowTarget.targets = followPlayer.targets,
        }),
        new StateTransition({ // 5
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: 'The player is too close',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
            onTransition: () => followPlayer.targets = lookAtFollowTarget.targets,
        }),
        new StateTransition({ // 6
            parent: lookAtFollowTarget,
            child: exit,
            name: 'Player say: bye',
        }),
        new StateTransition({ // 7
            parent: followPlayer,
            child: exit,
            name: 'Player say: bye',
        }),
    ];


    bot.on("chat", (username, message) => {
        switch (true) {
            case (message === "bye"):
                bot.chat("Bye Master!");
                transitions[2].trigger();
                transitions[6].trigger();
                transitions[7].trigger();
                break;
            case (message === "come"):
                transitions[3].trigger();
                break;
        }
    });


    const baseFunction = new NestedStateMachine(transitions, enter, exit);
    baseFunction.stateName = 'baseFunction'
    return baseFunction;
}