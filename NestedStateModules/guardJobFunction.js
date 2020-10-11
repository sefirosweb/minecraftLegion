const {
    StateTransition,
    BehaviorIdle,
    BehaviorFollowEntity,
    NestedStateMachine,
    BehaviorFindBlock,
    BehaviorFindInteractPosition,

} = require("mineflayer-statemachine");
const BehaviorAttack = require("./../BehaviorModules/BehaviorAttack");
const BehaviorLoadConfig = require("./../BehaviorModules/BehaviorLoadConfig");
const BehaviorMoveToArray = require("./../BehaviorModules/BehaviorMoveToArray");
const BehaviorGetClosestEnemy = require("./../BehaviorModules/BehaviorGetClosestEnemy");
const BehaviorGetReadyForPatrol = require("./../BehaviorModules/BehaviorGetReadyForPatrol");
const BehaviorGetItemsAndEquip = require("./../BehaviorModules/BehaviorGetItemsAndEquip");



const mineflayer_pathfinder = require("mineflayer-pathfinder");

function guardJobFunction(bot, targets) {
    const mcData = require('minecraft-data')(bot.version);
    const movementsForAttack = new mineflayer_pathfinder.Movements(bot, mcData);
    movementsForAttack.digCost = 100;

    const enter = new BehaviorIdle(targets);
    enter.stateName = 'enter';
    const exit = new BehaviorIdle(targets);
    exit.stateName = 'exit';

    const attack = new BehaviorAttack(bot, targets);
    attack.stateName = 'Attack';

    const loadConfig = new BehaviorLoadConfig(bot, targets);
    const patrol = new BehaviorMoveToArray(bot, targets);
    patrol.stateName = 'Patrol';

    const getClosestMob = new BehaviorGetClosestEnemy(bot, targets);
    const followMob = new BehaviorFollowEntity(bot, targets);
    followMob.stateName = 'Follow Enemy';

    const getReadyForPatrol = new BehaviorGetReadyForPatrol(bot, targets);
    getReadyForPatrol.stateName = 'Get Ready for Patrol';

    const goChest = new BehaviorMoveToArray(bot, targets);
    goChest.stateName = 'Go Chest';

    const getItemsAndEquip = new BehaviorGetItemsAndEquip(bot, targets);
    getItemsAndEquip.stateName = 'Get items and equip';

    const transitions = [
        new StateTransition({
            parent: enter,
            child: loadConfig,
            name: 'enter -> loadConfig',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: loadConfig,
            child: getReadyForPatrol,
            name: 'loadConfig -> patrol',
            onTransition: () => {
                targets.entity = undefined;
                patrol.setPatrol(loadConfig.getPatrol(), true);
                goChest.setPatrol(loadConfig.getChest(), true);
                getClosestMob.mode = loadConfig.getMode();
                getClosestMob.distance = loadConfig.getDistance();
            },
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: patrol,
            child: followMob,
            name: 'patrol -> try getClosestMob',
            shouldTransition: () => {
                getClosestMob.onStateEntered();
                return targets.entity !== undefined;
            }
        }),

        new StateTransition({
            parent: patrol,
            child: getReadyForPatrol,
            name: 'patrol -> getReadyForPatrol',
            shouldTransition: () => patrol.getEndPatrol(),
        }),


        new StateTransition({
            parent: getReadyForPatrol,
            child: patrol,
            name: 'getReadyForPatrol -> patrol',
            shouldTransition: () => getReadyForPatrol.getReady(),
        }),

        new StateTransition({
            parent: getReadyForPatrol,
            child: goChest,
            name: 'getReadyForPatrol -> goChest',
            shouldTransition: () => !getReadyForPatrol.getReady(),
        }),

        new StateTransition({
            parent: goChest,
            child: getItemsAndEquip,
            name: 'getReadyForPatrol -> goChest',
            shouldTransition: () => goChest.getEndPatrol(),
        }),

        new StateTransition({
            parent: getItemsAndEquip,
            child: getReadyForPatrol,
            name: 'getItemsAndEquip -> getReadyForPatrol',
            shouldTransition: () => getItemsAndEquip.getIsFinished(),
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
            child: patrol,
            name: 'Mob is dead',
            onTransition: () => targets.entity = undefined,
            shouldTransition: () => targets.entity.isValid === false
        }),

        new StateTransition({
            parent: followMob,
            child: patrol,
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