const {
    StateTransition,
    BehaviorIdle,
    BehaviorFollowEntity,
    NestedStateMachine,

} = require("mineflayer-statemachine");
const BehaviorAttack = require("./../BehaviorModules/BehaviorAttack");
const BehaviorLoadConfig = require("./../BehaviorModules/BehaviorLoadConfig");
const BehaviorMoveToArray = require("./../BehaviorModules/BehaviorMoveToArray");
const BehaviorGetClosestEnemy = require("./../BehaviorModules/BehaviorGetClosestEnemy");


const mineflayer_pathfinder = require("mineflayer-pathfinder");

function guardJobFunction(bot, targets) {
    const mcData = require('minecraft-data')(bot.version);
    const movementsForAttack = new mineflayer_pathfinder.Movements(bot, mcData);
    movementsForAttack.digCost = 100;

    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const attack = new BehaviorAttack(bot, targets);

    const loadConfig = new BehaviorLoadConfig(bot, targets);
    const moveToArray = new BehaviorMoveToArray(bot, targets);

    const getClosestMob = new BehaviorGetClosestEnemy(bot, targets);
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
            onTransition: () => {
                targets.entity = undefined;
                moveToArray.setPatrol(loadConfig.getPatrol(), true);
                getClosestMob.mode = loadConfig.getMode();
                getClosestMob.distance = loadConfig.getDistance();
            },
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: moveToArray,
            child: followMob,
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
            shouldTransition: () => moveToArray.getEndPatrol(),
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
            child: moveToArray,
            name: 'Mob is dead',
            onTransition: () => targets.entity = undefined,
            shouldTransition: () => targets.entity.isValid === false
        }),

        new StateTransition({
            parent: followMob,
            child: moveToArray,
            name: 'Mob is dead',
            onTransition: () => targets.entity = undefined,
            shouldTransition: () => targets.entity.isValid === false
        }),
    ];

    const guardJobFunction = new NestedStateMachine(transitions, enter, exit);
    guardJobFunction.stateName = 'guardJobFunction'
    return guardJobFunction;
}


module.exports = guardJobFunction;