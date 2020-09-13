require('dotenv').config()
const USERNAME = process.env.USER
const AUTOLOGIN = process.env.AUTOLOGIN
const SERVER = process.env.SERVER
const PORT = process.env.PORT

console.log("Bot: " + USERNAME + " Conecting to:" + SERVER)
const mineflayer = require("mineflayer");
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

bot.once("spawn", () =>
{
    bot.chat('/login ' + AUTOLOGIN)
    bot.chat('Im in!')
})

bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals

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
    
function goBase()
{
    console.log("GO")
    /*
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)

    const p = {};
    p.x = -10;
    p.y = 93;
    p.z = -3;

    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))*/
}

bot.once("spawn", () =>
{
    // This targets object is used to pass data between different states. It can be left empty.
    const targets = {};

    console.log("Current position: ")
    console.log(bot.player.entity.position)
    
    // Create our states

    const printServerStates = new BehaviorPrintServerStats(bot);
    const idleState = new BehaviorIdle();
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);

    // const goBase = goBase();

    // Create our transitions
    const transitions = [

        new StateTransition({ // 0
            parent: printServerStates,
            child: idleState,
            shouldTransition: () => true
        }),

        new StateTransition({ // 1
            parent: idleState,
            child: getClosestPlayer,
            name: 'player says "hi"',
            onTransition: () => bot.chat("Hi master!")
        }),

        new StateTransition({ // 2
            parent: getClosestPlayer,
            child: lookAtPlayersState,
            shouldTransition: () => true,
        }),

        new StateTransition({ // 3
            parent: lookAtPlayersState,
            child: idleState,
            name: 'player says "bye"',
            onTransition: () => bot.chat("Good bye master!")
        }),

        new StateTransition({ // 4
            parent: lookAtPlayersState,
            child: followPlayer,
            name: 'player says "come"',
            onTransition: () => bot.chat("Yes sr!")
        }),

        new StateTransition({ // 5
            parent: followPlayer,
            child: lookAtPlayersState,
            name: 'player says "stay"',
            onTransition: () => bot.chat("Yes sr!!")
        }),

        new StateTransition({ //  6
            parent: followPlayer,
            child: idleState,
            name: 'player says "bye"',
            onTransition: () => bot.chat("GB sr!")
        }),

        new StateTransition({ // 7
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: 'closeToTarget',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        new StateTransition({ // 8
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: 'farFromTarget',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
        }),

        new StateTransition({ // 9
            parent: lookAtFollowTarget,
            child: idleState,
            name: 'player says "bye"',
            onTransition: () => bot.chat("goodbye")
        }),

        new StateTransition({ // 10
            parent: lookAtFollowTarget,
            child: lookAtPlayersState,
            name: 'player says "stay"',
        }),    
        
    ];

    const root = new NestedStateMachine(transitions, printServerStates);
    root.name = "main";
    
    bot.on("chat", (username, message) =>
    {
        if (message === "hi")
            transitions[1].trigger();   // parent: idleState,             child: getClosestPlayer,

        if (message === "bye")
        {
            transitions[3].trigger();   // parent: lookAtPlayersState,    child: idleState,
            transitions[6].trigger();   // parent: followPlayer,          child: idleState,
            transitions[9].trigger();   // parent: lookAtFollowTarget,    child: idleState,
        }

        if (message === "come")
            transitions[4].trigger();   // parent: lookAtPlayersState,    child: followPlayer,

        if (message === "stay")
        {
            transitions[5].trigger();   // parent: followPlayer,          child: lookAtPlayersState,
            transitions[10].trigger();  // parent: lookAtFollowTarget,    child: lookAtPlayersState,
        }

        
        if (message === "sleep")
        {
            transitions[5].trigger();   // parent: followPlayer,          child: lookAtPlayersState,
            transitions[10].trigger();  // parent: lookAtFollowTarget,    child: lookAtPlayersState,
        }
    });

    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine);
    webserver.startServer();
});

