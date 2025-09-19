require('dotenv').config();

//Imports
const express = require('express');
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
const tokenCleanUp = require('./utils/clean-tokens')

//Routers
const adminRouter = require('./routes/adminRoutes');
const loginRouter = require('./routes/loginRoutes');

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
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://code.jquery.com", "https://cdn.datatables.net", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
    },
  },
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: 'auto',
  }
}));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.navLinks = navLinks;
  next();
});

//Main Routes
app.use('/admin', adminRouter);
app.use('/', loginRouter);

//Error Handling middleware
app.use(errorHandler);

//Cleaning Unused Tokens
tokenCleanUp();

//Server Listen
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running on https://localhost:${port}`);
});
