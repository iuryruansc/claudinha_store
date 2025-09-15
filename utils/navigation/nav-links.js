module.exports = [
  { label: "Painel Admin", href: '/admin/dashboard' },
  {
    label: 'Produtos',
    dropdown: [
      { label: 'Ver Produtos', href: '/admin/produtos' },
      { label: 'Cadastrar Produto', href: '/admin/produtos/new' }
    ]
  },
  { label: 'Vendas', 
    dropdown: [
      { label: 'Nova Venda', href: '/admin/vendas/new'},
      { label: 'Vendas Completas', href: '/admin/vendas'}
    ]
   },
  { label: 'Clientes', href: '/admin/clientes' },
  { label: 'Estoque', href: '/admin/estoques' },
  { label: 'PDVs', href: '/admin/pdvs' },
  { label: 'Caixas', href: '/admin/caixas' },
  { label: 'Movimentações', href: '/admin/movimentacoes' },
  { label: 'Pagamentos', href: '/admin/pagamentos' }
];