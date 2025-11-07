import { setupRowDelete } from '/js/lib/delete-handler.js';

function criarHtmlCelulasLote(lote) {
    return `
        <td>${lote.produtoNome}</td>
        <td>${lote.precoCompraFormatado}</td>
        <td>${lote.precoVendaFormatado ?? ''}</td>
        <td class="text-center">${lote.numero_lote}</td>
        <td class="text-center fw-bold">${lote.quantidade}</td>
        <td>${lote.localizacao}</td>
        <td>${lote.statusTexto}</td>
        <td class="text-center">
            <div class="btn-group">
                <button class="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#addQuantidadeModal" data-lote-id="${lote.id_lote}" data-produto-nome="${lote.produtoNome}" data-lote-numero="${lote.numero_lote}" title="Adicionar quantidade">
                    <i class="bi bi-plus-lg"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary edit-lote-btn" data-bs-toggle="modal" data-bs-target="#editLoteModal" data-lote-id="${lote.id_lote}" title="Editar lote">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <form data-delete-form class="d-inline" action="/admin/lotes/delete/${lote.id_lote}" method="POST">
                    <input type="hidden" name="id_lote" value="${lote.id_lote}">
                    <button type="submit" class="btn btn-sm btn-outline-danger excluir-btn" data-bs-toggle="tooltip" title="Excluir lote" style="display: none;">
                        <i class="bi bi-trash"></i>
                    </button>
                </form>
            </div>
        </td>
    `;
}

export function adicionarLinhaLote(lote) {
    const tableBody = document.getElementById('lotes-table-body');
    if (!tableBody) return;

    const linhaExistente = tableBody.querySelector(`tr[data-lote-id="${lote.id_lote}"]`);
    if (linhaExistente) {
        atualizarLinhaLote(lote);
        return;
    }

    const novaLinha = document.createElement('tr');
    novaLinha.dataset.loteId = lote.id_lote;
    novaLinha.dataset.validade = lote.statusValidade;
    novaLinha.dataset.quantidade = lote.statusQuantidade;

    novaLinha.innerHTML = criarHtmlCelulasLote(lote);

    tableBody.prepend(novaLinha);

    novaLinha.classList.add('table-success');
    setTimeout(() => novaLinha.classList.remove('table-success'), 2000);
}

export function atualizarLinhaLote(lote) {
    const linha = document.querySelector(`tr[data-lote-id="${lote.id_lote}"]`);
    if (!linha) {
        adicionarLinhaLote(lote);
        return;
    }

    linha.dataset.validade = lote.statusValidade;
    linha.dataset.quantidade = lote.statusQuantidade;
    linha.innerHTML = criarHtmlCelulasLote(lote);

    const btnsTooltip = linha.querySelectorAll('[data-bs-toggle="tooltip"]');
    btnsTooltip.forEach(el => new bootstrap.Tooltip(el));

    const deleteForm = linha.querySelector('[data-delete-form]');
    if (deleteForm) {
        setupRowDelete([deleteForm], document.getElementById('toggleExcluir'), document.getElementById('lotes-table-body'));
    }

    linha.classList.add('table-info');
    setTimeout(() => linha.classList.remove('table-info'), 1500);
}


export function removerLinhaLote({ id_lote }) {
    const linha = document.querySelector(`tr[data-lote-id="${id_lote}"]`);
    if (linha) {
        linha.classList.add('table-danger');
        setTimeout(() => linha.remove(), 500);
    }
}