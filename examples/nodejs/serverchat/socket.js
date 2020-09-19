const socketIO = require('socket.io');
const socket = {};

function connect(server) {
    socket.io = socketIO(server);


    socket.io.on('connection', function (socket) {
        console.log("Nuevo cliente conectado")
        socket.emit('mensaje', 'Bienvenido!');
    })


    setInterval(function () {
        socket.io.emit('mensaje', 'Hola, a todos')
    }, 3000);

}

module.exports = {
    connect,
    socket
}