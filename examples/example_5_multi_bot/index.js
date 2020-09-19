const mineflayer = require('mineflayer')
const config = require('../../config')


let i = 0

function next() {
    if (i < 7) {
        i++;
        setTimeout(() => {
            console.log(`Guard${i}`);
            createBot(`Guard${i}`)
            next()
        }, 1000)
    }
}
next()

function createBot(name) {
    mineflayer.createBot({
        host: config.server,
        port: config.port,
        username: name
    })
}