const pool = require("../db"); 

exports.utilitarios = async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM solicitacoes");

    const aguardando = await pool.query(`
      SELECT COUNT(*) FROM solicitacoes WHERE status = 'pendente'
    `);

    const finalizados = await pool.query(`
      SELECT COUNT(*) FROM solicitacoes WHERE status = 'finalizada'
    `);

    const demitidos = await pool.query(`
      SELECT COUNT(*) FROM funcionarios WHERE status = 'Desligado'
    `);

    const ultimas = await pool.query(`
      SELECT f.nome, s.tipo FROM solicitacoes s
      JOIN funcionarios f ON s.funcionario_id = f.id
      ORDER BY s.data_solicitacao DESC
      LIMIT 3
    `);

    const ultimasSolicitacoes = ultimas.rows.map(row => `${row.nome} - ${row.tipo}`);

    res.json({
      total: Number(total.rows[0].count),
      aguardando: Number(aguardando.rows[0].count),
      finalizados: Number(finalizados.rows[0].count),
      demitidos: Number(demitidos.rows[0].count),
      ultimasSolicitacoes
    });
  } catch (erro) {
    console.error("Erro na rota /api/home:", erro);
    res.status(500).json({ erro: "Erro ao buscar dados da home" });
  }
};
