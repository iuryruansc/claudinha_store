const Caixa = require('./caixa');
const Category = require('./category');
const Cliente = require('./cliente');
const Lote = require('./lote');
const Funcionario = require('./funcionario');
const ItemVenda = require('./itemVenda');
const MovimentacaoEstoque = require('./movimentacaoEstoque');
const Pagamento = require('./pagamento');
const PagamentoParcial = require('./pagamentoParcial');
const ParcelaPagamento = require('./parcelaPagamento');
const Pdv = require('./pdv');
const Produto = require('./produto');
const Venda = require('./venda');

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

// Funcionario -> Venda, Caixa, MovimentacaoEstoque
Funcionario.hasMany(Venda, { foreignKey: 'id_funcionario' });
Venda.belongsTo(Funcionario, { foreignKey: 'id_funcionario' });
Funcionario.hasMany(Caixa, { foreignKey: 'id_funcionario' });
Caixa.belongsTo(Funcionario, { foreignKey: 'id_funcionario' });
Funcionario.hasMany(MovimentacaoEstoque, { foreignKey: 'id_funcionario' });
MovimentacaoEstoque.belongsTo(Funcionario, { foreignKey: 'id_funcionario' });

// Caixa -> Venda
Caixa.hasMany(Venda, { foreignKey: 'id_caixa' });
Venda.belongsTo(Caixa, { foreignKey: 'id_caixa' });

// Cliente -> Venda
Cliente.hasMany(Venda, { foreignKey: 'id_cliente' });
Venda.belongsTo(Cliente, { foreignKey: 'id_cliente' });

// Pdv -> Caixa
Pdv.hasMany(Caixa, { foreignKey: 'id_pdv' });
Caixa.belongsTo(Pdv, { foreignKey: 'id_pdv' });

// Category -> Produto
Category.hasMany(Produto, { foreignKey: 'id_categoria' });
Produto.belongsTo(Category, { foreignKey: 'id_categoria' });

// Produto -> Lote, ItemVenda
Produto.hasMany(Lote, { foreignKey: 'id_produto' });
Lote.belongsTo(Produto, { foreignKey: 'id_produto' });
Produto.hasMany(ItemVenda, { foreignKey: 'id_produto' });
ItemVenda.belongsTo(Produto, { foreignKey: 'id_produto' });

// Estoque -> MovimentacaoEstoque
Lote.hasMany(MovimentacaoEstoque, { foreignKey: 'id_lote' });
MovimentacaoEstoque.belongsTo(Lote, { foreignKey: 'id_lote' });

module.exports = {
  Caixa,
  Category,
  Cliente,
  Lote,
  Funcionario,
  ItemVenda,
  MovimentacaoEstoque,
  Pagamento,
  PagamentoParcial,
  ParcelaPagamento,
  Pdv,
  Produto,
  Venda
};
