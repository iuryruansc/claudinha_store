# Tech Stack e Dependências do Claudinha Store

Este documento fornece uma visão detalhada de todas as tecnologias, bibliotecas e ferramentas utilizadas no projeto Claudinha Store.

## Tecnologias Principais

| Tecnologia     | Propósito                                                                      |
| :------------- | :----------------------------------------------------------------------------- |
| **Node.js**    | Ambiente de execução do JavaScript no backend.                                 |
| **Express.js** | Framework web para construir a API, as rotas e a estrutura do servidor.        |
| **MySQL**      | Sistema de Gerenciamento de Banco de Dados relacional para armazenar os dados. |
| **EJS**        | Template Engine para renderizar páginas HTML dinâmicas com dados do servidor.  |
| **Socket.IO**  | Framework para comunicação bidirecional em tempo real via WebSockets.          |

---

## Dependências de Produção (`dependencies`)

Estas são as bibliotecas necessárias para a aplicação rodar em produção.

| Dependência       | Versão     | Propósito no Projeto                                                                                            |
| :---------------- | :--------- | :-------------------------------------------------------------------------------------------------------------- |
| `bcrypt`          | `^6.0.0`   | Criptografia de senhas para armazenamento seguro.                                                               |
| `body-parser`     | `^2.2.0`   | Middleware para extrair e interpretar o corpo de requisições (`req.body`).                                      |
| `bootstrap`       | `^5.3.8`   | Framework de CSS para a estilização e responsividade do frontend.                                               |
| `connect-flash`   | `^0.1.1`   | Middleware para exibir mensagens temporárias ao usuário (ex: "Venda criada!").                                  |
| `dayjs`           | `^1.11.18` | Biblioteca para manipulação, validação e formatação de datas.                                                   |
| `dotenv`          | `^17.2.1`  | Carrega variáveis de ambiente de um arquivo `.env` para o `process.env`.                                        |
| `ejs`             | `^3.1.10`  | Template engine para renderizar as views.                                                                       |
| `express`         | `^5.1.0`   | Framework web principal do projeto.                                                                             |
| `express-session` | `^1.18.2`  | Gerenciamento de sessões para manter o usuário logado.                                                          |
| `helmet`          | `^8.1.0`   | Aumenta a segurança da aplicação configurando diversos headers HTTP.                                            |
| `mysql2`          | `^3.14.3`  | Driver do Node.js para se conectar ao banco de dados MySQL.                                                     |
| `node-cron`       | `^4.2.1`   | Agendador de tarefas (cron jobs) em JavaScript.                                                                 |
| `nodemailer`      | `^7.0.6`   | Módulo para envio de e-mails.                                                                                   |
| `redis`           | `^5.8.2`   | Banco de dados em memória, frequentemente usado para cache ou sessões.                                          |
| `sequelize`       | `^6.37.7`  | ORM (Object-Relational Mapper) para interagir com o MySQL de forma moderna.                                     |
| `slugify`         | `^1.6.6`   | Biblioteca para criar "slugs" amigáveis para URLs (ex: "novo-produto").                                         |
| `socket.io`       | `^4.8.1`   | Habilita a comunicação em tempo real (via WebSockets) para atualizar a dashboard e o estoque instantaneamente.. |

---

## Dependências de Desenvolvimento (`devDependencies`)

Estas são as ferramentas utilizadas apenas durante o processo de desenvolvimento.

| Dependência           | Versão   | Propósito no Projeto                                       |
| :-------------------- | :------- | :--------------------------------------------------------- |
| `prettier-plugin-ejs` | `^1.0.3` | Plugin para o Prettier formatar código em arquivos `.ejs`. |
