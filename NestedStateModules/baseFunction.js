const {
    StateTransition,
    EntityFilters,
    BehaviorIdle,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine
} = require("mineflayer-statemachine");


let baseFunction = (function(bot) {
    targets = {}
    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();
    const idleState = new BehaviorIdle();

    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);


    const transitions = [
        new StateTransition({ // 0
            parent: enter,
            child: getClosestPlayer,
            name: 'enter -> getClosestPlayer',
            shouldTransition: () => true,
            onTransition: () => console.log(enter),
        }),
        new StateTransition({ // 1
            parent: getClosestPlayer,
            child: lookAtPlayersState,
            name: 'getClosestPlayer -> lookAtPlayersState',
            onTransition: () => bot.chat("Hello Master!"),
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
            onTransition: () => bot.chat("Yes sr!"),
            shouldTransition: () => false,
        }),
        new StateTransition({ // 4
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: 'The player is too far',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),
        new StateTransition({ // 5
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: 'The player is too close',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
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
});




module.exports = baseFunction