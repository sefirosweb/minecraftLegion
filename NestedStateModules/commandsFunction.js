const {
    StateTransition,
    BehaviorIdle,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine
} = require("mineflayer-statemachine");

function commandsFunction(bot, targets) {

    bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);

    const transitions = [
        new StateTransition({
            parent: lookAtPlayersState,
            child: exit,
            name: 'Player say: bye',
        }),
        new StateTransition({
            parent: followPlayer,
            child: exit,
            name: 'Player say: bye',
        }),
        new StateTransition({
            parent: lookAtFollowTarget,
            child: exit,
            name: 'Player say: bye',
        }),
        new StateTransition({
            parent: lookAtPlayersState,
            child: followPlayer,
            name: 'Player say: come',
            onTransition: () => bot.chat("Yes sr!"),
        }),
        new StateTransition({
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: 'The player is too far',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),
        new StateTransition({
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: 'The player is too close',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
        }),
        new StateTransition({
            parent: enter,
            child: lookAtPlayersState,
            name: 'Enter to nested',
            shouldTransition: () => true,
        }),
    ];

    bot.on("chat", (username, message) => {
        switch (true) {
            case (message === "bye"):
                bot.chat("Bye Master!");
                transitions[0].trigger();
                transitions[1].trigger();
                transitions[2].trigger();
                break;
            case (message === "come"):
                transitions[3].trigger();
                break;
        }
    });

    const commandsFunction = new NestedStateMachine(transitions, enter, exit);
    commandsFunction.stateName = 'commandsFunction'
    return commandsFunction;
}


module.exports = commandsFunction;