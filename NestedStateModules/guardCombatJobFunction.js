const {
    StateTransition,
    BehaviorIdle,
    NestedStateMachine,
    BehaviorFollowEntity,
} = require("mineflayer-statemachine");
const BehaviorAttack = require("./../BehaviorModules/BehaviorAttack");
const BehaviorLongAttack = require("./../BehaviorModules/BehaviorLongAttack");

function guardCombatJobFunction(bot, targets) {
    inventory = require('../modules/inventoryModule')(bot);
    const hawkEye = require("minecrafthawkeye");
    bot.loadPlugin(hawkEye);


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


    let targetGrade = false;
    let prevPlayerPositions = [];
    let bowColdown = Date.now();; // Used for avoid bugs on jam between bow and sword 
    let newTargetColdDown = Date.now();

    const filter = e => e.type === 'mob' &&
        e.position.distanceTo(bot.entity.position) < 5 &&
        e.mobType !== 'Armor Stand'

    function getGrades() {
        // Of other enemies aproax, change target (Ex clipper)
        if (Date.now() - newTargetColdDown > 1000) {
            const entity = bot.nearestEntity(filter);
            if (entity) {
                targets.entity = entity;
                newTargetColdDown = Date.now();
            }
        }

        if (Date.now() - bowColdown < 1500) {
            longRangeAttack.setInfoShot(false);
            return false;
        }

        if (!targets.entity) {
            longRangeAttack.setInfoShot(false);
            return false;
        }
        if (prevPlayerPositions.length > 10) {
            prevPlayerPositions.shift();
        }
        const position = {
            x: targets.entity.position.x,
            y: targets.entity.position.y,
            z: targets.entity.position.z
        }
        prevPlayerPositions.push(position);

        let speed = {
            x: 0,
            y: 0,
            z: 0
        };

        for (let i = 1; i < prevPlayerPositions.length; i++) {
            const pos = prevPlayerPositions[i];
            const prevPos = prevPlayerPositions[i - 1];
            speed.x += pos.x - prevPos.x;
            speed.y += pos.y - prevPos.y;
            speed.z += pos.z - prevPos.z;
        }

        speed.x = speed.x / prevPlayerPositions.length;
        speed.y = speed.y / prevPlayerPositions.length;
        speed.z = speed.z / prevPlayerPositions.length;

        targetGrade = bot.hawkEye.getMasterGrade(targets.entity, speed);
        longRangeAttack.setInfoShot(targetGrade);
    }

    function startGrades() {
        bot.on('physicTick', getGrades);
    }

    function stopGrades() {
        bot.removeListener('physicTick', getGrades);
    }

    checkHandleSword = function() {
        const swordHandled = inventory.checkItemEquiped('sword');

        if (swordHandled)
            return;

        const itemEquip = bot.inventory.items().find(item => item.name.includes('sword'));
        if (itemEquip) {
            bot.equip(itemEquip, 'hand');
        }
    }

    const transitions = [
        new StateTransition({
            parent: enter,
            child: attack,
            onTransition: () => {
                startGrades();
            },
            name: 'enter -> followMob',
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: attack,
            child: followMob,
            name: 'Mob is too far',
            onTransition: () => {
                checkHandleSword();
            },
            shouldTransition: () => followMob.distanceToTarget() > range_sword && followMob.distanceToTarget() < range_followToShortAttack && targets.entity.isValid,
        }),

        // Long Range Attack 
        new StateTransition({
            parent: attack,
            child: longRangeAttack,
            name: 'Mob is too far',
            shouldTransition: () => followMob.distanceToTarget() > range_followToShortAttack && targetGrade !== false && targets.entity.isValid,
        }),

        new StateTransition({
            parent: followMob,
            child: longRangeAttack,
            name: 'Mob is on range for Long Range Attack',
            shouldTransition: () => followMob.distanceToTarget() < rango_bow && followMob.distanceToTarget() > range_followToShortAttack && targetGrade !== false && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: followMob,
            onTransition: () => {
                checkHandleSword();
                bowColdown = Date.now();
            },
            name: 'Mob is near for short attack',
            shouldTransition: () => followMob.distanceToTarget() < range_followToShortAttack && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: followMob,
            onTransition: () => {
                checkHandleSword();
                bowColdown = Date.now();
            },
            name: 'Mob is VERY too far',
            shouldTransition: () => followMob.distanceToTarget() > rango_bow && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: followMob,
            onTransition: () => {
                checkHandleSword();
                bowColdown = Date.now();
            },
            name: 'Cant target to Mob',
            shouldTransition: () => targetGrade === false && targets.entity.isValid,
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: longRangeAttack,
            name: 'Mob is on range for Long Range Attack',
            shouldTransition: () => followMob.distanceToTarget() < rango_bow && followMob.distanceToTarget() > range_followToShortAttack && targets.entity.isValid,
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
            onTransition: () => {
                targets.entity = undefined;
                stopGrades();
                checkHandleSword();
            },
            shouldTransition: () => targets.entity.isValid === false
        }),

        new StateTransition({
            parent: longRangeAttack,
            child: exit,
            name: 'Mob is dead',
            onTransition: () => {
                targets.entity = undefined;
                stopGrades();
                checkHandleSword();
            },
            shouldTransition: () => targets.entity.isValid === false
        }),

        new StateTransition({
            parent: followMob,
            child: exit,
            name: 'Mob is dead',
            onTransition: () => {
                targets.entity = undefined;
                stopGrades();
                checkHandleSword();
            },
            shouldTransition: () => targets.entity.isValid === false
        }),
        // END ************* Long Range Attack 
    ];

    const guardCombatJobFunction = new NestedStateMachine(transitions, enter, exit);
    guardCombatJobFunction.stateName = 'Guard Combat'
    return guardCombatJobFunction;
}

module.exports = guardCombatJobFunction;