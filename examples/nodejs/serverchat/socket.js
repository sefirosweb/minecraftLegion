const socketIO = require('socket.io');
const socket = {};

function connect(server) {
    socket.io = socketIO(server);
    socket.io.on('connection', function (socket) {
        console.log("Nuevo cliente conectado")
        socket.emit('mensaje', 'Bienvenido!');
    })
}

module.exports = {
    connect,
    socket
}