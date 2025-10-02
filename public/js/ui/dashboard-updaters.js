function formatCurrency(value) {
    return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function updateCaixaCard(resumoCaixa) {
    const vendasDinheiroEl = document.querySelector('.list-group-item:nth-child(2) > span.text-success');
    const vendasOutrasFormasEl = document.querySelector('.list-group-item:nth-child(3) > span');
    const saldoEsperadoEl = document.querySelector('.list-group-item.bg-light strong.fs-6');

    if (vendasDinheiroEl) vendasDinheiroEl.textContent = `+ ${formatCurrency(resumoCaixa.totalRecebidoDinheiro)}`;
    if (vendasOutrasFormasEl) vendasOutrasFormasEl.textContent = formatCurrency(resumoCaixa.totalRecebidoCartao + resumoCaixa.totalRecebidoPix);
    if (saldoEsperadoEl) saldoEsperadoEl.textContent = formatCurrency(resumoCaixa.saldoEsperado);
}

export function updateFeedAtividade(atividade) {
    const feedList = document.querySelector('.card-body.dashboard-card-body-scrollable ul.list-group-flush');
    if (!feedList) return;

    const emptyMessage = feedList.querySelector('li.text-center');
    if (emptyMessage) emptyMessage.remove();

    const newItem = document.createElement('li');
    newItem.className = 'list-group-item d-flex align-items-start py-3';
    newItem.innerHTML = `
        <div class="me-3">
            <i class="bi ${atividade.icone} ${atividade.cor} fs-4"></i>
        </div>
        <div class="flex-grow-1">
            <p class="mb-0 small">${atividade.texto}</p>
            <small class="text-muted"><i class="bi bi-clock"></i> ${atividade.tempoAtras}</small>
        </div>
    `;

    feedList.prepend(newItem);
}

export function updatePagamentosRecentes(venda) {
    const pagamentosList = document.querySelector('.card:has(.bg-danger.text-white) ul.list-group-flush');
    if (!pagamentosList) return;

    const emptyMessage = pagamentosList.querySelector('li.text-center');
    if (emptyMessage) emptyMessage.remove();

    const newItem = document.createElement('li');
    newItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    newItem.innerHTML = `
        <div>
            <a href="/admin/vendas/detalhes/${venda.id}" class="fw-semibold text-decoration-none">
                Venda #${venda.id}
            </a>
            <small class="d-block text-muted">
                para ${venda.cliente}
            </small>
        </div>
        <span class="badge ${venda.status === 'CONCLUIDA' ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'} rounded-pill">
            <i class="bi ${venda.status === 'CONCLUIDA' ? 'bi-check-circle' : 'bi-hourglass-split'} me-1"></i> ${venda.status === 'CONCLUIDA' ? 'Quitada' : 'Pendente'}
        </span>
    `;
    pagamentosList.prepend(newItem);
}

export function updateAlertasEstoque(itensAtualizados) {
    const stockList = document.getElementById('stock-list');
    if (!stockList) return;

    const emptyMessage = document.getElementById('no-stock-alert');
    if (emptyMessage) emptyMessage.remove();

    itensAtualizados.forEach(item => {
        let listItem = stockList.querySelector(`li[data-produto-id="${item.id_produto}"]`);

        if (listItem) {
            if (item.statusEstoque === 'ok' || item.novaQuantidade <= 0) {
                listItem.remove();
            } else {
                const badge = listItem.querySelector('.badge');
                const icon = listItem.querySelector('i.bi');

                badge.textContent = `${item.novaQuantidade} un.`;

                const isCritico = item.statusEstoque === 'critico';
                badge.className = `badge rounded-pill ${isCritico ? 'bg-danger' : 'bg-warning text-dark'}`;
                icon.className = `bi me-2 ${isCritico ? 'bi-exclamation-triangle-fill text-danger' : 'bi-exclamation-circle-fill text-warning'}`;
            }
        }
        else if (item.statusEstoque === 'baixo' || item.statusEstoque === 'critico') {
            const isCritico = item.statusEstoque === 'critico';
            const newItem = document.createElement('li');
            newItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            newItem.dataset.produtoId = item.id_produto;
            newItem.dataset.status = item.statusEstoque;

            newItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi me-2 ${isCritico ? 'bi-exclamation-triangle-fill text-danger' : 'bi-exclamation-circle-fill text-warning'}"></i>
                    <div class="ms-1">
                        <div class="fw-semibold">${item.nome}</div>
                        <small class="text-muted">Lote: (não informado)</small> 
                    </div>
                </div>
                <span class="badge rounded-pill ${isCritico ? 'bg-danger' : 'bg-warning text-dark'}">
                    ${item.novaQuantidade} un.
                </span>
            `;
            stockList.prepend(newItem);
        }
    });

    if (stockList.children.length === 0) {
        stockList.innerHTML = `<li class="list-group-item text-center text-muted py-4" id="no-stock-alert">Nenhum lote com baixo estoque.</li>`;
    }
}

export function updatePromocoesCard(promo) {
    const wrapper = document.getElementById('promo-items-wrapper');
    if (!wrapper) return;

    const emptyMessage = wrapper.querySelector('.text-center.text-muted');
    if (emptyMessage) {
        wrapper.innerHTML = '';
    }

    const percentualDesconto = Math.round(((promo.precoOriginal - promo.precoPromocional) / promo.precoOriginal) * 100);

    const cardContainer = document.createElement('div');
    cardContainer.className = 'col-12 col-md-6';
    cardContainer.innerHTML = `
        <div class="promo-card position-relative overflow-hidden h-100 d-flex flex-column border rounded p-3">
            <div class="ribbon bg-danger text-white">-${percentualDesconto}%</div>
            <div class="card-body p-0 d-flex flex-column">
                <h6 class="card-title mb-1">${promo.nome}</h6>
                <small class="text-muted mb-2">Lote: ${promo.lote}</small>
                <div class="mb-3 mt-auto">
                    <span class="text-muted text-decoration-line-through me-2">R$ ${promo.precoOriginal}</span>
                    <span class="h5 text-success mb-0">R$ ${promo.precoPromocional}</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar promo-bar" role="progressbar" data-inicio="${promo.dataInicio}" data-fim="${promo.dataFim}"></div>
                </div>
                <div class="promo-remaining text-end small text-muted mt-1"></div>
            </div>
        </div>
    `;

    wrapper.prepend(cardContainer);
}