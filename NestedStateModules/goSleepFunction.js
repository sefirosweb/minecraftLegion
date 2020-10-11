const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine,
    BehaviorMoveTo
} = require("mineflayer-statemachine");
const BehaviorGoToBed = require('../BehaviorModules/BehaviorGoToBed')
const BehaviorIsNight = require("../BehaviorModules/BehaviorIsNight");

let goSleepFunction = (function(bot) {
    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

    const moveToBed = new BehaviorMoveTo(bot);
    const goSleep = new BehaviorGoToBed(bot);
    const isNight = new BehaviorIsNight(bot)

    const transitions = [

        new StateTransition({
            parent: enter,
            child: moveToBed,
            name: 'Move To Bed when is night',
            shouldTransition: () => true,
            onTransition: () => {
                isNight.checkNearBed();
                moveToBed.targets = isNight.getBed()
            },
        }),

        new StateTransition({
            parent: moveToBed,
            child: goSleep,
            shouldTransition: () => moveToBed.distanceToTarget() < 2,
            name: "Click Sleep on Bed",
            onTransition: () => goSleep.bed = moveToBed.targets,
        }),

        new StateTransition({
            parent: goSleep,
            child: exit,
            shouldTransition: () => goSleep.getWake(),
            name: "Finished Sleep",
        }),

    ];

    const goSleepFunction = new NestedStateMachine(transitions, enter, exit);
    goSleepFunction.stateName = 'Go Sleep'
    return goSleepFunction;
});

module.exports = goSleepFunction