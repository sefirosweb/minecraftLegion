const config = require('../config')
const io = require("socket.io-client")
let socket

function connect(botUsername) {
    socket = io(config.webServer + ':' + config.webServerPort);
    socket.on('connect', () => {
        console.log('Connected to webserver');
        socket.emit('addFriend', botUsername)
    });

    socket.on('disconnect', () => {
        console.log('Disconected from webserver');
    });
}

function emit(chanel, data) {
    socket.emit(chanel, data)
}

function log(data) {
    socket.emit('logs', data)
}

module.exports = {
    connect,
    emit,
    log
}
