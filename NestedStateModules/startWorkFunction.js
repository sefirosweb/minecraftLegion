const {
    StateTransition,
    BehaviorIdle,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine,
    BehaviorGetClosestEntity,
    EntityFilters,

} = require("mineflayer-statemachine");
const BehaviorAttack = require("./../BehaviorModules/BehaviorAttack");

//const prismarineEntity = require('prismarine-entity')




function startWorkFunction(bot, targets) {

    function distanceFilter(entity) {
        return entity.position.distanceTo(this.bot.player.entity.position) <= 10 &&
            (entity.type === 'mob' || entity.type === 'player');
    }


    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const attack = new BehaviorAttack(bot, targets);

    const getClosestMob = new BehaviorGetClosestEntity(bot, targets, distanceFilter);

    const followMob = new BehaviorFollowEntity(bot, targets);

    const transitions = [
        new StateTransition({
            parent: enter,
            child: getClosestMob,
            name: 'enter -> getClosestEntity',
            shouldTransition: () => true,
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
            child: getClosestMob,
            name: 'Re search found a mob',
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

    const startWorkFunction = new NestedStateMachine(transitions, enter, exit);
    startWorkFunction.stateName = 'startWorkFunction'
    return startWorkFunction;
}


module.exports = startWorkFunction;