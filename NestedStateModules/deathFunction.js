const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine
} = require("mineflayer-statemachine");
const BehaviorGetPlayer = require("./../BehaviorModules/BehaviorGetPlayer");

function deathFunction(bot, targets) {
    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const startWork = new require('./startWorkFunction')(bot, targets);
    const commands = new require('./commandsFunction')(bot, targets);
    const playerEntity = new BehaviorGetPlayer(bot, targets)

    const transitions = [
        new StateTransition({
            parent: enter,
            child: startWork,
            name: 'enter -> startWork',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: enter,
            child: playerEntity,
            name: 'Player say: hi',
        }),

        new StateTransition({
            parent: startWork,
            child: playerEntity,
            name: 'Player say: hi',
        }),

        new StateTransition({
            parent: playerEntity,
            child: commands,
            name: 'Transfer to sub nestered commands',
            shouldTransition: () => commands.isFinished(),
            onTransition: () => bot.chat("Hi " + playerEntity.getPlayerName()),
        }),

        new StateTransition({
            parent: commands,
            child: startWork,
            name: 'Commands finished',
            shouldTransition: () => commands.isFinished(),
            onTransition: () => bot.look(bot.player.entity.yaw, 0),
        }),
    ];

    bot.on("chat", (username, message) => {
        if (message === "hi " + bot.username || message === "hi all") {
            const player = playerEntity.getPlayerEntity(username);
            if (player) {
                console.log(player);
                transitions[1].trigger();
                transitions[2].trigger();
            }
        }
    });

    const deathFunction = new NestedStateMachine(transitions, enter, exit);
    deathFunction.stateName = 'deathFunction'
    return deathFunction;
}

module.exports = deathFunction;