const express = require('express');
const multer = require('multer')
const response = require('../../network/response')
const controller = require('./controller')
const router = express.Router();

const thisNetwork = "[file network]"

const upload = multer({
    dest: 'public/files/'
});

router.get('/', function (req, res) {
    const filter = req.query.user || null;
    controller.list(filter)
        .then((result) => {
            response.success(req, res, result)
        })
        .catch(e => {
            response.error(req, res, 'Error interno', 500, thisNetwork + ' Error desconocido => ' + e)
        });
})

router.get('/:id', function (req, res) {
    controller.get(req.params.id)
        .then((result) => {
            response.success(req, res, result)
        })
        .catch(e => {
            response.error(req, res, 'Error interno', 500, thisNetwork + ' Error desconocido => ' + e)
        });
})

router.post('/', upload.single('file'), function (req, res) {
    controller.add(req.body.user, req.file)
        .then((result) => {
            response.success(req, res, result)
        })
        .catch(e => {
            response.error(req, res, 'Informacion Invalida', 500, thisNetwork + ' No se ha insertado usuario o contraseña => ' + e)
        });
})

router.patch('/:id', function (req, res) {
    controller.update(req.body.user, req.body.message, req.params.id)
        .then(() => {
            response.success(req, res, `Usuario ${req.params.id} eliminado`)
        })
        .catch(e => {
            response.error(req, res, 'Informacion Invalida', 500, thisNetwork + ' No se ha insertado usuario o contraseña o id => ' + e)
        });
})

router.delete('/:id', function (req, res) {
    controller.delete(req.params.id)
        .then(() => {
            response.success(req, res, `Usuario ${req.params.id} eliminado`)
        })
        .catch(e => {
            response.error(req, res, 'Informacion Invalida', 500, thisNetwork + ' No se ha insertado id => ' + e)
        });
})


module.exports = router;