const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine,
} = require("mineflayer-statemachine");

const BehaviorloadJob = require("./../BehaviorModules/BehaviorLoadJob");

function startWorkFunction(bot, targets) {
    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const guardJob = new require('./guardJobFunction')(bot, targets);
    const archerJob = new require('./archerJobFunction')(bot, targets);
    const farmerJob = new require('./farmerJobFunction')(bot, targets);
    const loadJob = new BehaviorloadJob(bot, targets);


    const transitions = [
        new StateTransition({
            parent: enter,
            child: loadJob,
            name: 'enter -> loadJob',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: loadJob,
            child: guardJob,
            name: 'loadJob -> guardJob',
            shouldTransition: () => loadJob.getJob() === 'guard',
        }),

        new StateTransition({
            parent: loadJob,
            child: archerJob,
            name: 'loadJob -> archerJob',
            shouldTransition: () => loadJob.getJob() === 'archer',
        }),

        new StateTransition({
            parent: loadJob,
            child: farmerJob,
            name: 'loadJob -> farmerJob',
            shouldTransition: () => loadJob.getJob() === 'farmer',
        }),

    ];

    const startWorkFunction = new NestedStateMachine(transitions, enter, exit);
    startWorkFunction.stateName = 'startWorkFunction'
    return startWorkFunction;
}


module.exports = startWorkFunction;