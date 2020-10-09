const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine,
} = require("mineflayer-statemachine");

function startWorkFunction(bot, targets) {
    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const guardJob = new require('./guardJobFunction')(bot, targets);

    const transitions = [
        new StateTransition({
            parent: enter,
            child: guardJob,
            name: 'enter -> guardJob',
            shouldTransition: () => true, // TODO pending function for select JOB
        }),

        new StateTransition({
            parent: enter,
            child: guardJob,
            name: 'enter -> guardJob',
            // shouldTransition: () => true, // TODO pending function for select JOB
        }),

    ];

    const startWorkFunction = new NestedStateMachine(transitions, enter, exit);
    startWorkFunction.stateName = 'startWorkFunction'
    return startWorkFunction;
}


module.exports = startWorkFunction;