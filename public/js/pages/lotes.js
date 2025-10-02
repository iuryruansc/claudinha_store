import { setupRowDelete } from '/js/lib/delete-handler.js';
import * as socket from '/js/services/socket-service.js';
import * as updaters from '/js/ui/lotes-updaters.js';

function setupWebSocketListeners() {
    socket.on('lote:novo', (loteData) => {
        updaters.adicionarLinhaLote(loteData);
        Toastify({ text: `Novo lote de ${loteData.produtoNome} adicionado!`, backgroundColor: "#0d6efd" }).showToast();
    });

    socket.on('lote:atualizado', (loteData) => {
        updaters.atualizarLinhaLote(loteData);
    });

    socket.on('lote:removido', (data) => {
        updaters.removerLinhaLote(data);
        Toastify({ text: `Lote #${data.id_lote} removido.`, backgroundColor: "#dc3545" }).showToast();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('lotes-table-body');
    if (!tableBody) return;

    new bootstrap.Tooltip(tableBody, {
        selector: '[data-bs-toggle="tooltip"]'
    })

    const deleteForms = document.querySelectorAll('[data-delete-form]');
    const toggleExcluir = document.getElementById('toggleExcluir');
    setupRowDelete(deleteForms, toggleExcluir, tableBody);

    const addQuantidadeModalEl = document.getElementById('addQuantidadeModal');
    const addQuantidadeForm = document.getElementById('add-quantidade-form');
    const editLoteModalEl = document.getElementById('editLoteModal');
    const editLoteForm = document.getElementById('edit-lote-form');
    const editLoteModal = new bootstrap.Modal(editLoteModalEl);

    tableBody.addEventListener('click', async function (event) {
        const addButton = event.target.closest('button[data-bs-target="#addQuantidadeModal"]');
        if (addButton) {
            const produtoNome = addButton.getAttribute('data-produto-nome');
            const loteNumero = addButton.getAttribute('data-lote-numero');
            const loteId = addButton.getAttribute('data-lote-id');

            addQuantidadeModalEl.querySelector('#modal-produto-nome').textContent = produtoNome;
            addQuantidadeModalEl.querySelector('#modal-lote-numero').textContent = loteNumero;
            addQuantidadeModalEl.querySelector('#add-quantidade-form').action = `/admin/lotes/add-quantidade/${loteId}`;

            setTimeout(() => addQuantidadeModalEl.querySelector('#modal-quantidade').focus(), 500);
        }

        const editButton = event.target.closest('button[data-bs-target="#editLoteModal"]');
        if (editButton) {
            const loteId = editButton.getAttribute('data-lote-id');
            const modalBody = editLoteModalEl.querySelector('.modal-body');
            modalBody.classList.add('loading');

            try {
                const response = await fetch(`/admin/lotes/json/${loteId}`);
                if (!response.ok) throw new Error('Falha ao carregar dados do lote.');
                const lote = await response.json();

                editLoteModalEl.querySelector('#edit-produto-nome').textContent = lote.produto?.nome || 'N/A';

                editLoteModalEl.querySelector('#edit-lote-form').action = `/admin/lotes/update/${lote.id_lote}`;
            } catch (error) {
                alert(error.message);
                editLoteModal.hide();
            } finally {
                modalBody.classList.remove('loading');
            }
        }
    });

    addQuantidadeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const url = form.action;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const loteFormatado = await response.json();

                updaters.atualizarLinhaLote(loteFormatado);

                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addQuantidadeModal'));
                modalInstance.hide();
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao adicionar quantidade');
            }
        } catch (err) {
            alert('Erro de rede ou inesperado.');
            console.error(err);
        }
    });

    addQuantidadeModalEl.addEventListener('hidden.bs.modal', function () {
        addQuantidadeForm.reset();
        addQuantidadeForm.action = '';
    });

    editLoteModalEl.addEventListener('hidden.bs.modal', function () {
        editLoteForm.reset();
        editLoteForm.action = '';
    });

    const btnFiltrar = document.getElementById('filtrar-estoque-baixo');
    const btnLimpar = document.getElementById('limpar-filtro-estoque');
    const todasAsLinhas = document.querySelectorAll('#lotes-table-body tr');

    if (!btnFiltrar) {
        return;
    }

    btnFiltrar.addEventListener('click', (e) => {
        e.preventDefault();

        todasAsLinhas.forEach(linha => {
            const statusQtd = linha.dataset.quantidade;
            if (statusQtd === 'ok') {
                linha.style.display = 'none';
            } else {
                linha.style.display = '';
            }
        });

        btnFiltrar.style.display = 'none';
        btnLimpar.style.display = 'inline-block';
    });

    btnLimpar.addEventListener('click', (e) => {
        e.preventDefault();

        todasAsLinhas.forEach(linha => {
            linha.style.display = '';
        });

        btnLimpar.style.display = 'none';
        btnFiltrar.style.display = 'inline-block';
    });

    setupWebSocketListeners()
});