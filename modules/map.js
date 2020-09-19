const websocket = require('./web');
const mineflayer = require("mineflayer");
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);


function start(bot) {
    bot.loadPlugin(blockFinderPlugin);

    bot.on('spawn', () => {
        websocket.socket.io.emit('mensaje', "Bot spawned: " + bot.username);
    })


    bot.on('time', () => {

        bot.findBlock({
            point: bot.entity.position,
            matching: 1,
            maxDistance: 5,
            count: 1,
        }, function(err, blocks) {
            if (err) {
                bot.chat('Error trying to find Diamond Ore: ' + err);
                return;
            }

            console.log(blocks)
        });




        let draw = {
            x_from: 10,
            y_from: 10,
            x_to: 10,
            y_to: 10
        }

        websocket.socket.io.emit('drawline', draw);
    });
}

module.exports = start