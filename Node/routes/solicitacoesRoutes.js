const express = require('express');
const router = express.Router();
const solicitacoesController = require('../controller/solicitacoesController');

// Rota que trata a finalização de uma solicitação pelo ID
router.put('/finalizar/:id', solicitacoesController.registrarFinalizacao);

module.exports = router;
