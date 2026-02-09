require('dotenv').config();

//Imports
const { Server } = require("socket.io");
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
const activeUserSockets = new Map();

//Utils
const navLinks = require('./utils/navigation/nav-links');
const errorHandler = require('./utils/handlers/error-handler');
const tokenCleanUp = require('./utils/clean-tokens');
const startPromoCleanup = require('./utils/clean-promos');
const backupService = require('./services/backup/backupService');

//Routers
const adminRouter = require('./routes/adminRoutes');
const loginRouter = require('./routes/loginRoutes');
const funcRouter = require('./routes/funcRoutes');


//Configuration

const port = process.env.PORT || 80;
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
        "https://cdn.datatables.net",
        "wss:"
      ],
    },
  },
}));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: 'auto',
    maxAge: 1000 * 60 * 60 * 10
  }
});

app.use(sessionMiddleware);

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

app.use((req, res, next) => {
  req.io = io;
  next();
});

//Main Routes
app.use('/admin', adminRouter);
app.use('/funcionario', funcRouter);
app.use('/', loginRouter);

//Error Handling middleware
app.use(errorHandler);

//Cleaning Unused Tokens
tokenCleanUp();

//Cleaning Promos
startPromoCleanup();

// Start daily DB backup scheduler
backupService.start();

const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, (err) => {
    if (err) {
      console.error('Socket.IO: Erro no middleware de sessão.');
      return next(new Error('Erro de sessão'));
    }

    const session = socket.request.session;
    if (!session || !session.user) {
      console.error('Socket.IO: Conexão não autorizada. Sessão ou usuário inválidos.');
      return next(new Error('Não autorizado'));
    }

    const userId = session.user.id_funcionario;
    if (activeUserSockets.has(userId)) {
      const oldSocketId = activeUserSockets.get(userId);

      if (oldSocketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          console.log(`Forçando desconexão do socket antigo ${oldSocketId} para o usuário ${userId}`);
          oldSocket.emit('forceDisconnect', 'Detectamos que sua conta foi acessada em uma nova aba ou dispositivo. Para sua segurança, apenas uma sessão pode permanecer ativa. Feche essa aba ou clique em entendido para desativar outras abas e utilizar esta.');
          oldSocket.disconnect(true);
        }
      }
    }

    next();
  });
});

io.on('connection', (socket) => {
  const userInfo = socket.request.session.user;
  const userId = userInfo.id_funcionario;

  console.log(`✅ ${userInfo.nome} se conectou. Socket ID: ${socket.id}`);

  activeUserSockets.set(userId, socket.id);

  socket.join(userId.toString());

  socket.on('disconnect', () => {
    console.log(`❌ ${userInfo.nome} se desconectou. Socket ID: ${socket.id}`);

    if (activeUserSockets.get(userId) === socket.id) {
      activeUserSockets.delete(userId);
    }
  });
});

//Server Listen
httpsServer.listen(port, () => {
  console.log(`HTTPS server running on https://localhost:${port}`);
});
