require('dotenv').config()
const USERNAME = process.env.USER
const AUTOLOGIN = process.env.AUTOLOGIN
const SERVER = process.env.SERVER
const PORT = process.env.PORT

console.log("Bot: " + USERNAME + " Conecting to:" + SERVER)
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot({
    username: USERNAME,
    host: SERVER,
    port: PORT
})

bot.on('kicked', (reason, loggedIn) => {
    reasonDecoded = JSON.parse(reason)
    console.log(reasonDecoded)
})

bot.on('error', err => console.log(err))

bot.once("spawn", () => {
    bot.chat('/login ' + AUTOLOGIN)
    bot.chat('Im in!')
})

bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

const {
    globalSettings,
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    EntityFilters,
    BehaviorIdle,
    BehaviorPrintServerStats,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine,
    BehaviorMoveTo
} = require("mineflayer-statemachine");

bot.once("spawn", () => {
    const targets = {};

    const base = {};
    base.position = {}
    base.position.x = -3;
    base.position.y = 80;
    base.position.z = 0;
    const goBase = new BehaviorMoveTo(bot, base);

    // Movet o night timer
    const bed = bot.findBlock({
        matching: block => bot.isABed(block)
    })

    const checkIsNight = new checkNight(bot);
    const goToBed = new BehaviorMoveTo(bot, bed);
    const goSleep = new goBedAction(bot, bed);

    const printServerStates = new BehaviorPrintServerStats(bot);
    const idleState = new BehaviorIdle();
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);



    // Create our transitions
    const transitions = [

        new StateTransition({ // 0
            parent: printServerStates,
            child: goBase,
            name: '0 Starts',
            shouldTransition: () => true
        }),

        new StateTransition({ // 1
            parent: idleState,
            child: getClosestPlayer,
            name: '1 player says "hi"',
            onTransition: () => bot.chat("Hi master!")
        }),

        new StateTransition({ // 2
            parent: getClosestPlayer,
            child: lookAtPlayersState,
            name: '2 get close entity',
            shouldTransition: () => true,
        }),

        new StateTransition({ // 3
            parent: lookAtPlayersState,
            child: idleState,
            name: '3 player says "bye"',
            onTransition: () => bot.chat("Good bye master!")
        }),

        new StateTransition({ // 4
            parent: lookAtPlayersState,
            child: followPlayer,
            name: '5 player says "come"',
            onTransition: () => bot.chat("Yes sr!")
        }),

        new StateTransition({ // 5
            parent: followPlayer,
            child: lookAtPlayersState,
            name: '5 player says "stay"',
            onTransition: () => bot.chat("Yes sr!!")
        }),

        new StateTransition({ //  6
            parent: followPlayer,
            child: idleState,
            name: '6 player says "bye"',
            onTransition: () => bot.chat("GB sr!")
        }),

        new StateTransition({ // 7
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: '7 closeToTarget',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        new StateTransition({ // 8
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: '8 farFromTarget',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
        }),

        new StateTransition({ // 9
            parent: lookAtFollowTarget,
            child: idleState,
            name: '9 player says "bye"',
            onTransition: () => bot.chat("goodbye")
        }),

        new StateTransition({ // 10
            parent: lookAtFollowTarget,
            child: lookAtPlayersState,
            name: '10 player says "stay"',
        }),

        new StateTransition({ // 11
            parent: goBase,
            child: idleState,
            name: '11 Near base',
            shouldTransition: () => goBase.distanceToTarget() < 2,
            onTransition: () => {
                bot.chat("Im are on base!")
            },
        }),

        new StateTransition({ // 12
            parent: checkIsNight,
            child: goToBed,
            name: '12 Move To Bed when is night',
            shouldTransition: () => true,
        }),

        new StateTransition({ // 13
            parent: goToBed,
            child: goSleep,
            shouldTransition: () => goToBed.distanceToTarget() < 2,
            name: "13 Join into bed",
        }),

        new StateTransition({ // 15
            parent: goSleep,
            child: idleState,
            shouldTransition: () => {
                if (!checkIsNight.isNight() && goSleep.isInBed())
                    return true
            },
            name: "15 CLick to Sleep",
        }),

        new StateTransition({ // 16
            parent: idleState,
            child: checkIsNight,
            shouldTransition: () => checkIsNight.isNight(),
            name: "16 Check is night",
        }),

    ];

    const root = new NestedStateMachine(transitions, printServerStates);
    root.name = "main";

    bot.on('death', function () {
        bot.chat('Omg im dead');
    })


    bot.on("chat", (username, message) => {
        if (message === "hi " + bot.username) {
            transitions[1].trigger();   // parent: idleState,               child: getClosestPlayer,
        }

        if (message === "bye") {
            transitions[3].trigger();   // parent: lookAtPlayersState,      child: idleState,
            transitions[6].trigger();   // parent: followPlayer,            child: idleState,
            transitions[9].trigger();   // parent: lookAtFollowTarget,      child: idleState,
        }

        if (message === "come")
            transitions[4].trigger();   // parent: lookAtPlayersState,      child: followPlayer,

        if (message === "stay") {
            transitions[5].trigger();   // parent: followPlayer,            child: lookAtPlayersState,
            transitions[10].trigger();  // parent: lookAtFollowTarget,      child: lookAtPlayersState,
        }

    });

    bot.on('time', () => {
        checkIsNight.check()
    });

    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine);
    webserver.startServer();
});


const checkNight = (function () {
    function checkNight(bot) {
        this.bot = bot;
        this.active = false;
        this.stateName = 'checkIsNight';
        this.night = false;
    }
    checkNight.prototype.check = function () {
        let timeOfDay = this.bot.time.timeOfDay
        if ((timeOfDay >= 0 && timeOfDay <= 12040) || (timeOfDay >= 23961 && timeOfDay <= 24000)) {
            this.night = false;
        } else {
            this.night = true;
        }
    }
    checkNight.prototype.isNight = function () {
        return this.night;
    }
    return checkNight;
}());


const goBedAction = (function () {
    function goBedAction(bot, bed) {
        this.bot = bot;
        this.bed = bed;
        this.active = false;
        this.stateName = 'goBedAction';
        this.actionFinished = false;
    }
    goBedAction.prototype.onStateEntered = function () {
        setTimeout(() => {
            this.sleep();
        }, 2000);

    };
    goBedAction.prototype.sleep = function () {
        let canSleep = false;
        this.bot.sleep(this.bed, (err) => {
            if (err) {
                this.bot.chat(`I can't sleep: ${err.message}`)
                setTimeout(() => {
                    this.sleep();
                }, 2000);
            } else {
                this.actionFinished = true;
            }
        })
    }
    goBedAction.prototype.isInBed = function () {
        return this.actionFinished;
    }
    return goBedAction;
}());


