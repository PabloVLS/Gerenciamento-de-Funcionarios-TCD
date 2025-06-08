// routes/solicitacoes.js
const express = require('express');
const pool = require('../db'); // conexão com PostgreSQL

// Criar nova solicitação
exports.criarSolicitacao = async (req, res) => {
  const { funcionario_id, tipo, observacoes, equipamentos, criado_por } = req.body;
  console.log('Dados recebidos do criarSolicitação:', { funcionario_id, tipo, observacoes, equipamentos, criado_por });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO solicitacoes (funcionario_id, tipo, observacoes, status, criada_por_id)
       VALUES ($1, $2, $3, 'pendente', $4)
       RETURNING id`,
      [funcionario_id, tipo, observacoes, criado_por]
    );

    const solicitacaoId = result.rows[0].id;

    for (const tipoItem of equipamentos) {
      await client.query(
        `INSERT INTO itens_solicitados (solicitacao_id, tipo)
         VALUES ($1, $2)`,
        [solicitacaoId, tipoItem]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Solicitação criada com sucesso', solicitacaoId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar solicitação' });
  } finally {
    client.release();
  }
};





// Preencher dados do item solicitado
exports.preencherItem = async (req, res) => {
  const itemId = req.params.id;
  console.log('>>> ENTROU no preencherItem para ID:', itemId);
  console.log('>>> Headers:', req.headers);
  const { tipo, preenchido_por, ...dados } = req.body;
  console.log('Item recebido:', req.params.id);
  console.log('Payload recebido:', req.body);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Inserir na tabela correspondente com base no tipo
    if (tipo === 'celular') {
      const { modelo_celular, valor_celular, imei, numero, operadora } = dados;
      await client.query(
        `INSERT INTO celulares (item_solicitado_id, modelo, imei, numero, operadora, preco)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [itemId, modelo_celular, imei, numero, operadora, valor_celular]
      );
      console.log(`Dados inseridos na tabela ${tipo} para o item ${itemId}`);
    } else if (tipo === 'chip') {
      const { numero_chip, operadora_chip, plano } = dados;
      await client.query(
        `INSERT INTO chips (item_solicitado_id, numero, operadora, plano)
         VALUES ($1, $2, $3, $4)`,
        [itemId, numero_chip, operadora_chip, plano]
      );
      console.log(`Dados inseridos na tabela ${tipo} para o item ${itemId}`);
    } else if (tipo === 'notebook') {
      const { modelo_notebook, valor_notebook, numero_patrimonio, sistema_operacional } = dados;
      await client.query(
        `INSERT INTO notebooks (item_solicitado_id, modelo, numero_patrimonio, sistema_operacional, preco)
         VALUES ($1, $2, $3, $4, $5)`,
        [itemId, modelo_notebook, numero_patrimonio, sistema_operacional, valor_notebook]
      );
      console.log(`Dados inseridos na tabela ${tipo} para o item ${itemId}`);
    } else {
      throw new Error('Tipo inválido');
    }

    // Atualizar status do item
    await client.query(
      `UPDATE itens_solicitados
       SET status = 'preenchido', preenchido_por = $1, data_preenchimento = NOW()
       WHERE id = $2`,
      [preenchido_por, itemId]
    );

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Item preenchido com sucesso' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ erro: 'Erro ao preencher item' });
  } finally {
    client.release();
  }
};



exports.finalizarSolicitacao = async (req, res) => {
  const id = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(`
      SELECT COUNT(*) AS pendentes
      FROM itens_solicitados
      WHERE solicitacao_id = $1 AND status != 'preenchido'
    `, [id]);

    const pendentes = parseInt(result.rows[0].pendentes);

    if (pendentes > 0) {
      return res.status(400).json({ erro: 'Ainda existem itens não preenchidos' });
    }

    await client.query(`
      UPDATE solicitacoes
      SET status = 'finalizada'
      WHERE id = $1
    `, [id]);

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Solicitação finalizada com sucesso' });

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao finalizar a solicitação' });
  } finally {
    client.release();
  }
};



