const pool = require('../db');

exports.criar = async (req, res) => {
  const { nome, cpf, cargo, loja, observacoes } = req.body;

  // Verifica se os arquivos vieram corretamente
  const foto = req.files['foto'] ? req.files['foto'][0].filename : null;
  const foto_cpf = req.files['foto_cpf'] ? req.files['foto_cpf'][0].filename : null;

  try {
    await pool.query(
      `INSERT INTO funcionarios (nome, cargo, loja, observacoes, foto, foto_cpf, cpf)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nome, cargo, loja, observacoes, foto, foto_cpf, cpf]
    );

    res.status(201).json({ mensagem: 'Funcionário cadastrado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao cadastrar funcionário:', erro);
    res.status(500).json({ erro: 'Erro interno ao cadastrar funcionário' });
  }
};

exports.listar = async (req, res) => {
  try {
    const funcionariosQuery = await pool.query('SELECT * FROM funcionarios ORDER BY id');
    const funcionarios = funcionariosQuery.rows;

    const resultados = [];

    for (const func of funcionarios) {
      const solicitacaoQuery = await pool.query(`
        SELECT id FROM solicitacoes
        WHERE funcionario_id = $1 AND status = 'finalizada'
        ORDER BY data_solicitacao DESC
        LIMIT 1
      `, [func.id]);

      let modelo_celular = '-', modelo_chip = '-', modelo_notebook = '-';

      if (solicitacaoQuery.rows.length > 0) {
        const solicitacaoId = solicitacaoQuery.rows[0].id;

        // Celular
        const celular = await pool.query(`
          SELECT c.modelo
          FROM celulares c
          JOIN itens_solicitados i ON i.id = c.item_solicitado_id
          WHERE i.solicitacao_id = $1 AND i.tipo = 'celular'
        `, [solicitacaoId]);
        if (celular.rows.length > 0) modelo_celular = celular.rows[0].modelo;

        // Chip
        const chip = await pool.query(`
          SELECT ch.numero
          FROM chips ch
          JOIN itens_solicitados i ON i.id = ch.item_solicitado_id
          WHERE i.solicitacao_id = $1 AND i.tipo = 'chip'
        `, [solicitacaoId]);
        if (chip.rows.length > 0) modelo_chip = chip.rows[0].numero;

        // Notebook
        const notebook = await pool.query(`
          SELECT n.modelo
          FROM notebooks n
          JOIN itens_solicitados i ON i.id = n.item_solicitado_id
          WHERE i.solicitacao_id = $1 AND i.tipo = 'notebook'
        `, [solicitacaoId]);
        if (notebook.rows.length > 0) modelo_notebook = notebook.rows[0].modelo;
      }

      resultados.push({
        ...func,
        modelo_celular,
        modelo_chip,
        modelo_notebook,
        status: 'ativo' // por padrão, mas você pode ajustar com base em regra se quiser
      });
    }

    res.json(resultados);
  } catch (err) {
    console.error('Erro ao buscar funcionários:', err);
    res.status(500).json({ erro: 'Erro ao buscar funcionários' });
  }
};


exports.excluirFuncionario = async (req, res) => {
  const id = req.params.id;

  try {
    // Verifica se o funcionário existe e está desligado
    const resultado = await pool.query('SELECT status FROM funcionarios WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }

    const status = resultado.rows[0].status;

    if (status.toLowerCase() !== 'desligado') {
      return res.status(400).json({ mensagem: 'Funcionário precisa estar desligado para ser excluído.' });
    }

    // Exclui o funcionário
    await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);

    res.status(200).json({ mensagem: 'Funcionário excluído com sucesso.' });

  } catch (erro) {
    console.error('Erro ao excluir funcionário:', erro);
    res.status(500).json({ mensagem: 'Erro ao excluir funcionário.' });
  }
};


exports.demitirFuncionario = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'UPDATE funcionarios SET status = $1 WHERE id = $2',
      ['Desligado', id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }

    res.status(200).json({ mensagem: 'Funcionário desligado com sucesso.' });
  } catch (erro) {
    console.error('Erro ao demitir funcionário:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar status do funcionário.' });
  }
};


exports.editarFuncionario = async (req, res) => {
  const { id } = req.params;
  const { nome, cargo, cpf, loja, observacoes, status } = req.body;
  const foto = req.files?.foto ? req.files.foto[0].filename : null;
  const fotoCPF = req.files?.foto_cpf ? req.files.foto_cpf[0].filename : null;

  try {
    // Busca o funcionário atual
    const resultadoConsulta = await pool.query('SELECT * FROM funcionarios WHERE id = $1', [id]);
    if (resultadoConsulta.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }

    // Se não veio foto nova, mantém a antiga
    const fotoAtual = resultadoConsulta.rows[0].foto;
    const fotoFinal = foto ? foto : fotoAtual;

    const fotoCPFAtual = resultadoConsulta.rows[0].foto_cpf;
    const fotoCPFFinal = fotoCPF ? fotoCPF : fotoCPFAtual;

    const resultadoAtualizacao = await pool.query(
      `UPDATE funcionarios 
       SET nome = $1, cargo = $2, cpf = $3, loja = $4, observacoes = $5, status = $6, foto = $7, foto_cpf = $8
       WHERE id = $9`,
      [nome, cargo, cpf, loja, observacoes, status, fotoFinal, fotoCPFFinal, id]
    );

    res.status(200).json({
      mensagem: 'Funcionário atualizado com sucesso.',
      nome,
      cargo,
      cpf,
      loja,
      observacoes,
      status,
      foto_funcionario: fotoFinal,
      foto_cpf: fotoCPFFinal
    });
  } catch (erro) {
    console.error('Erro ao atualizar funcionário:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar funcionário.' });
  }
};

exports.buscarFuncionario = async (req, res) => {
  const idFuncionario = req.params.idFuncionario;

  try {
    const resultado = await pool.query(
      `SELECT id, nome, cargo, loja, cpf, observacoes, status, foto AS foto_funcionario, foto_cpf 
       FROM funcionarios WHERE id = $1`,
      [idFuncionario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao buscar funcionário:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

