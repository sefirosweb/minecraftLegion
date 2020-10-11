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

    const range_maxLongRangeAttack = 40;
    const range_minDistanceAttack = 2;
    const range_followToShortAttack = 6;


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
            name: 'enter -> followMob',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: attack,
            child: followMob,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() > 2 && followMob.distanceToTarget() < 6 && targets.entity.isValid,
        }),

        // Long Range Attack 
        new StateTransition({
            parent: attack,
            child: longRangeAttack,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() > 6 && targets.entity.isValid,
        }),

        new StateTransition({
            parent: followMob,
            child: longRangeAttack,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() < 40 && followMob.distanceToTarget() > 6 && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: longRangeAttack,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() < 40 && followMob.distanceToTarget() > 6 && longRangeAttack.nextAttack() && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: followMob,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() < 6 && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: followMob,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() > 40 && targets.entity.isValid,
        }),
        // END ************* Long Range Attack 

        new StateTransition({
            parent: followMob,
            child: attack,
            name: 'Mob is near',
            shouldTransition: () => followMob.distanceToTarget() < 2 && attack.nextAttack() && targets.entity.isValid,
        }),

        new StateTransition({
            parent: attack,
            child: attack,
            name: 'Mob still near continue attack',
            shouldTransition: () => followMob.distanceToTarget() < 2 && attack.nextAttack() && targets.entity.isValid,
        }),

        new StateTransition({
            parent: attack,
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
    ];

    const guardCombatJobFunction = new NestedStateMachine(transitions, enter, exit);
    guardCombatJobFunction.stateName = 'Guard Combat'
    return guardCombatJobFunction;
}

module.exports = guardCombatJobFunction;