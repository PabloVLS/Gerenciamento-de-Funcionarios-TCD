const pool = require('../db');

exports.registrarFinalizacao = async (req, res) => {
    const { id_funcionario, nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip } = req.body;
  
    try {
      // Verifica se o id_funcionario já existe na tabela controle_funcionarios
      const resultado = await pool.query(
        'SELECT id FROM controle_funcionarios WHERE id = $1',
        [id_funcionario]
      );
  
      if (resultado.rows.length > 0) {
        // Se já existir, faz o UPDATE no registro
        await pool.query(
          'UPDATE controle_funcionarios SET nome = $1, cargo = $2, loja = $3, modelo_celular = $4, modelo_notebook = $5, modelo_chip = $6 WHERE id = $7',
          [nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip, id_funcionario]
        );
        console.log(`Registro atualizado no controle_funcionarios para o id ${id_funcionario}`);
      } else {
        // Se não existir, faz o INSERT
        await pool.query(
          'INSERT INTO controle_funcionarios (id, nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [id_funcionario, nome, cargo, loja, modelo_celular, modelo_notebook, modelo_chip]
        );
        console.log(`Novo registro inserido no controle_funcionarios para o id ${id_funcionario}`);
      }
  
      // Atualiza a solicitação para finalizada
      await pool.query('UPDATE solicitacoes SET finalizada = true WHERE id = $1', [id_funcionario]);
  
      res.json({ sucesso: true });
    } catch (erro) {
      console.error('Erro ao registrar finalização:', erro);
      res.status(500).json({ erro: 'Erro ao registrar no controle' });
    }
  };
  
  

  exports.listarControle = async (req, res) => {
    try {
      const resultado = await pool.query('SELECT * FROM controle_funcionarios ORDER BY id DESC');
      res.json(resultado.rows);
    } catch (erro) {
      console.error('Erro ao listar controle:', erro);
      res.status(500).json({ erro: 'Erro ao buscar controle' });
    }
  };
  