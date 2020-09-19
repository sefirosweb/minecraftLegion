const express = require('express');
const response = require('../../network/response')
const controller = require('./controller')
const router = express.Router();


router.get('/', function (req, res) {
    const filter = req.query.user || null;
    controller.getMessages(filter)
        .then((result) => {
            response.success(req, res, result)
        })
        .catch(e => {
            response.error(req, res, 'Error interno', 500, '[message network] Error desconocido')
        });
})

router.get('/:id', function (req, res) {
    controller.getMessage(req.params.id)
        .then((result) => {
            response.success(req, res, result)
        })
        .catch(e => {
            response.error(req, res, 'Error interno', 500, '[message network] Error desconocido')
        });
})

router.post('/', function (req, res) {
    controller.addMessage(req.body.user, req.body.message)
        .then((result) => {
            response.success(req, res, result)
        })
        .catch(e => {
            response.error(req, res, 'Informacion Invalida', 500, '[message network] No se ha insertado usuario o contraseña')
        });
})

router.patch('/:id', function (req, res) {
    controller.updateMessage(req.body.user, req.body.message, req.params.id)
        .then(() => {
            response.success(req, res, `Usuario ${req.params.id} eliminado`)
        })
        .catch(e => {
            response.error(req, res, 'Informacion Invalida', 500, '[message network] No se ha insertado usuario o contraseña o id')
        });
})

router.delete('/:id', function (req, res) {
    controller.deleteMessage(req.params.id)
        .then(() => {
            response.success(req, res, `Usuario ${req.params.id} eliminado`)
        })
        .catch(e => {
            response.error(req, res, 'Informacion Invalida', 500, '[message network] No se ha insertado id')
        });
})


module.exports = router;