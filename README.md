# Claudinha Store

![Status do Projeto](https://img.shields.io/badge/status-em%20testes-yellow)

## 📖 Sobre o Projeto

**Claudinha Store** é um sistema de gerenciamento completo para lojas, projetado para otimizar e centralizar as operações de vendas, estoque, catálogo e finanças. A aplicação conta com uma área administrativa robusta para gestores e um painel para funcionários, facilitando o controle do negócio no dia a dia.

---

## ✨ Funcionalidades Principais

O sistema oferece um conjunto completo de ferramentas para a gestão da loja, incluindo:

* **Painel de Controle (Dashboard):** Visualização rápida de métricas e informações importantes.
* **🛒 Gestão de Vendas:**
    * Registro de novas vendas (PDV).
    * Gerenciamento e histórico de vendas realizadas.
    * Controle e gerenciamento de caixas.
* **📦 Gestão de Estoque:**
    * Gerenciamento de lotes de produtos.
    * Controle de movimentações (entradas e saídas).
* **📚 Gestão de Catálogo:**
    * Cadastro e gerenciamento de Produtos.
    * Organização por Categorias e Marcas.
    * Cadastro de Fornecedores.
* **💰 Módulo Financeiro:**
    * Histórico de pagamentos.
    * Geração de relatórios de vendas e de produtos.
* **👥 Gestão de Pessoas:**
    * Cadastro e gerenciamento de Clientes.
    * Cadastro e gerenciamento de Funcionários.
* **⚙️ Configurações:**
    * Configuração de Pontos de Venda (PDVs).

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com um ecossistema moderno baseado em JavaScript e Node.js.

* **Backend:** Node.js, Express.js
* **Frontend:** EJS (Embedded JavaScript templates), Bootstrap 5
* **Banco de Dados:** MySQL com o ORM Sequelize

Para uma lista completa e detalhada de todas as dependências do projeto, suas versões e o papel de cada uma, por favor, consulte o nosso arquivo **[TECH_STACK.md](./TECH_STACK.md)**.

---

## 🚀 Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) (versão 14 ou superior)
* [MySQL](https://www.mysql.com/)

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/iuryruansc/claudinha_store.git](https://github.com/iuryruansc/claudinha_store.git)
    cd claudinha_store
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    * Crie o arquivo `.env`.
    * Abra o arquivo `.env` e preencha com as suas credenciais do banco de dados e outras configurações necessárias.
    ```env
    DB_HOST=localhost
    DB_USER=seu_usuario_mysql
    DB_PASS=sua_senha_mysql
    DB_NAME=claudinha_store
    SESSION_SECRET=sua_chave_secreta_aqui
    USER_EMAIL:email_de_envio
    USER_PASS:senha_de_aplicativo
    ```

4.  **Inicie o servidor:**
    ```bash
    nodemon app.js
    ```

Após iniciar, a aplicação estará disponível em `https://localhost:3000` (ou a porta que você configurou).

---

## 📜 Scripts Disponíveis

No diretório do projeto, você pode executar:

* `npm start`: Inicia o servidor em modo de produção.
* `nodemon app.js` Inicia e Reinicia o servidor automaticamente a cada mudança detectada.
* `npm test`: Atualmente, exibe um erro padrão (nenhum teste configurado).

---

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👤 Autor

* **Iury Ruan**
    * GitHub: [@iuryruansc](https://github.com/iuryruansc)