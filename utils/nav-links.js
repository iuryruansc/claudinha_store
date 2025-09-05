module.exports = [
  { label: 'Categorias', href: '/admin/categories' },
  {
    label: 'Produtos',
    dropdown: [
      { label: 'Ver Produtos', href: '/admin/produtos' },
      { label: 'Cadastrar Produto', href: '/admin/produtos/new' }
    ]
  },
  { label: 'Funcionarios', href: '/admin/funcionarios' },
  { label: 'Clientes', href: '/admin/clientes' },
  { label: 'Estoques', href: '/admin/estoques' },
  { label: 'PDVs', href: '/admin/pdvs' },
  { label: 'Caixas', href: '/admin/caixas' },
  { label: 'Vendas', href: '/admin/vendas' }
];