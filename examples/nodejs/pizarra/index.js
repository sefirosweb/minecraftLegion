const express = require('express');
const app = express();
const server = require('http').Server(app)
const socket = require('./socket');

app.use('/', express.static('public'))
socket.connect(server);

server.listen(4000, function() {
    console.log('Public /APP Iniciado')
});