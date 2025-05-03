const pool = require('../db');

exports.login = async (req, res) => {
  const { usuarios, senha } = req.body;
  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE nome_usuario = $1 AND senha = $2',
      [usuarios, senha]
    );
    if(resultado.rows.length > 0){
      const usuario = resultado.rows[0];
      res.json({sucesso:true, id: usuario.id, nome: usuario.nome_usuario, cargo: usuario.cargo});
    }else{
      res.json({ sucesso: false, mensagem: 'Usuário ou senha inválidos'})
    }
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor [Rota Login]' });
  }
};
