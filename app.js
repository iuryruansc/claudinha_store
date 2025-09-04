require('dotenv').config();

const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const connection = require('./database/database');
const errorHandler = require('./utils/handlers/error-handler');

//Routers
const adminRouter = require('./routes/admin');

//Configuration
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

//Database connection
connection
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados realizada com sucesso!');
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

//Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
    },
  },
}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Main Routes
app.get('/', (req, res) => {
  res.send("Home");
});
app.use('/admin', adminRouter);

//Error Handling middleware
app.use(errorHandler);

//Server Listen
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
