const pool = require('../db');

exports.criar = async (req, res) => {
  const { nome, cargo, usuario, senha, email } = req.body;
  try {
    await pool.query(
      `INSERT INTO usuarios
      (nome, cargo, nome_usuario, senha, email)
      VALUES ($1, $2, $3, $4, $5)`,
      [nome, cargo, usuario, senha, email]
    );
    res.status(200).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
