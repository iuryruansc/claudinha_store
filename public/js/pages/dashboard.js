import { setupMultiFieldNew } from '/js/lib/multi-field-new.js';
import { showErrorPopup } from '/js/lib/show-error-popup.js';
import { initModalTrigger } from "/js/lib/modal-trigger.js";

document.addEventListener('DOMContentLoaded', () => {
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
            modalEl.querySelector("[data-field=produtoValor]").value = data.preco;
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
            modalEl.querySelector("[data-field=produtoValor]").value = data.preco;
        },
    });

    // Formulário de entrada de produto
    setupMultiFieldNew({
        formSelector: '#formEntradaProduto',
        inputFields: [
            '#modalProdutoId',
            '#numeroLote',
            '#produtoPreco',
            '#quantidade',
            '#dataValidade',
            '#localizacao'
        ],
        selectFields: [],
        requiredFields: [
            'id_produto',
            'numero_lote',
            'preco_produto',
            'quantidade',
            'data_validade',
            'localizacao'
        ],
        redirectUrl: '/admin/dashboard',
        fieldMap: {
            id_produto: '#modalProdutoId',
            preco_produto: '#produtoPreco',
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
});