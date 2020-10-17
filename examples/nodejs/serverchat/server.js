const express = require('express')
const app = express()
const server = require('http').Server(app)

const bodyParser = require('body-parser')
const socket = require('./socket')
const router = require('./network/routes')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/app', express.static('public'))
socket.connect(server)
router(app)

/*
const websocket = socket.socket;
setInterval(function () {
    websocket.io.emit('mensaje', 'Hola, a dasdasdas')
}, 3000);
*/

server.listen(4000, function () {
  console.log('Public /APP Iniciado')
})
