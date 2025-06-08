const pool = require('../db');

exports.listarControleEquipamentos = async (req, res) => {
  const { idFuncionario } = req.params;

  const cliente = await pool.connect();
  try {
    // 1. Solicitação finalizada mais recente
    const resultadoSolicitacao = await cliente.query(`
      SELECT id FROM solicitacoes 
      WHERE funcionario_id = $1 AND status = 'finalizada'
      ORDER BY data_solicitacao DESC
      LIMIT 1
    `, [idFuncionario]);

    if (resultadoSolicitacao.rows.length === 0) {
      return res.json({ celular: null, chip: null, notebook: null });
    }

    const solicitacaoId = resultadoSolicitacao.rows[0].id;

    // 2. Itens solicitados
    const resultadoItens = await cliente.query(`
      SELECT id, tipo FROM itens_solicitados 
      WHERE solicitacao_id = $1
    `, [solicitacaoId]);

    let idCelular = null, idChip = null, idNotebook = null;
    resultadoItens.rows.forEach(item => {
      if (item.tipo === 'celular') idCelular = item.id;
      if (item.tipo === 'chip') idChip = item.id;
      if (item.tipo === 'notebook') idNotebook = item.id;
    });

    const [celular, chip, notebook] = await Promise.all([
      idCelular ? cliente.query(`SELECT * FROM celulares WHERE item_solicitado_id = $1`, [idCelular]) : null,
      idChip ? cliente.query(`SELECT * FROM chips WHERE item_solicitado_id = $1`, [idChip]) : null,
      idNotebook ? cliente.query(`SELECT * FROM notebooks WHERE item_solicitado_id = $1`, [idNotebook]) : null
    ]);

    res.json({
      celular: celular?.rows[0] || null,
      chip: chip?.rows[0] || null,
      notebook: notebook?.rows[0] || null
    });

  } catch (erro) {
    console.error('Erro ao buscar equipamentos:', erro);
    res.status(500).json({ erro: 'Erro ao buscar equipamentos' });
  } finally {
    cliente.release();
  }
};





















// exports.registrarFinalizacao = async (req, res) => {
//     const { id_funcionario, nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip } = req.body;
  
//     try {
//       // Verifica se o id_funcionario já existe na tabela controle_funcionarios
//       const resultado = await pool.query(
//         'SELECT id FROM controle_funcionarios WHERE id = $1',
//         [id_funcionario]
//       );
  
//       if (resultado.rows.length > 0) {
//         // Se já existir, faz o UPDATE no registro
//         await pool.query(
//           'UPDATE controle_funcionarios SET nome = $1, cargo = $2, loja = $3, modelo_celular = $4, modelo_notebook = $5, modelo_chip = $6 WHERE id = $7',
//           [nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip, id_funcionario]
//         );
//         console.log(`Registro atualizado no controle_funcionarios para o id ${id_funcionario}`);
//       } else {
//         // Se não existir, faz o INSERT
//         await pool.query(
//           'INSERT INTO controle_funcionarios (id, nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip) VALUES ($1, $2, $3, $4, $5, $6, $7)',
//           [id_funcionario, nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip]
//         );
//         console.log(`Novo registro inserido no controle_funcionarios para o id ${id_funcionario}`);
//       }
  
//       // Atualiza a solicitação para finalizada
//       await pool.query('UPDATE solicitacoes SET finalizada = true WHERE id = $1', [id_funcionario]);
  
//       res.json({ sucesso: true });
//     } catch (erro) {
//       console.error('Erro ao registrar finalização:', erro);
//       res.status(500).json({ erro: 'Erro ao registrar no controle' });
//     }
//   };
  
  

//   exports.listarControle = async (req, res) => {
//     try {
//       const resultado = await pool.query('SELECT * FROM controle_funcionarios ORDER BY id DESC');
//       res.json(resultado.rows);
//     } catch (erro) {
//       console.error('Erro ao listar controle:', erro);
//       res.status(500).json({ erro: 'Erro ao buscar controle' });
//     }
//   };

//   // exports.demitir = async(req, res) =>{
//   //   try{
//   //     const { id } = req.params;
//   //     await pool.query(`
//   //       UPDATE controle_funcionarios
//   //       SET demitido = true,
//   //           data_finalizacao = CURRENT_DATE
//   //       WHERE id = $1
//   //     `, [id]);

//   //     res.sendStatus(200);

//   //   }catch(erro){
//   //     console.error('Erro ao demitir :', erro);
//   //     res.status(500).json({ erro: 'Erro ao demitir no controle' });
//   //   }
//   // }
  