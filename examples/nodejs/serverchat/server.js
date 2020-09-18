const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();

const response = require('./response_server')

var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

router.get('/message', function (req, res) {
    response.success(req, res, 'Lista de mensaje')
})

router.post('/message', function (req, res) {
    response.error(req, res, 'Post', 500, 'Simulacion de logs')
})


app.use('/app', express.static('public'))


app.listen(4000);
