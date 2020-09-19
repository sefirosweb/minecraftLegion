const express = require('express');
const app = express()
const server = require('http').Server(app)

const bodyParser = require('body-parser')
const socket = require('./socket');
const router = require('./network/routes')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/app', express.static('public'))
socket.connect(server);
router(app);

server.listen(4000, function () {
    console.log('Public /APP Iniciado')
});