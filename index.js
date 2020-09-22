require('dotenv').config()
const config = require('./config')
const mineflayer = require("mineflayer");

const {
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    BehaviorIdle,
    NestedStateMachine,
} = require("mineflayer-statemachine");
const deathFunction = require('./NestedStateModules/deathFunction');

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
    });
    bot.on('kicked', (reason, loggedIn) => {
        reasonDecoded = JSON.parse(reason)
        console.log(reasonDecoded)
    });
    bot.on('error', err => console.log(err));
    bot.once("spawn", () => {
        bot.chat('Im in!')
        if (portInventory !== null) {
            const inventoryViewer = require('mineflayer-web-inventory')
            inventoryViewer(bot, { port: portInventory })
        }
        if (portPrismarineViewer !== null) {
            const prismarineViewer = require('./modules/viewer')
            prismarineViewer.start(bot, portPrismarineViewer);
        }
    });

    bot.once("spawn", () => {
        const targets = {};
        const idleState = new BehaviorIdle(targets);
        const death = deathFunction(bot, targets)

        const transitions = [
            new StateTransition({
                parent: idleState,
                child: death,
                name: 'idleState -> deathFunction',
                shouldTransition: () => true,
            }),

            new StateTransition({
                parent: death,
                child: idleState,
                name: 'if bot die then restarts',
            }),
        ];

        bot.on('death', function() {
            transitions[1].trigger();
            bot.chat('Omg im dead');
        })

        const root = new NestedStateMachine(transitions, idleState);
        root.stateName = "main";
        const stateMachine = new BotStateMachine(bot, root);

        if (portBotStateMachine !== null) {
            const webserver = new StateMachineWebserver(bot, stateMachine, portBotStateMachine);
            webserver.startServer();
        }
    });

}