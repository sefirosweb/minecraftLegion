const {
    StateTransition,
    BehaviorIdle,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine
} = require("mineflayer-statemachine");

function commandsFunction(bot, targets) {
    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);

    const transitions = [
        new StateTransition({ // 0
            parent: lookAtPlayersState,
            child: exit,
            name: 'Player say: bye',
            onTransition: () => bot.chat("Bye Master!"),
        }),
        new StateTransition({ // 1
            parent: followPlayer,
            child: exit,
            name: 'Player say: bye',
            onTransition: () => bot.chat("Bye Master!"),
        }),
        new StateTransition({ // 2
            parent: lookAtFollowTarget,
            child: exit,
            name: 'Player say: bye',
            onTransition: () => bot.chat("Bye Master!"),
        }),

        new StateTransition({ // 3
            parent: lookAtPlayersState,
            child: followPlayer,
            name: 'Player say: come',
            onTransition: () => bot.chat("Yes sr!"),
        }),

        new StateTransition({ // 4
            parent: lookAtFollowTarget,
            child: lookAtPlayersState,
            name: 'Player say: stay',
            onTransition: () => bot.chat("I wait here!"),
        }),
        new StateTransition({ // 5
            parent: followPlayer,
            child: lookAtPlayersState,
            name: 'Player say: stay',
            onTransition: () => bot.chat("I wait here!"),
        }),


        new StateTransition({
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: 'The player is too far',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),
        new StateTransition({
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: 'The player is too close',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
        }),
        new StateTransition({
            parent: enter,
            child: lookAtPlayersState,
            name: 'Enter to nested',
            onTransition: () => bot.on("chat", botChatCommandFunctionListener),
            shouldTransition: () => true,
        }),
    ];

    botChatCommandFunctionListener = function(username, message) {
        switch (true) {
            case (message === "bye"):
                bot.removeListener('chat', botChatCommandFunctionListener);
                transitions[0].trigger();
                transitions[1].trigger();
                transitions[2].trigger();
                break;
            case (message === "come"):
                transitions[3].trigger();
                break;
            case (message === "stay"):
                transitions[4].trigger();
                transitions[5].trigger();
                break;
            default:
                if (message.match(/set job.*/)) {
                    var msg = message.split(" ");
                    saveJob(msg[2]);
                }

                if (message.match(/set mode.*/)) {
                    var msg = message.split(" ");
                    saveMode(msg[2]);
                }

                if (message.match(/set distance.*/)) {
                    var msg = message.split(" ");
                    saveDistance(msg[2]);
                }

                if (message.match(/set start patrol.*/)) {
                    var msg = message.split(" ");
                    startPatrol(msg[3]);
                }

                if (message.match(/set end patrol.*/)) {
                    savePatrol();
                }
        }
    }

    function saveJob(job) {
        switch (true) {
            case (job === "guard"):
            case (job === "archer"):
            case (job === "farmer"):
                bot.chat("I will fulfill this job");
                const botConfig = require('../modules/botConfig');
                botConfig.setJob(bot.username, job);
                break;
            default:
                bot.chat("Master, I don't know how to do this job");
                break;
        }
    }

    function saveMode(mode) {
        switch (true) {
            case (mode === "none"):
            case (mode === "pvp"):
            case (mode === "pve"):
                bot.chat("I understood the conflict");
                const botConfig = require('../modules/botConfig');
                botConfig.setMode(bot.username, mode);
                break;
            default:
                bot.chat("Master, I don't know what you means mode");
                break;
        }
    }

    function saveDistance(distance) {
        distance = parseInt(distance);
        if (!isNaN(distance)) {
            bot.chat("I take a look!");
            const botConfig = require('../modules/botConfig');
            botConfig.setDistance(bot.username, distance);
        } else {
            bot.chat("I dont understood the distance");
        }
    }

    let patrol = [];
    let prevPos;
    let distancePatrol;

    function startPatrol(distance) {
        distance = parseInt(distance);
        if (isNaN(distance)) {
            bot.chat("I dont understood the distance for patrol");
            return false;
        }
        bot.chat("Ok, tell me what is the patrol");

        distancePatrol = distance;

        const pos = bot.entity.position;
        patrol = [];
        patrol.push(pos);
        prevPos = pos;

        bot.on('move', patrolNextPointListener);
    }

    function savePatrol() {
        bot.removeListener('move', patrolNextPointListener);
        const botConfig = require('../modules/botConfig');
        botConfig.setPatrol(bot.username, patrol);
        bot.chat("Ok, I memorized the patrol");
    }

    function patrolNextPointListener(pos) {
        if (pos.distanceTo(prevPos) > distancePatrol) {
            patrol.push(pos);
            prevPos = pos;
        }
    }

    const commandsFunction = new NestedStateMachine(transitions, enter, exit);
    commandsFunction.stateName = 'commandsFunction'
    return commandsFunction;
}


module.exports = commandsFunction;