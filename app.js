require('dotenv').config();

//Imports
const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const app = express();
const session = require('express-session');
const https = require('https')
const fs = require('fs')
const helmet = require('helmet');
const connection = require('./database/database');
const syncDatabase = require('./utils/data/data-sync');


//Utils
const navLinks = require('./utils/navigation/nav-links');
const errorHandler = require('./utils/handlers/error-handler');
const tokenCleanUp = require('./utils/clean-tokens');
const promoCleanUp = require('./utils/clean-promos');

//Routers
const adminRouter = require('./routes/adminRoutes');
const loginRouter = require('./routes/loginRoutes');
const startPromoCleanup = require('./utils/clean-promos');

//Configuration
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

const options = {
  key: fs.readFileSync('localhost+2-key.pem'),
  cert: fs.readFileSync('localhost+2.pem')
}

//Database connection
connection
  .authenticate()
  .then(async () => {
    console.log('Conexão com o banco de dados realizada com sucesso!');
    await syncDatabase();
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

//Check for SESSION_SECRET
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set!');
}

//Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://code.jquery.com",
        "https://cdn.datatables.net",
        "'unsafe-inline'"
      ],
      connectSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdn.datatables.net"
      ],
    },
  },
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: 'auto',
    maxAge: 1000 * 60 * 60 * 10
  }
}));

app.use(
  '/vendor/bootstrap',
  express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist'))
);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const errorMessages = {
  caixa: 'Atenção: Você precisa abrir um caixa antes de gerar uma venda.',
};

app.use((req, res, next) => {
  const code = req.query.erro;
  res.locals.erro = errorMessages[code] || '';
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  res.locals.navLinks = navLinks;
  next();
});

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

//Main Routes
app.use('/admin', adminRouter);
app.use('/', loginRouter);

//Error Handling middleware
app.use(errorHandler);

//Cleaning Unused Tokens
tokenCleanUp();

//Cleaning Promos
startPromoCleanup();

//Server Listen
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running on https://localhost:${port}`);
});
