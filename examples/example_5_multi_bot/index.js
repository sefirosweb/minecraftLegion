const mineflayer = require('mineflayer');
const config = require('../../config')

let i = 0

function Guards() {
    if (i < 3) {
        i++;
        setTimeout(() => {
            createBot(`Guard${i}`)
            Guards()
        }, 500)
    } else {
        i = 0;
        Archers();
    }
}



function Archers() {
    if (i < 3) {
        i++;
        setTimeout(() => {
            createBot(`Archer${i}`)
            Archers()
        }, 500)
    }
}
Guards()

function createBot(name) {
    return new Promise((resolve, reject) => {
        let bot = mineflayer.createBot({
            host: config.server,
            port: config.port,
            username: name
        })

        bot.on('death', function() {
            bot.chat('Omg im dead');
        })

        resolve(name)
    }).then(username => {
        console.log("Bot loged", username)
    });
}