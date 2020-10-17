const config = require('../config')
const SocketIO = require('socket.io')

const io = require("socket.io-client")
const ioClient = io.connect(config.webServer + ':' + config.webServerPort)

function emit(chanel, data) {
    ioClient.emit(chanel, data)
}

function log(data) {
    ioClient.emit('logs', data)
}


module.exports = {
    emit,
    log
}