exports.listarSolicitacoes = async (req, res) => {
  const client = await pool.connect();

  try {
    const resultado = await client.query(`
      SELECT 
        s.id AS solicitacao_id,
        s.tipo,
        s.status,
        s.observacoes,
        s.data_criacao,
        f.nome AS nome_funcionario,
        json_agg(
          json_build_object(
            'id', i.id,
            'tipo', i.tipo,
            'status', i.status
          )
        ) AS itens
      FROM solicitacoes s
      JOIN funcionarios f ON s.funcionario_id = f.id
      LEFT JOIN itens_solicitados i ON i.solicitacao_id = s.id
      GROUP BY s.id, f.nome
      ORDER BY s.data_criacao DESC
    `);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar solicitações' });
  } finally {
    client.release();
  }
};

exports.obterItensDaSolicitacao = async (req, res) => {
  const solicitacaoId = req.params.id;
  const client = await pool.connect();

  try {
    const resultado = await client.query(
      `SELECT id, tipo, status FROM itens_solicitados WHERE solicitacao_id = $1`,
      [solicitacaoId]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao buscar itens da solicitação:', error);
    res.status(500).json({ erro: 'Erro ao buscar itens da solicitação' });
  } finally {
    client.release();
  }
};



// exports.buscarItem = async (req, res) => {
//   const itemId = req.params.id;
//   const client = await pool.connect();

//   try {
//     const resultadoItem = await client.query(
//       `SELECT tipo, status FROM itens_solicitados WHERE id = $1`,
//       [itemId]
//     );

//     if (resultadoItem.rows.length === 0) {
//       return res.status(404).json({ erro: 'Item não encontrado' });
//     }

//     const { tipo, status } = resultadoItem.rows[0];
//     let dados = null;

//     if (status === 'preenchido') {
//       if (tipo === 'celular') {
//         const resCelular = await client.query(
//           `SELECT modelo, imei, numero, operadora FROM celulares WHERE item_solicitado_id = $1`,
//           [itemId]
//         );
//         dados = resCelular.rows[0];
//       } else if (tipo === 'chip') {
//         const resChip = await client.query(
//           `SELECT numero, operadora, plano FROM chips WHERE item_solicitado_id = $1`,
//           [itemId]
//         );
//         dados = resChip.rows[0];
//       } else if (tipo === 'notebook') {
//         const resNotebook = await client.query(
//           `SELECT modelo, numero_patrimonio, sistema_operacional FROM notebooks WHERE item_solicitado_id = $1`,
//           [itemId]
//         );
//         dados = resNotebook.rows[0];
//       }
//     }

//     res.status(200).json({ tipo, status, dados });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ erro: 'Erro ao buscar item' });
//   } finally {
//     client.release();
//   }
// };


// exports.listarSolicitacoesPendentes = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const result = await client.query(`
//       SELECT s.id AS solicitacao_id, f.nome AS funcionario, s.tipo, s.observacoes, s.data_criacao,
//              i.id AS item_id, i.tipo AS tipo_item, i.status
//       FROM solicitacoes s
//       JOIN funcionarios f ON f.id = s.funcionario_id
//       JOIN itens_solicitados i ON i.solicitacao_id = s.id
//       WHERE i.status = 'pendente'
//       ORDER BY s.data_criacao DESC
//     `);

//     const agrupadas = {};

//     for (const row of result.rows) {
//       const id = row.solicitacao_id;

//       if (!agrupadas[id]) {
//         agrupadas[id] = {
//           solicitacao_id: id,
//           funcionario: row.funcionario,
//           tipo: row.tipo,
//           observacoes: row.observacoes,
//           data_criacao: row.data_criacao,
//           itens: []
//         };
//       }

//       agrupadas[id].itens.push({
//         item_id: row.item_id,
//         tipo: row.tipo_item,
//         status: row.status
//       });
//     }

//     res.status(200).json(Object.values(agrupadas));

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ erro: 'Erro ao listar solicitações' });
//   } finally {
//     client.release();
//   }
// };

