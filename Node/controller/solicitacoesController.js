const pool = require('../db');

exports.registrarFinalizacao = async (req, res) => {
  const id = req.params.id;

  try {
    // Marca a solicitação como finalizada no banco
    await pool.query('UPDATE solicitacoes SET finalizada = true WHERE id= $1', [id]);
    res.status(200).json({ sucesso: true }); // Retorna sucesso ao front
  } catch (erro) {
    console.error('Erro ao finalizar solicitacão:', erro);
    res.status(500).json({ sucesso: false, erro: 'Erro ao finalizar' });
  }
};
