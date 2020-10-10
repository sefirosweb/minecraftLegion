const {
    StateTransition,
    BehaviorIdle,
    BehaviorFollowEntity,
    NestedStateMachine,
    BehaviorGetClosestEntity,

} = require("mineflayer-statemachine");
const BehaviorAttack = require("./../BehaviorModules/BehaviorAttack");
const BehaviorLoadConfig = require("./../BehaviorModules/BehaviorLoadConfig");
const BehaviorMoveToArray = require("./../BehaviorModules/BehaviorMoveToArray");

function guardJobFunction(bot, targets) {
    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const attack = new BehaviorAttack(bot, targets);
    const loadConfig = new BehaviorLoadConfig(bot, targets);
    const moveToArray = new BehaviorMoveToArray(bot, targets);

    function distanceFilter(entity) {
        if (loadConfig.getMode() === 'pvp')
            return entity.position.distanceTo(this.bot.player.entity.position) <= loadConfig.getDistance() &&
                (entity.type === 'mob' || entity.type === 'player');
        if (loadConfig.getMode() === 'pve')
            return entity.position.distanceTo(this.bot.player.entity.position) <= loadConfig.getDistance() &&
                (entity.type === 'mob');

        return false;
    }

    const getClosestMob = new BehaviorGetClosestEntity(bot, targets, distanceFilter);
    const followMob = new BehaviorFollowEntity(bot, targets);

    const transitions = [
        new StateTransition({
            parent: enter,
            child: loadConfig,
            name: 'enter -> loadConfig',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: loadConfig,
            child: moveToArray,
            name: 'loadConfig -> moveToArray',
            onTransition: () => moveToArray.setPatrol(loadConfig.getPatrol(), true),
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: moveToArray,
            child: getClosestMob,
            name: 'moveToArray -> try getClosestMob',
            shouldTransition: () => {
                getClosestMob.onStateEntered();
                return targets.entity !== undefined;
            }
        }),

        new StateTransition({
            parent: moveToArray,
            child: moveToArray,
            name: 'moveToArray -> moveToArray',
            onTransition: () => console.log('next'),
            shouldTransition: () => moveToArray.getEndPatrol(),
        }),


        new StateTransition({
            parent: getClosestMob,
            child: followMob,
            name: 'Found a mob',
            shouldTransition: () => targets.entity !== undefined,
            onTransition: () => bot.chat("Attack mob! " + targets.entity.displayName),
        }),

        new StateTransition({
            parent: getClosestMob,
            child: moveToArray,
            name: 'Return to patrol',
            shouldTransition: () => targets.entity === undefined,
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
            child: getClosestMob,
            name: 'Mob is dead',
            shouldTransition: () => targets.entity.isValid === false
        }),

        new StateTransition({
            parent: followMob,
            child: getClosestMob,
            name: 'Mob is dead',
            shouldTransition: () => targets.entity.isValid === false
        }),

    ];

    const guardJobFunction = new NestedStateMachine(transitions, enter, exit);
    guardJobFunction.stateName = 'guardJobFunction'
    return guardJobFunction;
}


module.exports = guardJobFunction;