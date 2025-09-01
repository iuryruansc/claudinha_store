require('dotenv').config();

const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const connection = require('./database/database');
const errorHandler = require('./utils/error-handler');

//Importing controllers
const categoriesController = require('./controllers/CategoriesController');
const produtoController = require('./controllers/ProdutosController');
const funcionariosController = require('./controllers/FuncionariosController');
const clientesController = require('./controllers/ClientesController')

//View engine
app.set('view engine', 'ejs');

//Adding security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
    },
  },
}));

//Static files
app.use(express.static('public'));

//Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Database connection
connection
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados realizada com sucesso!');
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

//Routes
app.get('/', (req, res) => {
  res.send("Home");
});
app.use('/admin', categoriesController);
app.use('/admin', produtoController);
app.use('/admin', funcionariosController);
app.use('/admin', clientesController)

//Error handler middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
