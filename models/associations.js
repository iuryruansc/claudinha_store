const Caixa = require('./Caixa');
const Category = require('./Category');
const Cliente = require('./Cliente');
const Desconto = require('./Desconto');
const Lote = require('./Lote');
const Funcionario = require('./Funcionario');
const ItemVenda = require('./ItemVenda');
const ItemReembolso = require('./ItemReembolso');
const MovimentacaoEstoque = require('./MovimentacaoEstoque');
const Pagamento = require('./Pagamento');
const PagamentoParcial = require('./PagamentoParcial');
const ParcelaPagamento = require('./ParcelaPagamento');
const Pdv = require('./Pdv');
const Produto = require('./Produto');
const Venda = require('./Venda');
const Reembolso = require('./Reembolso');
const Usuario = require('./Usuario');
const UserMeta = require('./UserMeta');
const Marca = require('./Marca');
const Fornecedor = require('./Fornecedor');
const Cargo = require('./Cargo');

// Venda -> ItemVenda
Venda.hasMany(ItemVenda, { foreignKey: 'id_venda' });
ItemVenda.belongsTo(Venda, { foreignKey: 'id_venda' });

// Venda -> Pagamento
Venda.hasMany(Pagamento, { foreignKey: 'id_venda' });
Pagamento.belongsTo(Venda, { foreignKey: 'id_venda' });

// Venda -> PagamentoParcial
Venda.hasMany(PagamentoParcial, { foreignKey: 'id_venda' });
PagamentoParcial.belongsTo(Venda, { foreignKey: 'id_venda' });

// Venda -> MovimentacaoEstoque
Venda.hasMany(MovimentacaoEstoque, { foreignKey: 'id_venda' });
MovimentacaoEstoque.belongsTo(Venda, { foreignKey: 'id_venda' });

// Pagamento -> ParcelaPagamento
Pagamento.hasMany(ParcelaPagamento, { foreignKey: 'id_pagamento' });
ParcelaPagamento.belongsTo(Pagamento, { foreignKey: 'id_pagamento' });

// Funcionario -> Venda, Caixa, MovimentacaoEstoque, Usuario
Funcionario.hasMany(Venda, { foreignKey: 'id_funcionario', as: 'vendas' });
Venda.belongsTo(Funcionario, { foreignKey: 'id_funcionario', as: 'funcionario' });
Funcionario.hasMany(Caixa, { foreignKey: 'id_funcionario', as: 'caixas' });
Caixa.belongsTo(Funcionario, { foreignKey: 'id_funcionario', as: 'funcionario' });
Funcionario.hasMany(MovimentacaoEstoque, { foreignKey: 'id_funcionario', as: 'movimentacoes' });
MovimentacaoEstoque.belongsTo(Funcionario, { foreignKey: 'id_funcionario', as: 'funcionario' });
Funcionario.hasOne(Usuario, { foreignKey: 'id_funcionario', as: 'usuario' });
Usuario.belongsTo(Funcionario, { foreignKey: 'id_funcionario' });

// Caixa -> Venda
Caixa.hasMany(Venda, { foreignKey: 'id_caixa' });
Venda.belongsTo(Caixa, { foreignKey: 'id_caixa' });

// Cliente -> Venda
Cliente.hasMany(Venda, { foreignKey: 'id_cliente', as: 'vendas' });
Venda.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Pdv -> Caixa
Pdv.hasMany(Caixa, { foreignKey: 'id_pdv' });
Caixa.belongsTo(Pdv, { foreignKey: 'id_pdv' });

// Category -> Produto
Category.hasMany(Produto, { foreignKey: 'id_categoria' });
Produto.belongsTo(Category, { foreignKey: 'id_categoria' });

// Produto -> Lote, ItemVenda
Produto.hasMany(Lote, { foreignKey: 'id_produto', as: 'lote' });
Lote.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });
Produto.hasMany(ItemVenda, { foreignKey: 'id_produto', as: 'itemvendas' });
ItemVenda.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });

// Lote -> MovimentacaoEstoque
Lote.hasMany(MovimentacaoEstoque, { foreignKey: 'id_lote' });
MovimentacaoEstoque.belongsTo(Lote, { foreignKey: 'id_lote' });
Lote.hasMany(Desconto, { foreignKey: 'id_lote', as: 'descontos' });
Desconto.belongsTo(Lote, { foreignKey: 'id_lote', as: 'lote' });

// Usuario -> UserMeta
Usuario.hasOne(UserMeta, { foreignKey: 'id_usuario' });
UserMeta.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Fornecedor -> Produto
Fornecedor.hasMany(Produto, { foreignKey: 'id_fornecedor' });
Produto.belongsTo(Fornecedor, { foreignKey: 'id_fornecedor' });

// Marca -> Produto
Marca.hasMany(Produto, { foreignKey: 'id_marca' });
Produto.belongsTo(Marca, { foreignKey: 'id_marca' });

//Cargo -> Funcionario
Cargo.hasMany(Funcionario, { foreignKey: 'id_cargo' });
Funcionario.belongsTo(Cargo, { foreignKey: 'id_cargo' });

// Venda -> Reembolso
Venda.hasMany(Reembolso, { foreignKey: 'id_venda', as: 'reembolsos' });
Reembolso.belongsTo(Venda, { foreignKey: 'id_venda', as: 'venda' });

// Funcionario -> Reembolso
Funcionario.hasMany(Reembolso, { foreignKey: 'id_funcionario' });
Reembolso.belongsTo(Funcionario, { foreignKey: 'id_funcionario' });

// Reembolso -> ItemReembolso
Reembolso.hasMany(ItemReembolso, { foreignKey: 'id_reembolso' });
ItemReembolso.belongsTo(Reembolso, { foreignKey: 'id_reembolso' });

// ItemReembolso -> ItemVenda, Produto, Lote
ItemReembolso.belongsTo(ItemVenda, { foreignKey: 'id_item_venda', as: 'itemvenda' });
ItemVenda.hasMany(ItemReembolso, { foreignKey: 'id_item_venda', as: 'itemreembolsos' });
ItemReembolso.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });
ItemReembolso.belongsTo(Lote, { foreignKey: 'id_lote', as: 'lote' });

// Export all models and their associations
module.exports = {
  Caixa,
  Category,
  Cliente,
  Desconto,
  Lote,
  Funcionario,
  ItemVenda,
  ItemReembolso,
  MovimentacaoEstoque,
  Pagamento,
  PagamentoParcial,
  ParcelaPagamento,
  Pdv,
  Produto,
  Venda,
  Reembolso,
  Usuario,
  UserMeta,
  Marca,
  Fornecedor,
  Cargo
};
