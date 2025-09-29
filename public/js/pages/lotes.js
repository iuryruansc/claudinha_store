import { setupRowDelete } from '/js/delete-handler.js';

document.addEventListener('DOMContentLoaded', function () {
    const deleteForms = document.querySelectorAll('[data-delete-form]');
    const toggleExcluir = document.getElementById('toggleExcluir');
    const tableBody = document.getElementById('lotes-table-body');

    const tooltipTriggerList = document.querySelectorAll('[title]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    setupRowDelete(deleteForms, toggleExcluir, tableBody);

    const addQuantidadeModal = document.getElementById('addQuantidadeModal');
    const addQuantidadeForm = document.getElementById('add-quantidade-form');
    const modalInstanceAdd = new bootstrap.Modal(addQuantidadeModal);

    addQuantidadeModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const loteId = button.getAttribute('data-lote-id');
        const produtoNome = button.getAttribute('data-produto-nome');
        const loteNumero = button.getAttribute('data-lote-numero');

        addQuantidadeModal.querySelector('#modal-produto-nome').textContent = produtoNome;
        addQuantidadeModal.querySelector('#modal-lote-numero').textContent = loteNumero;

        addQuantidadeForm.action = `/admin/lotes/add-quantidade/${loteId}`;

        const quantidadeInput = addQuantidadeModal.querySelector('#modal-quantidade');
        setTimeout(() => quantidadeInput.focus(), 500);
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
                const loteAtualizado = await response.json();

                const tableRow = document.querySelector(`button[data-lote-id="${loteAtualizado.id_lote}"]`).closest('tr');
                if (tableRow) {
                    const qtdCell = tableRow.cells[2];
                    qtdCell.textContent = `${loteAtualizado.quantidade} unidades`;
                    updateLoteRowStyle(tableRow, loteAtualizado);
                }

                modalInstanceAdd.hide();
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao adicionar quantidade');
            }
        } catch (err) {
            alert('Erro de rede ou inesperado.');
            console.error(err);
        }
    });

    addQuantidadeModal.addEventListener('hidden.bs.modal', function () {
        addQuantidadeForm.reset();
        addQuantidadeForm.action = '';
    });

    const editLoteModal = document.getElementById('editLoteModal');
    const editLoteForm = document.getElementById('edit-lote-form');

    editLoteModal.addEventListener('show.bs.modal', async function (event) {
        const button = event.relatedTarget;
        const loteId = button.getAttribute('data-lote-id');

        const modalBody = editLoteModal.querySelector('.modal-body');
        modalBody.classList.add('loading');

        try {
            const response = await fetch(`/admin/lotes/json/${loteId}`);
            if (!response.ok) {
                throw new Error('Não foi possível carregar os dados do lote.');
            }
            const lote = await response.json();

            editLoteModal.querySelector('#edit-produto-nome').textContent = lote.produto?.nome || 'N/A';
            editLoteModal.querySelector('#edit-id-lote').value = lote.id_lote;
            editLoteModal.querySelector('#edit-numero-lote').value = lote.numero_lote;
            editLoteModal.querySelector('#edit-quantidade').value = lote.quantidade;
            editLoteModal.querySelector('#edit-localizacao').value = lote.localizacao;

            if (lote.data_validade) {
                const data = new Date(lote.data_validade);
                const formattedDate = data.toISOString().split('T')[0];
                editLoteModal.querySelector('#edit-data-validade').value = formattedDate;
            }

            editLoteForm.action = `/admin/lotes/update/${lote.id_lote}`;

        } catch (error) {
            console.error(error);
            alert(error.message);
            bootstrap.Modal.getInstance(editLoteModal).hide();
        } finally {
            modalBody.classList.remove('loading');
        }
    });

    editLoteModal.addEventListener('hidden.bs.modal', function () {
        editLoteForm.reset();
        editLoteForm.action = '';
    });

    function updateLoteRowStyle(tableRow, lote) {
        // 1. Lógica para o status da validade (copiada do EJS)
        const hoje = new Date();
        const dataValidade = new Date(lote.data_validade);
        const diffDias = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));

        let rowClass = '';
        let statusTexto = `Válido até ${dataValidade.toLocaleDateString('pt-BR')}`;

        if (diffDias < 0) {
            rowClass = 'table-danger';
            statusTexto = `Vencido há ${Math.abs(diffDias)} dia(s)`;
        } else if (diffDias <= 30) {
            rowClass = 'table-warning';
            statusTexto = `Vence em ${diffDias} dia(s)`;
        }

        // Remove classes antigas e adiciona a nova
        tableRow.classList.remove('table-danger', 'table-warning');
        if (rowClass) {
            tableRow.classList.add(rowClass);
        }
        // Atualiza o texto da validade (5ª célula, índice 4)
        tableRow.cells[4].textContent = statusTexto;

        // 2. Lógica para a quantidade
        const qtd = lote.quantidade;
        let qtdClass = '';
        if (qtd === 0) {
            qtdClass = 'text-danger fw-bold';
        } else if (qtd <= 10) { // Lembre-se de usar o mesmo limite do seu EJS
            qtdClass = 'text-warning fw-bold';
        }

        // Atualiza a célula da quantidade (3ª célula, índice 2)
        const qtdCell = tableRow.cells[2];
        qtdCell.textContent = qtd;
        qtdCell.className = 'text-center'; // Reseta as classes
        if (qtdClass) {
            qtdCell.classList.add(...qtdClass.split(' '));
        }
    }
});