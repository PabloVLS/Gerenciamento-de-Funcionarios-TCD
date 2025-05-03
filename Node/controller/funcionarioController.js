const pool = require('../db');

// Cadastra um novo funcionário
exports.criar = async (req, res) => {
  const { nome, cargo, loja, equipamentos, observacoes } = req.body;

  const celular = equipamentos.includes('celular');
  const notebook = equipamentos.includes('notebook');
  const chip = equipamentos.includes('chip');

  try {
    await pool.query(
      `INSERT INTO solicitacoes (nome, cargo, loja, celular, notebook, chip, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nome, cargo, loja, celular, notebook, chip, observacoes]
    );

    res.status(201).json({ mensagem: 'Solicitação de funcionário cadastrada com sucesso!' });
  } catch (erro) {
    console.error('Erro ao cadastrar solicitação:', erro);
    res.status(500).json({ erro: 'Erro interno ao cadastrar solicitação' });
  }
};


// Lista todos os funcionários cadastrados
exports.listar = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT * FROM solicitacoes
      WHERE finalizada = false
      ORDER BY data_cadastro DESC
    `);
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar funcionários:', erro);
    res.status(500).json({ erro: 'Erro interno ao buscar dados' });
  }
};
