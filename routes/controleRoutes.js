const express = require('express');
const router = express.Router();
const controleController = require('../controller/controleController');

router.post('/', controleController.registrarFinalizacao);

router.get('/', controleController.listarControle);

module.exports=router;