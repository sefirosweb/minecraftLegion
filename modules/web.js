const express = require('express');
const app = express();
const server = require('http').Server(app)
const websocket = require('./websocket');

app.use('/', express.static('public'))

websocket.connect(server);

server.listen(4000, function() {
    console.log('Public /APP Iniciado')
});


module.exports = websocket