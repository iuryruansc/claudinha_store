const navLinks = [
    { label: "Painel Admin", href: '/admin/dashboard', icon: 'bi-grid-1x2-fill' },
    {
        label: 'Vendas',
        icon: 'bi-cart4',
        dropdown: [
            { label: 'Nova Venda', href: '/admin/vendas/new', icon: 'bi-cash-register' },
            { label: 'Gerenciar Vendas', href: '/admin/vendas', icon: 'bi-receipt-cutoff' },
            { label: 'Gerenciar Caixas', href: '/admin/caixas', icon: 'bi-safe2' }
        ]
    },
    {
        label: 'Estoque',
        icon: 'bi-box-seam',
        dropdown: [
            { label: 'Gerenciar Lotes', href: '/admin/lotes', icon: 'bi-boxes' },
            { label: 'Movimentações', href: '/admin/movimentacoes', icon: 'bi-arrow-left-right' },
        ]
    },
    {
        label: 'Catálogo',
        icon: 'bi-book',
        dropdown: [
            { label: 'Produtos', href: '/admin/produtos', icon: 'bi-box2' },
            { label: 'Categorias', href: '/admin/categories', icon: 'bi-tags' },
            { label: 'Marcas', href: '/admin/marcas', icon: 'bi-award' },
            { label: 'Fornecedores', href: '/admin/fornecedores', icon: 'bi-truck' }
        ]
    },
    {
        label: 'Financeiro',
        icon: 'bi-wallet2',
        dropdown: [
            { label: 'Histórico de Pagamentos', href: '/admin/pagamentos', icon: 'bi-clock-history' },
            {
                label: 'Relatórios',
                icon: 'bi-graph-up-arrow',
                dropdown: [
                    { label: 'Relatório de Vendas', href: '/admin/relatorios/vendas', icon: 'bi-file-earmark-bar-graph' },
                    { label: 'Relatório de Produtos', href: '/admin/relatorios/produtos', icon: 'bi-pie-chart' }
                ]
            },
        ]
    },
    {
        label: 'Pessoas',
        icon: 'bi-people',
        dropdown: [
            { label: 'Clientes', href: '/admin/clientes', icon: 'bi-person-lines-fill' },
            { label: 'Funcionários', href: '/admin/funcionarios', icon: 'bi-person-badge' }
        ]
    },
    {
        label: 'Configurações',
        icon: 'bi-gear',
        dropdown: [
            { label: 'Pontos de Venda (PDVs)', href: '/admin/pdvs', icon: 'bi-display' },
        ]
    }
];

module.exports = navLinks;