const { webServer, webServerPort } = require('../config')
const io = require("socket.io-client")
let socket

function connect(botUsername) {
    socket = io(webServer + ':' + webServerPort);
    socket.on('connect', () => {
        console.log('Connected to webserver');
        socket.emit('addFriend', botUsername)
    })

    socket.on('disconnect', () => {
        console.log('Disconected from webserver');
    })

    socket.on('botDisconnect', (socketId) => {
        if (socketId === socket.id) {
            process.exit(1);
        }
    })
}

function emit(chanel, data) {
    socket.emit(chanel, data)
}

function emitHealth(health) {
    const data = {
        type: 'health',
        value: health
    }
    emit('botStatus', data)
}

function emitFood(health) {
    const data = {
        type: 'food',
        value: health
    }
    emit('botStatus', data)
}

function log(data) {
    socket.emit('logs', data)
}

module.exports = {
    connect,
    emit,
    log,
    emitHealth,
    emitFood
}
