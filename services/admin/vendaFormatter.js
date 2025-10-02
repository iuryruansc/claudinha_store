function formatarVendaParaTabela(venda) {
    const resumoItens = (() => {
        if (!venda.itemvendas || venda.itemvendas.length === 0) return 'Nenhum item';
        const primeiroItem = venda.itemvendas[0]?.produto?.nome || 'Item desconhecido';
        const outrosItens = venda.itemvendas.length - 1;
        return outrosItens > 0 ? `${primeiroItem} e +${outrosItens}` : primeiroItem;
    })();

    let detailsContent = '';
    venda.itemvendas.forEach(item => {
        const subtotal = parseFloat(item.preco_unitario) * item.quantidade;
        detailsContent += `<li class="list-group-item d-flex justify-content-between align-items-center"><span>${item.produto.nome} <small class="text-muted">(x${item.quantidade})</small></span><span class="fw-semibold">${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>`;
    });
    const detailsHtml = `<div class="p-3 bg-white border-top"><h6 class="mb-2"><i class="bi bi-list-ul"></i> Itens desta Venda:</h6><ul class="list-group list-group-flush">${detailsContent}</ul></div>`;

    return {
        id_venda: venda.id_venda,
        clienteNome: venda.cliente ? `<i class="bi bi-person-circle me-1"></i>${venda.cliente.nome}` : `<span class="text-muted fst-italic">Anônimo</span>`,
        data: `<i class="bi bi-calendar me-1"></i>${new Date(venda.data_hora).toLocaleDateString('pt-BR')}`,
        resumoItens: `<span class="fw-semibold">${resumoItens}</span>`,
        valorTotal: `<span class="fw-bold">${parseFloat(venda.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>`,
        statusHtml: venda.status === 'CONCLUIDA' ? `<span class="badge bg-success">Concluída</span>` : `<span class="badge bg-warning text-dark">Pendente</span>`,
        acoesHtml: `<a href="/admin/vendas/detalhes/${venda.id_venda}" class="btn btn-sm btn-outline-primary" title="Ver detalhes"><i class="bi bi-eye"></i></a>`,
        detailsHtml: detailsHtml
    };
}

module.exports = { formatarVendaParaTabela };