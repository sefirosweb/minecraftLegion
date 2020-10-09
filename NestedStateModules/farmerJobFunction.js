const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine,
} = require("mineflayer-statemachine");

function farmerJobFunction(bot, targets) {
    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);

    const transitions = [
        new StateTransition({
            parent: enter,
            child: exit,
            name: 'enter -> getClosestEntity',
            //  shouldTransition: () => true,
        }),
    ];

    const farmerJobFunction = new NestedStateMachine(transitions, enter, exit);
    farmerJobFunction.stateName = 'farmerJobFunction'
    return farmerJobFunction;
}


module.exports = farmerJobFunction;