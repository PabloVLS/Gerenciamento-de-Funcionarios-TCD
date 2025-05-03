const express = require('express');
const router = express.Router();
const funcionarioController = require('../controller/funcionarioController');


router.get('/', funcionarioController.listar);

// Cadastra um novo funcionário
router.post('/', funcionarioController.criar);


module.exports = router;
