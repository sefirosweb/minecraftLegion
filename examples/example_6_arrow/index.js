const mineflayer = require('mineflayer')
const Vec3 = require('vec3').Vec3
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear } = require('mineflayer-pathfinder').goals
const ObjectsToCsv = require('objects-to-csv')

// Need 2 bots first one is too far away for get entitys can check
const bot = mineflayer.createBot({
    username: 'Guard1',
    port: 54758
})
bot.loadPlugin(pathfinder)
const botChecker = mineflayer.createBot({
    username: 'Guard2',
    port: 54758
})
botChecker.loadPlugin(pathfinder)

/* Notes 
Please give to bot a bow:
/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1
/give Archer minecraft:arrow 6000
*/

// Go to Start Point (center of map)
botChecker.once("spawn", () => {
    botChecker.chat('/kill @e[type=minecraft:arrow]'); // clear arrows
    const mcData = require('minecraft-data')(botChecker.version)
    const defaultMove = new Movements(botChecker, mcData)
    botChecker.pathfinder.setMovements(defaultMove)
    botChecker.pathfinder.setGoal(new GoalNear(10, 4, 60, 1)); // Go to Start point
});

// Go to Start Point
bot.once("spawn", () => {
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(0, 3, 0, 1)); // Go to Start point
});

let grades = 500;
let reportedArrow = false;
let arrowSave = {};

// This bot Fires arrow
bot.on('goal_reached', () => {
    bot.chat('Rdy!');
    let chargeBowTimer = Date.now();
    let = bowIsCharged = false;
    bot.deactivateItem();

    bot.on('physicTick', function() {
        // bot.lookAt(headTo); <-- don't use this no have enough accuracy
        // Look by Yaw & Pitch /* Pitch == Radians */ 
        // 3.1385715147451663 => default look to Z
        bot.look(degrees_to_radians(180), degrees_to_radians(grades / 10));

        const currentTime = Date.now();

        if (bowIsCharged === false) {
            chargeBowTimer = Date.now();
            bot.activateItem();
            bowIsCharged = true;
        }
        // Fire arrow every x sec
        if (currentTime - chargeBowTimer > 1000 && reportedArrow || currentTime - chargeBowTimer > 8000) {
            reportedArrow = false;
            bot.deactivateItem();
            arrowSave.time = Date.now();
            bowIsCharged = false;
            grades++;
            if (grades > 900) {
                grades = 0;
            }
        }
    });
});

// This bot register the arrows
botChecker.on('goal_reached', () => {
    botChecker.chat('Rdy!');

    let currentArrows = [];
    let currentArrow = null;
    let lastPositionArrow = {};
    let counPosition = 0;
    let timeToImpact = 0;


    botChecker.on('physicTick', function() {
        let allArrows = getAllArrows(botChecker);
        allArrows.forEach(arrow => {
            if (!currentArrows.includes(arrow.id)) {
                currentArrows.push(arrow.id);
                currentArrow = arrow;

                arrowSave.x = currentArrow.position.x;
                arrowSave.y = currentArrow.position.y;
                arrowSave.z = currentArrow.position.z;

                lastPositionArrow.x = currentArrow.position.x;
                lastPositionArrow.y = currentArrow.position.y;
                lastPositionArrow.z = currentArrow.position.z;

                reportedArrow = false;
                return true;
            }
        });


        if (currentArrow !== null) {
            //console.log("lastPositionArrow", lastPositionArrow.x, currentArrow.position.x);
            if (
                lastPositionArrow.x == currentArrow.position.x &&
                lastPositionArrow.y == currentArrow.position.y &&
                lastPositionArrow.z == currentArrow.position.z
            ) {
                if (counPosition >= 20 && !reportedArrow) {
                    const data = {
                        id: currentArrow.id,
                        grade: grades - 1,
                        x_origin: arrowSave.x,
                        y_origin: arrowSave.y,
                        z_origin: arrowSave.z,
                        x_destination: currentArrow.position.x,
                        y_destination: currentArrow.position.y,
                        z_destination: currentArrow.position.z,
                        timeToImpact: timeToImpact
                    };
                    let dataArray = [];
                    dataArray.push(data);
                    console.log("Arrow Impacted! ", data.id, "Grade:", data.grade / 10, "Time to impact", data.timeToImpact);
                    const csv = new ObjectsToCsv(dataArray)
                    csv.toDisk('./bigData.csv', { append: true })
                    counPosition = 0;
                    reportedArrow = true;
                }
                if (counPosition === 0) {
                    timeToImpact = Date.now() - arrowSave.time;
                }
                counPosition++;
            } else {
                counPosition = 0;
            }
            lastPositionArrow.x = currentArrow.position.x;
            lastPositionArrow.y = currentArrow.position.y;
            lastPositionArrow.z = currentArrow.position.z;
        }


    });
})


function getAllArrows(bot) {
    let arrows = [];
    for (const entity of Object.values(bot.entities)) {
        if (entity.type === 'object' && entity.objectType === 'Arrow') {
            arrows.push(entity);
        }
    }
    return arrows;
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}