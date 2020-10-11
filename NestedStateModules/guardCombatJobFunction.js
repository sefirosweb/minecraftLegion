const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine,
    BehaviorFollowEntity,
} = require("mineflayer-statemachine");
const BehaviorAttack = require("./../BehaviorModules/BehaviorAttack");

function guardCombatJobFunction(bot, targets) {
    const enter = new BehaviorIdle(targets);
    enter.stateName = 'Enter';

    const exit = new BehaviorIdle(targets);
    exit.stateName = 'Exit';

    const attack = new BehaviorAttack(bot, targets);
    attack.stateName = 'Attack';

    const followMob = new BehaviorFollowEntity(bot, targets);
    followMob.stateName = 'Follow Enemy';


    const transitions = [
        new StateTransition({
            parent: enter,
            child: followMob,
            name: 'enter -> followMob',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: followMob,
            child: attack,
            name: 'Mob is near',
            shouldTransition: () => followMob.distanceToTarget() < 2 && attack.nextAttack() && targets.entity.isValid,
        }),

        new StateTransition({
            parent: attack,
            child: followMob,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() > 2 && targets.entity.isValid,
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