// controllers/solicitacoesController.js
exports.listarSolicitacoesPendentes = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
      s.id AS solicitacao_id, 
      s.tipo, 
      s.observacoes, 
      s.status, 
      s.data_solicitacao,
      s.aprovado_gerente,
      s.aprovado_financeiro,
      s.aprovado_por_gerente,
      s.aprovado_por_financeiro,
      s.criada_por_id,
      u.nome AS nome_criador,
      f.id AS funcionario_id, 
      f.nome AS nome_funcionario, 
      f.cargo, 
      f.loja,
      json_agg(
        json_build_object(
          'id', i.id,
          'tipo', i.tipo,
          'status', i.status,
          'celular', json_build_object(
            'modelo', ce.modelo,
            'imei', ce.imei,
            'numero', ce.numero,
            'operadora', ce.operadora
          ),
          'chip', json_build_object(
            'numero', ch.numero,
            'operadora', ch.operadora,
            'plano', ch.plano
          ),
          'notebook', json_build_object(
            'modelo', no.modelo,
            'numero_patrimonio', no.numero_patrimonio,
            'sistema_operacional', no.sistema_operacional,
            'preco', no.preco
          )
        )
      ) AS itens
    FROM solicitacoes s
    JOIN funcionarios f ON s.funcionario_id = f.id
    LEFT JOIN usuarios u ON s.criada_por_id = u.id
    LEFT JOIN itens_solicitados i ON i.solicitacao_id = s.id
    LEFT JOIN celulares ce ON ce.item_solicitado_id = i.id
    LEFT JOIN chips ch ON ch.item_solicitado_id = i.id
    LEFT JOIN notebooks no ON no.item_solicitado_id = i.id
    WHERE s.status = 'pendente'
    GROUP BY 
      s.id, s.tipo, s.observacoes, s.status, s.data_solicitacao,
      s.aprovado_gerente, s.aprovado_financeiro, s.aprovado_por_gerente, s.aprovado_por_financeiro, s.criada_por_id,
      u.nome,
      f.id, f.nome, f.cargo, f.loja
    ORDER BY s.data_solicitacao DESC;
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao listar solicitações pendentes:', erro);
    res.status(500).json({ erro: 'Erro ao listar solicitações pendentes' });
  }
};

exports.aprovarGerente = async (req, res) => {
  const { id } = req.params;
  const { nome_gerente } = req.body;
  try {
    await pool.query(
      `UPDATE solicitacoes
       SET aprovado_gerente = true, aprovado_por_gerente = $1
       WHERE id = $2`,
      [nome_gerente, id]
    );

    res.json({ mensagem: 'Solicitação aprovada pelo gerente.' });
  } catch (erro) {
    console.error('Erro ao aprovar como gerente:', erro);
    res.status(500).json({ erro: 'Erro ao aprovar como gerente.' });
  }
};

exports.aprovarFinanceiro = async (req, res) => {
  const { id } = req.params;
  const { nome_financeiro } = req.body;

  try {
    await pool.query(
      `UPDATE solicitacoes
       SET aprovado_financeiro = true, aprovado_por_financeiro = $1
       WHERE id = $2`,
      [nome_financeiro, id]
    );

    res.json({ mensagem: 'Solicitação aprovada pelo financeiro.' });
  } catch (erro) {
    console.error('Erro ao aprovar como financeiro:', erro);
    res.status(500).json({ erro: 'Erro ao aprovar como financeiro.' });
  }
};

exports.encerrarSolicitacao = async (req, res) => {
  const id = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verifica se todos os itens estão preenchidos
    const itensPendentes = await client.query(`
      SELECT COUNT(*) AS pendentes
      FROM itens_solicitados
      WHERE solicitacao_id = $1 AND status != 'preenchido'
    `, [id]);
    const pendentes = parseInt(itensPendentes.rows[0].pendentes);

    // Verifica aprovações
    const aprovacoes = await client.query(`
      SELECT aprovado_gerente, aprovado_financeiro
      FROM solicitacoes
      WHERE id = $1
    `, [id]);
    const { aprovado_gerente, aprovado_financeiro } = aprovacoes.rows[0];

    // Define novo status com base nas regras
    const podeFinalizar = pendentes === 0 && aprovado_gerente && aprovado_financeiro;
    const novoStatus = podeFinalizar ? 'finalizada' : 'encerrada';

    await client.query(`
      UPDATE solicitacoes
      SET status = $1
      WHERE id = $2
    `, [novoStatus, id]);

    await client.query('COMMIT');
    res.status(200).json({ mensagem: `Solicitação ${novoStatus} !⚠️.` });

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao encerrar a solicitação' });
  } finally {
    client.release();
  }
};
