module.exports = [
  { label: "Painel Admin", href: '/admin/dashboard' },
  {
    label: 'Produtos',
    dropdown: [
      { label: 'Cadastrar Produto', href: '/admin/produtos/new' },
      { label: 'Ver Produtos', href: '/admin/produtos' }
    ]
  },
  {
    label: 'Catálogo',
    dropdown: [
      {
        label: 'Categorias',
        dropdown: [
          { label: 'Nova Categoria', href: '/admin/categories/new' },
          { label: 'Ver Categorias', href: '/admin/categories' }
        ]
      },
      {
        label: 'Fornecedores',
        dropdown: [
          { label: 'Cadastrar Fornecedor', href: '/admin/fornecedores/new' },
          { label: 'Ver Fornecedores', href: '/admin/fornecedores' }
        ]
      },
      {
        label: 'Marcas',
        dropdown: [
          { label: 'Cadastrar Marca', href: '/admin/marcas/new' },
          { label: 'Ver Marcas', href: '/admin/marcas' }
        ]
      }
    ]
  },
  { label: 'Vendas', href: '/admin/vendas' },
  { label: 'Clientes', href: '/admin/clientes' },
  { label: 'Lotes', href: '/admin/lotes' },
  { label: 'PDVs', href: '/admin/pdvs' },
  { label: 'Caixas', href: '/admin/caixas' },
  { label: 'Movimentações', href: '/admin/movimentacoes' },
  { label: 'Pagamentos', href: '/admin/pagamentos' }
];