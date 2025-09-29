
const produtos = window.salesData?.produtos || [];
const formasPagamento = window.salesData?.formasPagamento || []

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
        }
    };

    // MÓDULO DE ITENS DA VENDA
    const VendaItemsManager = {
        init() {
            AppState.elementos.addItemBtn.addEventListener('click', () => this.addProductRow(null));
            AppState.elementos.itemsContainer.addEventListener('click', (e) => this.handleItemActions(e));
            AppState.elementos.itemsContainer.addEventListener('change', (e) => this.handleItemChange(e));
            AppState.elementos.itemsContainer.addEventListener('input', () => UIManager.updateAll());
            AppState.elementos.barcodeInput.addEventListener('keydown', (e) => this.handleBarcodeScan(e));
        },

        addProductRow(produto, lote) {
            const row = document.createElement('tr');
            row.classList.add('item-row');
            let options = produtos.map(p => `<option value="${p.id_produto}">${p.nome}</option>`).join('');

            row.innerHTML = `
                <td><select name="itens[${AppState.itemIndex}][id_produto]" class="form-select produto-select"><option value="">Selecione...</option>${options}</select></td>
                <td><input type="number" name="itens[${AppState.itemIndex}][quantidade]" class="form-control quantidade-input" value="1" min="1"></td>
                <td class="price-cell">R$ 0,00</td>
                <td class="text-end"><i class="bi bi-trash icon-action remove-item-btn" title="Remover Item" style="cursor: pointer;"></i></td>
                <input type="hidden" name="itens[${AppState.itemIndex}][id_lote]" class="lote-id"><input type="hidden" name="itens[${AppState.itemIndex}][preco]" class="preco-item">
            `;
            AppState.elementos.itemsContainer.appendChild(row);

            if (produto && lote) {
                const sel = row.querySelector('.produto-select');
                sel.value = produto.id_produto;
                this.fetchAndFillLote(row, produto.id_produto, lote);
            }
            AppState.itemIndex++;
            UIManager.updateAll();
        },

        fetchAndFillLote(row, id_produto, preFetchedLote = null) {
            const fillData = (data) => {
                const priceCell = row.querySelector('.price-cell');
                const loteInput = row.querySelector('.lote-id');
                const precoInput = row.querySelector('.preco-item');
                const precoFinal = parseFloat(data.preco_final ?? data.preco_produto ?? 0);

                priceCell.textContent = `R$ ${UIManager.formatCurrency(precoFinal)}`;
                loteInput.value = data.id_lote || '';
                precoInput.value = precoFinal.toFixed(2);
                UIManager.updateAll();
            };

            if (preFetchedLote) {
                fillData(preFetchedLote);
                return;
            }

            fetch(`/funcionario/vendas/produtos/${id_produto}/lote`)
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

            fetch(`/funcionario/vendas/produtos/codigobarras/${encodeURIComponent(codigo)}`)
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
                <div class="col-md-4"><div class="input-group"><span class="input-group-text">R$</span><input type="number" name="pagamentos[${AppState.pagamentoIndex}][valor]" class="form-control valor-pago-input" placeholder="0.00" step="0.01" min="0.01" required></div></div>
                <div class="col-md-2 parcelas-div" style="display: none;"><div class="input-group"><input type="number" name="pagamentos[${AppState.pagamentoIndex}][parcelas]" class="form-control" placeholder="Parcelas" min="1" value="1"><span class="input-group-text">x</span></div></div>
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
                subtotal += preco * qtd;
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

    // INICIALIZAÇÃO
    function init() {
        AppState.elementos.barcodeInput.focus();
        VendaItemsManager.init();
        PagamentoManager.init();
        UIManager.init();

        PagamentoManager.addPagamentoRow();
        UIManager.updateAll();
    }

    init();
});