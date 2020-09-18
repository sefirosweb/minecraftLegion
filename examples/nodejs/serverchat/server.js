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
    response.error(req, res, 'Post')
})

/*
app.use('/', function (req, res) {
    res.send('Hola eq eq eq');
});
*/

app.listen(4000);
