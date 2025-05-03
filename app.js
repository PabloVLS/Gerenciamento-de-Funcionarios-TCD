// Importa o Express para criar o servidor
const express = require('express');

// Importa o body-parser para tratar requisições com corpo em JSON ou formulário
const bodyParser = require('body-parser');

// Importa o path para lidar com caminhos de arquivos/diretórios
const path = require('path');

// Importa as rotas separadas para organização
const funcionarioRoutes  = require('./routes/funcionarioRoutes');
const usuarioRoutes      = require('./routes/usuarioRoutes');
const loginRoutes        = require('./routes/loginRoutes');
const controleRoutes     = require('./routes/controleRoutes');
const solicitacoesRoutes = require('./routes/solicitacoesRoutes');

// Cria a aplicação Express
const app = express();
const port = 3000;

// ---------- MIDDLEWARES ----------
// Permite que a aplicação entenda JSON no corpo das requisições
app.use(bodyParser.json());

// Permite a leitura de dados de formulários (x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- ARQUIVOS ESTÁTICOS ----------
// Define a pasta onde ficam os arquivos HTML, CSS, JS públicos
app.use(express.static(path.join(__dirname, '../public')));

// ---------- ROTAS DE PÁGINAS HTML ----------
// Define os caminhos para as páginas HTML renderizadas pelo navegador
app.get('/',                 (req, res) => res.sendFile(path.join(__dirname, '../public/pages/login.html')));
app.get('/cadastro',         (req, res) => res.sendFile(path.join(__dirname, '../public/pages/cadFuncionario.html')));
app.get('/home',             (req, res) => res.sendFile(path.join(__dirname, '../public/pages/home.html')));
app.get('/controle',         (req, res) => res.sendFile(path.join(__dirname, '../public/pages/controleFuncionario.html')));
app.get('/solicitacoes',     (req, res) => res.sendFile(path.join(__dirname, '../public/pages/solicitacoes.html')));
app.get('/cadastro-usuarios',(req, res) => res.sendFile(path.join(__dirname, '../public/pages/cadUsuarios.html')));

// ---------- ROTAS DE API (JSON) ----------
// Aqui você delega o tratamento das rotas para arquivos separados
app.use('/api/funcionarios', funcionarioRoutes);     // CRUD de funcionários
app.use('/api/usuarios',     usuarioRoutes);         // Cadastro de usuários
app.use('/api/login',        loginRoutes);           // Autenticação de login
app.use('/api/controle',     controleRoutes);        // Controle de Equipamentos e Funcionários
app.use('/api/solicitacoes', solicitacoesRoutes);    // Solicitações de RH ou gerente

// ---------- INICIA O SERVIDOR ----------
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
