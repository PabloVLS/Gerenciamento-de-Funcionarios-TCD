const express = require('express');
const router = express.Router();
const controleController = require('../controller/equipamentosController');

//router.post('/', controleController.registrarFinalizacao);

router.get('/:idFuncionario', controleController.listarControleEquipamentos);

//acho q vou excluir isso e o demitir , depois analizar
//router.put('/demitir/:id', controleController.demitir);

module.exports=router;