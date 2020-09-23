const mineflayer = require('mineflayer')
const Vec3 = require('vec3').Vec3
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear } = require('mineflayer-pathfinder').goals
const ObjectsToCsv = require('objects-to-csv')

const bot = mineflayer.createBot({
    username: 'Guard1',
    port: 50278
})
bot.loadPlugin(pathfinder)

/* Notes 
Please give to bot a bow:
/give Guard1 bow{Enchantments:[{id:unbreaking,lvl:100}]} 1

And arrows
/give Guard1 minecraft:arrow 6000
*/


// 1º Go to Start Point
bot.once("spawn", () => {
    bot.chat('/kill @e[type=minecraft:arrow]'); // clear arrows
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(0, 3, 0, 1)); // Go to Start point
});

// 2º Start firing
bot.on('goal_reached', () => {
    bot.chat('Rdy!');
    const x = 0
    const z = 100;
    let y = 5

    let chargeBowTimer = Date.now();
    let = bowIsCharged = false;

    let lastY = false;

    let grades = 0;
    let currentArrows = [];
    let currentArrow = null;
    let arrowSave = {};
    let lastPositionArrow = {};
    let counPosition = 0;
    let reportedArrow = false;

    bot.deactivateItem();

    bot.on('physicTick', function() {
        const currentTime = Date.now();

        // Look by loords
        // const headTo = new Vec3(x, y, z)
        // bot.lookAt(headTo); <-- don't use this no have enough accuracy

        // Look by Yaw & Pitch /* Pitch == Radians */ 
        // 3.1385715147451663 => default look to Z
        bot.look(degrees_to_radians(180), degrees_to_radians(grades));

        if (y !== lastY) {
            // console.log(y, radians_to_degrees(bot.entity.pitch));
            lastY = y;

        }

        if (bowIsCharged === false) {
            chargeBowTimer = Date.now();
            bot.activateItem();
            bowIsCharged = true;
        }

        // Fire arrow every 1 sec
        if (currentTime - chargeBowTimer > 8000) {
            bot.deactivateItem();
            bowIsCharged = false;
            y++;
            grades++;
            if (grades >= 90) {
                grades = 0;
            }

        }

        let allArrows = getAllArrows(bot);
        allArrows.forEach(arrow => {
            if (!currentArrows.includes(arrow.id)) {
                currentArrows.push(arrow.id);
                currentArrow = arrow;

                arrowSave.x = currentArrow.position.x;
                arrowSave.y = currentArrow.position.y;
                arrowSave.z = currentArrow.position.z;
                arrowSave.time = Date.now();

                lastPositionArrow.x = currentArrow.position.x;
                lastPositionArrow.y = currentArrow.position.y;
                lastPositionArrow.z = currentArrow.position.z;

                counPosition = 0; // Verify X times the position

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
                if (counPosition >= 5) {
                    let timeToImpact = Date.now();
                    timeToImpact -= arrowSave.time;

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

                    if (reportedArrow == false) {
                        console.log("Arrow Impacted! ", data);
                        const csv = new ObjectsToCsv(data)
                        csv.toDisk('./list.csv', { append: true })

                        reportedArrow = true;
                    }



                }
                counPosition++;
            } else {
                counPosition = 0;
                if (reportedArrow == true) {
                    console.log("ERROR Arrow ERROR! ", currentArrow.id);
                }
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