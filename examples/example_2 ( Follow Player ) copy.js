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
    BehaviorIdle
} = require("mineflayer-statemachine");


bot.once("spawn", () => {
    const idleState = new BehaviorIdle();
    const followPlayerState = createFollowPlayerState();

    const transitions = [

        new StateTransition({
            parent: idleState,
            child: followPlayerState,
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: followPlayerState,
            child: idleState,
            shouldTransition: () => followPlayerState.isFinished(),
        }),

    ];

    
    const root = new NestedStateMachine(transitions, idleState);
    root.stateName = "Main";

    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine);
    webserver.startServer();
});


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