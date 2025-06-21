const express = require('express');
const router = express.Router();
const solicitacoesController = require('../controller/solicitacoesController');

router.put('/:id/aprovar-gerente', solicitacoesController.aprovarGerente);

router.put('/:id/aprovar-financeiro', solicitacoesController.aprovarFinanceiro);

router.put('/:id/recusar-financeiro', solicitacoesController.recusarFinanceiro);/*mudei aqui */

router.post('/', solicitacoesController.criarSolicitacao);

router.put('/itens/:id', solicitacoesController.preencherItem);

router.put('/:id/finalizar', solicitacoesController.finalizarSolicitacao);

router.get('/', solicitacoesController.listarSolicitacoes);

router.get('/:id/itens', solicitacoesController.obterItensDaSolicitacao);

router.get('/pendentes', solicitacoesController.listarSolicitacoesPendentes);

router.patch('/:id/encerrar', solicitacoesController.encerrarSolicitacao);

module.exports = router;
