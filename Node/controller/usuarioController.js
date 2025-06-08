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

exports.listar = async (req, res) => {
  try{
    const resultado = await pool.query('SELECT * FROM usuarios ORDER BY data_criacao DESC');
    res.json(resultado.rows);
  }catch(erro){
    console.error('Erro ao buscar usuários:', erro);
    res.status(500).json({ erro: 'Erro interno ao buscar dados' });
  }
};

exports.excluir = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (erro) {
    console.error('Erro ao excluir usuário:', erro);
    res.status(500).json({ erro: 'Erro ao excluir usuário' });
  }
};