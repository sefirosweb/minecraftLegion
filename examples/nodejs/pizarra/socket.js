const socketIO = require('socket.io')
const socket = {}

function connect (server) {
  const line_history = []

  socket.io = socketIO(server)
  socket.io.on('connection', socket => {
    console.log('Nuevo cliente conectado')
    socket.emit('mensaje', 'Bienvenido!')

    for (const i in line_history) {
      socket.emit('drawline', line_history[i])
    }

    socket.on('drawline', data => {
      line_history.push(data)
      socket.emit('drawline', data)
      socket.broadcast.emit('drawline', data)
    })
  })
}

module.exports = {
  connect,
  socket
}
