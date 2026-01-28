document.addEventListener('DOMContentLoaded', () => {
    // MÓDULO DE ESTADO E SELETORES GLOBAIS
    const AppState = {
        itemIndex: 0,
        pagamentoIndex: 0,
        elementos: {
            form: document.getElementById('venda-form'),
            barcodeInput: document.getElementById('codigo-input'),
            addItemBtn: document.getElementById('add-item-btn'),
            itemsContainer: document.getElementById('itens-venda-container'),
            pagamentosContainer: document.getElementById('pagamentos-container'),
            addPagamentoBtn: document.getElementById('add-pagamento-btn'),
            globalDiscountType: document.getElementById('global-discount-type'),
            globalDiscountValue: document.getElementById('global-discount-value'),
            // Seletores para atualização da UI
            spanTotal: document.getElementById('valor_total'),
            spanTotalPago: document.getElementById('total-pago'),
            spanTroco: document.getElementById('troco'),
            spanValorRestante: document.getElementById('valor-restante'),
            restanteRow: document.getElementById('restante-row'),
            trocoRow: document.getElementById('troco-row'),
            finalizarBtn: document.getElementById('finalizar-venda-btn'),
            // Modal de confirmação
            finalizarVendaModal: new bootstrap.Modal(document.getElementById('finalizarVendaModal')),
            btnConfirmarEnvio: document.getElementById('confirmar-envio-btn'),
            // CLIENTE: campo de busca e hidden id (adicionar inputs no EJS)
            clienteSearchInput: document.getElementById('cliente-search'),
            clienteIdInput: document.getElementById('cliente-id'),
            addClienteBtn: document.getElementById('add-client-btn')
        }
    };

    // MÓDULO DE ITENS DA VENDA
    const VendaItemsManager = {
        init() {
            AppState.elementos.addItemBtn.addEventListener('click', () => this.addProductRow(null));
            AppState.elementos.itemsContainer.addEventListener('click', (e) => this.handleItemActions(e));
            AppState.elementos.itemsContainer.addEventListener('change', (e) => this.handleItemChange(e));
            AppState.elementos.itemsContainer.addEventListener('input', (e) => {
                this.handleItemInput(e);
                UIManager.updateAll();
            });
            AppState.elementos.itemsContainer.addEventListener('change', (e) => this.handleDescontoChange(e));
            AppState.elementos.barcodeInput.addEventListener('keydown', (e) => this.handleBarcodeScan(e));
        },

        addProductRow(produto, lote) {
            const row = document.createElement('tr');
            row.classList.add('item-row');

            row.innerHTML = `
        <td>
            <div class="produto-search-wrapper position-relative autocomplete-fix">
                <input type="text" 
                       class="form-control produto-search" 
                       placeholder="Digite para buscar produto..."
                       autocomplete="off">
                <div class="produto-search-results position-absolute w-100 d-none" 
                     style="max-height: 200px; overflow-y: auto; z-index: 1000;">
                </div>
                <input type="hidden" 
                       name="itens[${AppState.itemIndex}][id_produto]" 
                       class="produto-id-input">
            </div>
        </td>
        <td>
            <input type="number" 
                   name="itens[${AppState.itemIndex}][quantidade]" 
                   class="form-control quantidade-input" 
                   value="1" min="1"
                   data-max="999999">
        </td>
        <td class="price-cell">R$ 0,00</td>
        <td>
            <div class="input-group input-group-sm">
                <select class="form-select desconto-tipo-input" style="max-width: 60px;">
                    <option value="none" selected>Sem</option>
                    <option value="porcentagem">%</option>
                    <option value="valor_fixo">R$</option>
                </select>
                <input type="number" 
                       class="form-control desconto-valor-input" 
                       placeholder="0" 
                       min="0" 
                       step="0.01">
            </div>
        </td>
        <td class="text-end">
            <i class="bi bi-trash icon-action remove-item-btn" 
               title="Remover Item" 
               style="cursor: pointer;">
            </i>
        </td>
        <input type="hidden" 
               name="itens[${AppState.itemIndex}][id_lote]" 
               class="lote-id">
        <input type="hidden" 
               name="itens[${AppState.itemIndex}][preco]" 
               class="preco-item">
        <input type="hidden" 
               name="itens[${AppState.itemIndex}][desconto_tipo]" 
               class="desconto-tipo-hidden">
        <input type="hidden" 
               name="itens[${AppState.itemIndex}][desconto_valor]" 
               class="desconto-valor-hidden">
    `;

            AppState.elementos.itemsContainer.appendChild(row);
            this.setupProdutoSearch(row);

            if (produto && lote) {
                const searchInput = row.querySelector('.produto-search');
                const idInput = row.querySelector('.produto-id-input');
                searchInput.value = produto.nome;
                idInput.value = produto.id_produto;
                this.fetchAndFillLote(row, produto.id_produto, lote);
            }

            AppState.itemIndex++;
            UIManager.updateAll();
        },

        setupProdutoSearch(row) {
            const searchInput = row.querySelector('.produto-search');
            const idInput = row.querySelector('.produto-id-input');

            const portal = document.createElement('div');
            portal.className = 'produto-search-portal';
            portal.style.position = 'absolute';
            portal.style.zIndex = '9999';
            portal.style.display = 'none';
            document.body.appendChild(portal);

            function openPortal(html) {
                portal.innerHTML = html;
                portal.style.display = 'block';
                positionPortal();
            }

            function closePortal() {
                portal.style.display = 'none';
            }

            function positionPortal() {
                const rect = searchInput.getBoundingClientRect();
                portal.style.width = rect.width + 'px';
                portal.style.left = rect.left + window.scrollX + 'px';
                portal.style.top = rect.bottom + window.scrollY + 'px';
                portal.style.maxHeight = '300px';
                portal.style.overflowY = 'auto';
                portal.style.background = '#fff';
                portal.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
                portal.style.border = '1px solid #dee2e6';
                portal.style.borderRadius = '4px';
            }

            let debounceTimer;

            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const searchTerm = searchInput.value.toLowerCase().trim();
                    if (searchTerm.length < 2) { closePortal(); return; }

                    const matches = produtos.filter(p =>
                        p.nome.toLowerCase().includes(searchTerm) ||
                        (p.codigo_barras && p.codigo_barras.includes(searchTerm))
                    ).slice(0, 10);

                    if (matches.length) {
                        const html = matches.map(p => `
          <div class="p-2 border-bottom search-result" data-id="${p.id_produto}" style="cursor:pointer;">
            <div class="fw-bold">${p.nome}</div>
            <small class="text-muted">Código: ${p.codigo_barras || 'N/A'}</small>
          </div>
        `).join('');
                        openPortal(html);
                    } else {
                        openPortal('<div class="p-2 text-muted">Nenhum produto encontrado</div>');
                    }
                }, 300);
            });

            // Clique fora fecha o portal
            document.addEventListener('click', (e) => {
                if (e.target === searchInput) return;
                if (!portal.contains(e.target)) closePortal();
            });

            // Seleção de item no portal
            portal.addEventListener('click', (e) => {
                const resultEl = e.target.closest('.search-result');
                if (!resultEl) return;
                const id = resultEl.dataset.id;
                const produto = produtos.find(p => p.id_produto == id);
                searchInput.value = produto.nome;
                idInput.value = id;
                closePortal();
                this.fetchAndFillLote(row, id);
            });

            window.addEventListener('scroll', positionPortal, true);
            window.addEventListener('resize', positionPortal);
        },

        fetchAndFillLote(row, id_produto, preFetchedLote = null) {
            const produtoSelecionado = produtos.find(p => p.id_produto == id_produto);

            if (!produtoSelecionado) {
                showAlert(`Produto com ID ${id_produto} não encontrado nos dados locais.`, 'danger');
                row.querySelector('.price-cell').textContent = 'Erro';
                row.querySelector('.preco-item').value = 0;
                UIManager.updateAll();
                return;
            }

            const precoBaseDoProduto = parseFloat(produtoSelecionado.preco_venda || 0);

            const fillData = (dataDoLote) => {
                const priceCell = row.querySelector('.price-cell');
                const loteInput = row.querySelector('.lote-id');
                const precoInput = row.querySelector('.preco-item');
                const quantidadeInput = row.querySelector('.quantidade-input');

                const precoFinal = precoBaseDoProduto;
                const quantidadeMax = dataDoLote.quantidade_disponivel || 999999;

                priceCell.textContent = `R$ ${UIManager.formatCurrency(precoFinal)}`;
                loteInput.value = dataDoLote.id_lote || '';
                precoInput.value = precoFinal.toFixed(2);
                quantidadeInput.max = quantidadeMax;
                quantidadeInput.dataset.max = quantidadeMax;

                // Validar se a quantidade atual excede o máximo
                if (parseInt(quantidadeInput.value) > quantidadeMax) {
                    quantidadeInput.value = quantidadeMax;
                }

                UIManager.updateAll();
            };

            if (preFetchedLote) {
                fillData(preFetchedLote);
                return;
            }

            fetch(`/admin/vendas/produtos/${id_produto}/lote`)
                .then(res => res.ok ? res.json() : Promise.reject('Nenhum lote'))
                .then(fillData)
                .catch(() => {
                    const priceCell = row.querySelector('.price-cell');
                    priceCell.textContent = '—';
                    row.querySelector('.lote-id').value = '';
                    row.querySelector('.preco-item').value = 0;
                    UIManager.updateAll();
                });
        },

        handleBarcodeScan(e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const codigo = AppState.elementos.barcodeInput.value.trim();
            if (!codigo) return;

            fetch(`/admin/vendas/produtos/codigobarras/${encodeURIComponent(codigo)}`)
                .then(res => res.ok ? res.json() : Promise.reject('Produto não encontrado'))
                .then(({ produto, lote }) => {
                    if (!lote) {
                        showAlert('Este produto não possui lote disponível!', 'warning');
                        return;
                    }
                    this.addProductRow(produto, lote);
                })
                .catch(err => showAlert(err.toString(), 'danger'))
                .finally(() => {
                    AppState.elementos.barcodeInput.value = '';
                    AppState.elementos.barcodeInput.focus();
                });
        },

        handleItemInput(e) {
            // Valida a quantidade máxima permitida
            if (e.target.classList.contains('quantidade-input')) {
                const maxQtd = parseInt(e.target.dataset.max) || 999999;
                const qtdAtual = parseInt(e.target.value) || 0;

                if (qtdAtual > maxQtd) {
                    e.target.value = maxQtd;
                }
                UIManager.updateAll();
            }
        },

        handleDescontoChange(e) {
            if (e.target.classList.contains('desconto-tipo-input')) {
                const row = e.target.closest('tr');
                const tipoHidden = row.querySelector('.desconto-tipo-hidden');
                const valorHidden = row.querySelector('.desconto-valor-hidden');
                const tipoSelect = row.querySelector('.desconto-tipo-input');
                const valorInput = row.querySelector('.desconto-valor-input');

                tipoHidden.value = tipoSelect.value;
                valorHidden.value = valorInput.value || '0';
                UIManager.updateAll();
            } else if (e.target.classList.contains('desconto-valor-input')) {
                const row = e.target.closest('tr');
                const tipoHidden = row.querySelector('.desconto-tipo-hidden');
                const valorHidden = row.querySelector('.desconto-valor-hidden');
                const tipoSelect = row.querySelector('.desconto-tipo-input');
                const valorInput = row.querySelector('.desconto-valor-input');

                tipoHidden.value = tipoSelect.value;
                valorHidden.value = valorInput.value || '0';
                UIManager.updateAll();
            }
        },

        handleItemActions(e) {
            if (e.target.closest('.remove-item-btn')) {
                e.target.closest('tr').remove();
                UIManager.updateAll();
            }
        },

        handleItemChange(e) {
            const sel = e.target.closest('.produto-select');
            if (!sel) return;
            const row = sel.closest('tr');
            const id = sel.value;
            if (id && !isNaN(id)) {
                this.fetchAndFillLote(row, id);
            } else {
                row.querySelector('.price-cell').textContent = '—';
                row.querySelector('.lote-id').value = '';
                row.querySelector('.preco-item').value = 0;
                UIManager.updateAll();
            }
        }
    };

    // MÓDULO DE PAGAMENTOS
    const PagamentoManager = {
        init() {
            AppState.elementos.addPagamentoBtn.addEventListener('click', () => this.addPagamentoRow());
            AppState.elementos.pagamentosContainer.addEventListener('input', (e) => this.handlePagamentoInput(e));
            AppState.elementos.pagamentosContainer.addEventListener('click', (e) => this.handlePagamentoActions(e));
            AppState.elementos.pagamentosContainer.addEventListener('change', (e) => this.handlePagamentoChange(e));
        },

        addPagamentoRow() {
            const div = document.createElement('div');
            div.className = 'row g-3 mb-2 align-items-center pagamento-row';
            let options = formasPagamento.map(fp => `<option value="${fp.id_forma_pagamento}">${fp.nome}</option>`).join('');

            div.innerHTML = `
                <div class="col-md-4"><select name="pagamentos[${AppState.pagamentoIndex}][id_forma_pagamento]" class="form-select forma-pagamento-select">${options}</select></div>
                <div class="col-md-3"><div class="input-group"><span class="input-group-text">R$</span><input type="number" name="pagamentos[${AppState.pagamentoIndex}][valor]" class="form-control valor-pago-input" placeholder="0.00" step="0.01" min="0.01" required></div></div>
                <div class="col-md-3 parcelas-div" style="display: none;"><div class="input-group"><input type="number" name="pagamentos[${AppState.pagamentoIndex}][parcelas]" class="form-control" placeholder="Parcelas" min="1" value="1"><span class="input-group-text">x</span></div></div>
                <div class="col-md-1"><button type="button" class="btn btn-sm btn-outline-danger remove-pagamento-btn"><i class="bi bi-x-circle"></i></button></div>
            `;

            const valorInput = div.querySelector('.valor-pago-input');
            const pagamentosExistentes = AppState.elementos.pagamentosContainer.querySelectorAll('.pagamento-row').length;
            if (pagamentosExistentes === 0) {
                const [_, restante] = UIManager.getCalculatedTotals();
                if (restante > 0) valorInput.value = restante.toFixed(2);
            }

            AppState.elementos.pagamentosContainer.appendChild(div);
            UIManager.updateAll();
            AppState.pagamentoIndex++;
        },

        handlePagamentoInput(e) {
            if (e.target.classList.contains('valor-pago-input')) {
                const valor = parseFloat(e.target.value) || 0;

                const todosInputs = AppState.elementos.pagamentosContainer.querySelectorAll('.valor-pago-input');
                const ehUltimoInput = e.target === todosInputs[todosInputs.length - 1];

                if (ehUltimoInput) {
                    AppState.elementos.addPagamentoBtn.disabled = (valor <= 0);
                }

                UIManager.updateAll();
            }
        },

        handlePagamentoActions(e) {
            if (e.target.closest('.remove-pagamento-btn')) {
                e.target.closest('.pagamento-row').remove();
                UIManager.updateAll();
            }
        },

        handlePagamentoChange(e) {
            if (e.target.classList.contains('forma-pagamento-select')) {
                const selectedText = e.target.options[e.target.selectedIndex].text;
                const parcelasDiv = e.target.closest('.pagamento-row').querySelector('.parcelas-div');
                parcelasDiv.style.display = selectedText.toLowerCase().includes('crédito') ? 'block' : 'none';
            }
        }
    };

    // MÓDULO DE UI (ATUALIZAÇÕES E FORMATAÇÃO)
    const UIManager = {
        init() {
            AppState.elementos.globalDiscountType.addEventListener('change', () => this.updateAll());
            AppState.elementos.globalDiscountValue.addEventListener('input', () => this.updateAll());
            AppState.elementos.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            AppState.elementos.btnConfirmarEnvio.addEventListener('click', () => this.confirmarEnvio());
        },

        formatCurrency(value) {
            return value.toFixed(2).replace('.', ',');
        },

        getCalculatedTotals() {
            let subtotal = 0;
            document.querySelectorAll('.item-row').forEach(row => {
                const qtd = parseInt(row.querySelector('.quantidade-input').value) || 0;
                const preco = parseFloat(row.querySelector('.preco-item').value) || 0;
                const tipoDesconto = row.querySelector('.desconto-tipo-input').value;
                const valorDesconto = parseFloat(row.querySelector('.desconto-valor-input').value) || 0;

                let precoItem = preco * qtd;
                let descontoItem = 0;

                if (tipoDesconto === 'porcentagem' && valorDesconto > 0) {
                    descontoItem = precoItem * (valorDesconto / 100);
                } else if (tipoDesconto === 'valor_fixo' && valorDesconto > 0) {
                    descontoItem = valorDesconto;
                }

                subtotal += precoItem - descontoItem;
            });

            const discountType = AppState.elementos.globalDiscountType.value;
            const discountValue = parseFloat(AppState.elementos.globalDiscountValue.value) || 0;
            let discountAmount = 0;
            if (discountType === 'porcentagem' && discountValue > 0) {
                discountAmount = subtotal * (discountValue / 100);
            } else if (discountType === 'valor_fixo' && discountValue > 0) {
                discountAmount = discountValue;
            }

            const totalVenda = Math.max(0, subtotal - discountAmount);

            let totalPago = 0;
            document.querySelectorAll('.valor-pago-input').forEach(input => {
                totalPago += parseFloat(input.value) || 0;
            });

            const restante = totalVenda - totalPago;

            return [totalVenda, restante, totalPago, subtotal, discountAmount];
        },

        updateAll() {
            const [totalVenda, restante, totalPago, subtotal, discountAmount] = this.getCalculatedTotals();

            // Atualiza Resumo de Preços
            document.getElementById('resumo-subtotal-valor').textContent = `R$ ${this.formatCurrency(subtotal)}`;
            const descontoLinhaEl = document.getElementById('resumo-desconto-linha');
            if (discountAmount > 0) {
                document.getElementById('resumo-desconto-valor').textContent = `- R$ ${this.formatCurrency(discountAmount)}`;
                descontoLinhaEl.classList.remove('d-none');
            } else {
                descontoLinhaEl.classList.add('d-none');
            }
            AppState.elementos.spanTotal.textContent = this.formatCurrency(totalVenda);

            // Atualiza Resumo de Pagamentos
            AppState.elementos.spanTotalPago.textContent = this.formatCurrency(totalPago);
            if (totalVenda <= 0) {
                AppState.elementos.restanteRow.classList.add('d-none');
                AppState.elementos.trocoRow.classList.add('d-none');
            } else if (restante > 0.005) {
                AppState.elementos.spanValorRestante.textContent = this.formatCurrency(restante);
                AppState.elementos.restanteRow.classList.remove('d-none');
                AppState.elementos.trocoRow.classList.add('d-none');
            } else {
                const troco = Math.abs(restante);
                AppState.elementos.spanTroco.textContent = this.formatCurrency(troco);
                AppState.elementos.trocoRow.classList.remove('d-none');
                AppState.elementos.restanteRow.classList.add('d-none');
            }

            // Atualiza Botão Finalizar
            if (totalVenda <= 0) {
                AppState.elementos.finalizarBtn.disabled = true;
                AppState.elementos.finalizarBtn.innerHTML = '<i class="bi bi-cart-x"></i> Adicione produtos para iniciar';
            } else if (restante > 0.005) {
                AppState.elementos.finalizarBtn.disabled = false;
                AppState.elementos.finalizarBtn.className = 'btn btn-warning btn-lg';
                AppState.elementos.finalizarBtn.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Finalizar com Pendência de R$ ${this.formatCurrency(restante)}`;
            } else {
                AppState.elementos.finalizarBtn.disabled = false;
                AppState.elementos.finalizarBtn.className = 'btn btn-success btn-lg';
                AppState.elementos.finalizarBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Finalizar Venda';
            }

            // Atualiza visibilidade da tabela de itens
            const itemsContainer = AppState.elementos.itemsContainer;
            const placeholder = document.getElementById('itens-venda-placeholder');
            const tableWrapper = document.getElementById('tabela-itens-wrapper');
            if (itemsContainer.children.length > 0) {
                placeholder.style.display = 'none';
                tableWrapper.style.display = 'block';
            } else {
                placeholder.style.display = 'block';
                tableWrapper.style.display = 'none';
            }
            document.getElementById('desconto_input').value = discountAmount.toFixed(2);
        },

        handleFormSubmit(event) {
            event.preventDefault();
            const [totalVenda, restante, totalPago] = this.getCalculatedTotals();

            document.getElementById('modal-total-venda').textContent = `R$ ${this.formatCurrency(totalVenda)}`;
            document.getElementById('modal-total-pago').textContent = `R$ ${this.formatCurrency(totalPago)}`;

            const resumoFinalLabel = document.getElementById('modal-resumo-final-label');
            const resumoFinalValor = document.getElementById('modal-resumo-final-valor');

            if (restante > 0.005) {
                resumoFinalLabel.textContent = 'Valor Restante:';
                resumoFinalValor.textContent = `R$ ${this.formatCurrency(restante)}`;
                resumoFinalValor.className = 'badge rounded-pill fs-6 bg-warning text-dark';
            } else {
                const troco = Math.abs(restante);
                resumoFinalLabel.textContent = 'Troco:';
                resumoFinalValor.textContent = `R$ ${this.formatCurrency(troco)}`;
                resumoFinalValor.className = 'badge rounded-pill fs-6 bg-success';
            }
            AppState.elementos.finalizarVendaModal.show();
        },

        confirmarEnvio() {
            AppState.elementos.finalizarVendaModal.hide();
            AppState.elementos.form.submit();
        }
    };

    // MÓDULO DE CLIENTES (autocomplete + validação)
    const ClientManager = {
        clients: window.clientes || [],

        DEFAULT_ID() {
            // tenta primeiro o hidden input no DOM; depois window.clienteDefaultId; por fim 1
            const hid = AppState.elementos.clienteIdInput;
            if (hid && hid.value) return String(hid.value);
            if (typeof window.clienteDefaultId !== 'undefined') return String(window.clienteDefaultId);
            return '1';
        },

        init() {
            if (!AppState.elementos.clienteSearchInput) return;
            this.setupClienteSearch();

            // validação ao submeter: garante cliente padrão (anônimo)
            if (AppState.elementos.form) {
                AppState.elementos.form.addEventListener('submit', () => {
                    const id = AppState.elementos.clienteIdInput?.value || '';
                    const valid = this.clients.some(c => String(c.id_cliente) === String(id));
                    if (!valid && AppState.elementos.clienteIdInput) {
                        AppState.elementos.clienteIdInput.value = this.DEFAULT_ID();
                    }
                });
            }
        },

        setupClienteSearch() {
            const input = AppState.elementos.clienteSearchInput;
            const idInput = AppState.elementos.clienteIdInput;
            const portal = document.createElement('div');
            portal.className = 'cliente-search-portal';
            portal.style.position = 'absolute';
            portal.style.zIndex = '9999';
            portal.style.display = 'none';
            document.body.appendChild(portal);

            const positionPortal = () => {
                const rect = input.getBoundingClientRect();
                portal.style.width = rect.width + 'px';
                portal.style.left = rect.left + window.scrollX + 'px';
                portal.style.top = rect.bottom + window.scrollY + 'px';
                portal.style.maxHeight = '300px';
                portal.style.overflowY = 'auto';
                portal.style.background = '#fff';
                portal.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
                portal.style.border = '1px solid #dee2e6';
                portal.style.borderRadius = '4px';
            };

            let debounceTimer;
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const q = (input.value || '').trim().toLowerCase();
                    if (q.length < 2) { portal.style.display = 'none'; return; }

                    const matches = this.clients.filter(c =>
                        (c.nome || '').toLowerCase().includes(q) ||
                        (c.cpf || '').replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
                        (c.email || '').toLowerCase().includes(q)
                    ).slice(0, 10);

                    if (!matches.length) {
                        portal.innerHTML = '<div class="p-2 text-muted">Nenhum cliente encontrado</div>';
                    } else {
                        portal.innerHTML = matches.map(c => `
                        <div class="p-2 border-bottom cliente-search-result" data-id="${c.id_cliente}" style="cursor:pointer; background:#fff;">
                            <div class="fw-bold">${c.nome}</div>
                            <small class="text-muted">${c.cpf || c.email || ''}</small>
                        </div>
                    `).join('');
                    }
                    positionPortal();
                    portal.style.display = 'block';
                }, 200);
            });

            document.addEventListener('click', (e) => {
                if (e.target === input) return;
                if (!portal.contains(e.target)) portal.style.display = 'none';
            });

            portal.addEventListener('click', (e) => {
                const el = e.target.closest('.cliente-search-result');
                if (!el) return;
                const id = el.dataset.id;
                const cliente = this.clients.find(c => String(c.id_cliente) === String(id));
                if (!cliente) return;
                input.value = cliente.nome;
                if (idInput) idInput.value = cliente.id_cliente;
                portal.style.display = 'none';
            });

            window.addEventListener('scroll', positionPortal, true);
            window.addEventListener('resize', positionPortal);
            input.addEventListener('focus', positionPortal);
        }
    };

    // INICIALIZAÇÃO
    function init() {
        AppState.elementos.barcodeInput.focus();
        VendaItemsManager.init();
        PagamentoManager.init();
        UIManager.init();
        ClientManager.init();

        PagamentoManager.addPagamentoRow();
        UIManager.updateAll();
    }

    init();
});