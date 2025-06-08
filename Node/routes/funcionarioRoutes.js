const express = require('express');
const router = express.Router();
const funcionarioController = require('../controller/funcionarioController');
const upload = require('../middlewares/upload');

//Rota pra listar o Funcionários
router.get('/', funcionarioController.listar);

// Cadastra um novo funcionário com upload de duas imagens
router.post(
  '/',
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'foto_cpf', maxCount: 1 }
  ]),
  funcionarioController.criar
);

router.get('/:idFuncionario', funcionarioController.buscarFuncionario);

// Rota pra editar funcionário
router.put(
  '/editar/:id',
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'foto_cpf', maxCount: 1 }
  ]),
  funcionarioController.editarFuncionario
);


// Rota para excluir funcionário
router.delete('/:id', funcionarioController.excluirFuncionario);

// Rota pra demitir funcionário
router.put('/demitir/:id', funcionarioController.demitirFuncionario);


module.exports = router;

