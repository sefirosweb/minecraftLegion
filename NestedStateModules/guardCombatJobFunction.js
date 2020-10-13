const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine,
    BehaviorFollowEntity,
} = require("mineflayer-statemachine");
const BehaviorAttack = require("./../BehaviorModules/BehaviorAttack");
const BehaviorLongAttack = require("./../BehaviorModules/BehaviorLongAttack");

function guardCombatJobFunction(bot, targets) {
    const range_exitIsToFarAway = 100;

    const rango_bow = 60;
    const range_sword = 3;
    const range_followToShortAttack = 5;


    const enter = new BehaviorIdle(targets);
    enter.stateName = 'Enter';

    const exit = new BehaviorIdle(targets);
    exit.stateName = 'Exit';

    const attack = new BehaviorAttack(bot, targets);
    attack.stateName = 'Attack';

    const longRangeAttack = new BehaviorLongAttack(bot, targets);
    longRangeAttack.stateName = 'Long Range Attack';

    const followMob = new BehaviorFollowEntity(bot, targets);
    followMob.stateName = 'Follow Enemy';

    const transitions = [
        new StateTransition({
            parent: enter,
            child: attack,
            onTransition: () => {
                console.log('Activating master grade');
            },
            name: 'enter -> followMob',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: attack,
            child: followMob,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() > range_sword && followMob.distanceToTarget() < range_followToShortAttack && targets.entity.isValid,
        }),

        // Long Range Attack 
        new StateTransition({
            parent: attack,
            child: longRangeAttack,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() > range_followToShortAttack && targets.entity.isValid,
        }),

        new StateTransition({
            parent: followMob,
            child: longRangeAttack,
            name: 'Mob is on range for Long Range Attack',
            shouldTransition: () => followMob.distanceToTarget() < rango_bow && followMob.distanceToTarget() > range_followToShortAttack && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: followMob,
            name: 'Mob is near for short attack',
            shouldTransition: () => followMob.distanceToTarget() < range_followToShortAttack && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: followMob,
            name: 'Mob is VERY too far',
            shouldTransition: () => followMob.distanceToTarget() > rango_bow && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: longRangeAttack,
            name: 'Mob is on range for Long Range Attack',
            shouldTransition: () => followMob.distanceToTarget() < rango_bow && followMob.distanceToTarget() > range_followToShortAttack && longRangeAttack.nextAttack() && targets.entity.isValid,
        }),
        // END ************* Long Range Attack 

        new StateTransition({
            parent: followMob,
            child: attack,
            name: 'Mob is near',
            shouldTransition: () => followMob.distanceToTarget() < range_sword && attack.nextAttack() && targets.entity.isValid,
        }),

        new StateTransition({
            parent: attack,
            child: attack,
            name: 'Mob still near continue attack',
            shouldTransition: () => followMob.distanceToTarget() < range_sword && attack.nextAttack() && targets.entity.isValid,
        }),

        // Mob is dead
        new StateTransition({
            parent: attack,
            child: exit,
            name: 'Mob is dead',
            onTransition: () => targets.entity = undefined,
            shouldTransition: () => targets.entity.isValid === false
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: exit,
            name: 'Mob is dead',
            onTransition: () => targets.entity = undefined,
            shouldTransition: () => targets.entity.isValid === false
        }),

        new StateTransition({
            parent: followMob,
            child: exit,
            name: 'Mob is dead',
            onTransition: () => targets.entity = undefined,
            shouldTransition: () => targets.entity.isValid === false
        }),
        // END ************* Long Range Attack 
    ];

    const guardCombatJobFunction = new NestedStateMachine(transitions, enter, exit);
    guardCombatJobFunction.stateName = 'Guard Combat'
    return guardCombatJobFunction;
}

module.exports = guardCombatJobFunction;