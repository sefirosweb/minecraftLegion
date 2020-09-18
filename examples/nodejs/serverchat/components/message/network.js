const express = require('express');
const response = require('../../network/response')
const controller = require('./controller')
const router = express.Router();


router.get('/', function (req, res) {
    response.success(req, res, 'Lista de mensaje')
})

router.post('/', function (req, res) {
    controller.addMessage(req.body.user, req.body.message)
        .then((fullMessage) => {
            response.success(req, res, fullMessage)
        })
        .catch(e => {
            response.error(req, res, 'Informacion Invalida', 500, 'No se ha insertado usuario o contraseña')
        });
})

module.exports = router;