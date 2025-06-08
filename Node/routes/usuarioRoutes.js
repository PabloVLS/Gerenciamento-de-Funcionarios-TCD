const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');

router.post('/', usuarioController.criar);

router.get('/', usuarioController.listar);

router.delete('/:id', usuarioController.excluir);


module.exports = router;
