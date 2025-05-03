const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'GDF-Grupo Lidon'
});

pool.connect()
  .then(() => console.log('Conectado ao banco'))
  .catch(err => console.error('Erro de conexão:', err.stack));

module.exports = pool;
