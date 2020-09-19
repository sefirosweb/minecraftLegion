const socketIO = require('socket.io');
const socket = {};

function connect(server) {
    socket.io = socketIO(server);
    socket.io.on('connection', socket => {
        console.log("Nuevo cliente conectado")
        socket.emit('mensaje', 'Bienvenido!');
        socket.on('drawline', data => {
            socket.emit('drawline', data);
            // socket.broadcast.emit('drawline', data);
        });
    });
}

module.exports = {
    connect,
    socket
}