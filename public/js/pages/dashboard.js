import { setupMultiFieldNew } from '/js/lib/multi-field-new.js';
import { showErrorPopup } from '/js/lib/show-error-popup.js';
import { initModalTrigger } from "/js/lib/modal-trigger.js";

import * as socket from '../services/socket-service.js';
import * as updaters from '/js/ui/dashboard-updaters.js';

function setupWebSocketListeners() {
    socket.on('dashboard:vendaRealizada', (data) => {
        console.log('Dashboard deve ser atualizado!', data);

        if (data.resumoCaixa) {
            updaters.updateCaixaCard(data.resumoCaixa);
        }
        if (data.novaAtividade) {
            updaters.updateFeedAtividade(data.novaAtividade);
        }
        if (data.novaVenda) {
            updaters.updatePagamentosRecentes(data.novaVenda);
        }
        if (data.atualizacaoEstoque) {
            updaters.updateAlertasEstoque(data.atualizacaoEstoque);
        }

        Toastify({
            text: `Nova venda de ${formatCurrency(data.novaVenda.valor)} por ${data.novaVenda.vendedor}!`,
            duration: 5000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
    });

    socket.on('dashboard:novaPromocao', (data) => {
        console.log('Nova promoção recebida!', data);

        updaters.updatePromocoesCard(data);

        ordenarPromocoes();
        atualizarBarrasDePromocao();

        Toastify({
            text: `Nova promoção para ${data.nome}!`,
            duration: 5000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #0d6efd, #6f42c1)",
        }).showToast();
    });
}

function formatCurrency(value) {
    return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


document.addEventListener('DOMContentLoaded', () => {

    function initStockFilter() {
        const filterButtons = document.getElementById('stock-filter-buttons');
        const stockList = document.getElementById('stock-list');

        if (!filterButtons || !stockList) {
            console.error('Elementos do filtro de estoque não encontrados.');
            return;
        }

        filterButtons.addEventListener('change', (event) => {
            const selectedStatus = event.target.value;
            const items = stockList.querySelectorAll('li.list-group-item');

            items.forEach(item => {
                if (selectedStatus === 'all' || item.dataset.status === selectedStatus) {
                    item.classList.remove('item-hidden');
                } else {
                    item.classList.add('item-hidden');
                }
            });
        });
    }

    function ordenarPromocoes() {
        const wrapper = document.getElementById('promo-items-wrapper');
        if (!wrapper) return;

        const cards = Array.from(wrapper.children);
        if (cards.length < 2) return;

        cards.sort((cardA, cardB) => {
            const promoBarA = cardA.querySelector('.promo-bar');
            const promoBarB = cardB.querySelector('.promo-bar');

            if (!promoBarA || !promoBarB) return 0;

            const dataFimA = new Date(promoBarA.dataset.fim);
            const dataFimB = new Date(promoBarB.dataset.fim);

            if (isNaN(dataFimA) || isNaN(dataFimB)) return 0;

            return dataFimA - dataFimB;
        });

        cards.forEach(card => wrapper.appendChild(card));
    }

    function atualizarBarrasDePromocao() {
        const promoBars = document.querySelectorAll('.promo-bar');
        const agora = new Date();

        promoBars.forEach(bar => {
            const inicio = new Date(bar.dataset.inicio);
            const fim = new Date(bar.dataset.fim);

            if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) return;

            const duracaoTotal = fim - inicio;
            const tempoRestante = fim - agora;

            let progresso = (tempoRestante / duracaoTotal) * 100;
            progresso = Math.max(0, Math.min(100, progresso));

            bar.style.width = `${progresso}%`;
            bar.classList.remove('bg-success', 'bg-warning', 'bg-danger', 'bg-secondary');

            if (tempoRestante <= 0) {
                bar.classList.add('bg-secondary');
            } else if (progresso <= 20) {
                bar.classList.add('bg-danger');
            } else if (progresso <= 50) {
                bar.classList.add('bg-warning');
            } else {
                bar.classList.add('bg-success');
            }

            const remainingEl = bar.closest('.promo-card, .card').querySelector('.promo-remaining');
            if (remainingEl) {
                if (tempoRestante > 0) {
                    const dias = Math.floor(tempoRestante / (1000 * 60 * 60 * 24));
                    const horas = Math.floor((tempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));

                    if (dias > 0) { remainingEl.textContent = `Termina em ${dias}d ${horas}h`; }
                    else if (horas > 0) { remainingEl.textContent = `Termina em ${horas}h ${minutos}m`; }
                    else { remainingEl.textContent = `Termina em ${minutos}m`; }
                } else {
                    remainingEl.textContent = 'Promoção encerrada';
                }
            }
        });
    }

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));

    // Configuração Modal de Lote
    initModalTrigger({
        btnSelector: "#btnIniciarEntrada",
        inputSelector: "#cardCodigoBarra",
        modalSelector: "#entradaProdutoModal",
        endpoint: "/admin/dashboard/entrada/iniciar",
        onError: showErrorPopup,
        onSuccess: (data, modalEl) => {
            modalEl.querySelector("[data-field=produtoId]").value = data.id_produto;
            modalEl.querySelector("[data-field=produtoNome]").value = data.nome;
            modalEl.querySelector("[data-field=produtoValorCompra]").value = data.preco_compra;
            modalEl.querySelector("[data-field=produtoValorVenda]").value = data.preco_venda;
        },
    });

    // Configuração Modal de Promoção
    initModalTrigger({
        btnSelector: '#btnIniciarPromocao',
        inputSelector: '#promocaoCodigoBarra',
        modalSelector: '#promocaoModal',
        endpoint: '/admin/dashboard/entrada/iniciar',
        onError: showErrorPopup,
        onSuccess: (data, modalEl) => {
            modalEl.querySelector("#modalDescProdutoId").value = data.id_produto;
            modalEl.querySelector("#modalDescProdutoNome").value = data.nome;
            modalEl.querySelector("[data-field=produtoValorCompra]").value = data.preco_compra;
            modalEl.querySelector("[data-field=produtoValorVenda]").value = data.preco_venda;
        },
    });

    // Formulário de entrada de produto
    setupMultiFieldNew({
        formSelector: '#formEntradaProduto',
        inputFields: [
            '#modalProdutoId',
            '#numeroLote',
            '#produtoPrecoCompra',
            '#produtoPrecoVenda',
            '#quantidade',
            '#dataValidade',
            '#localizacao'
        ],
        selectFields: [],
        requiredFields: [
            'id_produto',
            'numero_lote',
            'preco_produto_compra',
            'preco_produto_venda',
            'quantidade',
            'data_validade',
        ],
        redirectUrl: '/admin/dashboard',
        fieldMap: {
            id_produto: '#modalProdutoId',
            preco_produto_compra: '#produtoPrecoCompra',
            preco_produto_venda: '#produtoPrecoVenda',
            numero_lote: '#numeroLote',
            quantidade: '#quantidade',
            data_validade: '#dataValidade',
            localizacao: '#localizacao'
        },
        errorMessages: {
            network: 'Erro de rede ao criar lote.'
        },
    })

    // Formulário de promoção
    setupMultiFieldNew({
        formSelector: '#formDesconto',
        inputFields: [
            '#modalDescProdutoId',
            '#modalDescValor',
            '#modalDescInicio',
            '#modalDescFim',
            '#modalDescObservacao'
        ],
        selectFields: [
            '#modalDescTipo'
        ],
        requiredFields: [
            'id_produto',
            'tipo',
            'valor',
            'data_inicio',
            'data_fim'
        ],

        redirectUrl: '/admin/dashboard',
        fieldMap: {
            id_produto: '#modalDescProdutoId',
            tipo: '#modalDescTipo',
            valor: '#modalDescValor',
            data_inicio: '#modalDescInicio',
            data_fim: '#modalDescFim',
            observacao: '#modalDescObservacao'
        },
        errorMessages: {
            network: 'Erro de rede ao criar desconto.'
        }
    });

    // Limpa os modais ao fechar
    document.getElementById('entradaProdutoModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('formEntradaProduto').reset();
    });

    document.getElementById('promocaoModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('formDesconto').reset();
    });

    atualizarBarrasDePromocao();
    ordenarPromocoes();
    initStockFilter();
    setInterval(atualizarBarrasDePromocao, 60000);

    setupWebSocketListeners();
});