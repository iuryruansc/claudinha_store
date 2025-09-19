const connection = require('../../database/database');
const Venda = require('../../models/venda');
const Caixa = require('../../models/caixa');
const Cliente = require('../../models/cliente');
const Funcionario = require('../../models/funcionario');
const ItemVenda = require('../../models/itemVenda');
const Lote = require('../../models/lote');
const Produto = require('../../models/produto');
const Pagamento = require('../../models/pagamento')
const MovimentacaoEstoque = require('../../models/movimentacaoEstoque');
const { modelValidation } = require('../../utils/data/data-validation');

const findVendaById = async (id) => {
    const venda = await Venda.findByPk(id, {
        include: [{ model: ItemVenda }]
    });
    modelValidation(venda);
    return venda;
};

const getViewDependencies = async () => {
    const [caixas, clientes, funcionarios, produtos] = await Promise.all([
        Caixa.findAll(),
        Cliente.findAll(),
        Funcionario.findAll(),
        Produto.findAll()
    ]);
    return { caixas, clientes, funcionarios, produtos };
};

const getAllVendas = async () => {
    const vendasPromise = Venda.findAll({
        include: [{ model: ItemVenda }]
    });
    const dependenciesPromise = getViewDependencies();

    const [vendas, dependencies] = await Promise.all([vendasPromise, dependenciesPromise]);

    return { vendas, ...dependencies };
};

const getEditData = async (id) => {
    const vendaPromise = findVendaById(id);
    const dependenciesPromise = getViewDependencies()

    const [venda, dependencies] = await Promise.all([vendaPromise, dependenciesPromise]);

    return { venda, ...dependencies };
};

const createVenda = async (vendaData) => {
    // Automatically handling commit/rollback
    const result = await connection.transaction(async (t) => {
        // Creating main 'Venda'
        const novaVenda = await Venda.create({
            valor_total: vendaData.valor_total,
            status: vendaData.status || 'PENDENTE',
        }, { transaction: t });

        const idVenda = novaVenda.id_venda;
        
        const produtoIds = vendaData.itens.map(item => item.id_produto);
        const produtos = await Produto.findAll({
            where: { id_produto: produtoIds },
            transaction: t
        });

        const produtoMap = new Map(produtos.map(p => [p.id_produto, p]));

        const itensParaCriar = [];

        // Processing each item from the sale
        for (const item of vendaData.itens) {
            const produto = produtoMap.get(item.id_produto);

            // Validate product existence and fetch its price
            if (!produto) {
                throw new Error(`Produto ID: ${item.id_produto} não encontrado.`);
            }

            // Finding the current product on the stock
            const lote = await Lote.findOne({
                where: { id_produto: item.id_produto },
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            // Checking if the stock has sufficient quantity
            if (!lote || lote.quantidade < item.quantidade) {
                throw new Error(`Estoque insuficiente para o produto ID: ${item.id_produto}`);
            }

            // Decreasing the quantity in Estoque
            await lote.decrement('quantidade', {
                by: item.quantidade,
                transaction: t
            });

            // Creating the MovimentacaoEstoque record
            await MovimentacaoEstoque.create({
                id_lote: lote.id_lote,
                data_hora: new Date(),
                tipo: 'saida_venda',
                quantidade: -item.quantidade,
                id_funcionario: idFuncionario,
                id_venda: idVenda
            }, { transaction: t });

            // Add the ItemVenda record to the bulk create array
            itensParaCriar.push({
                id_venda: idVenda,
                id_lote: item.id_lote,
                quantidade: item.quantidade,
                preco_unitario: produto.preco
            });
        }

        await ItemVenda.bulkCreate(itensParaCriar, { transaction: t })

        return novaVenda
    });

    return result;
};

const updateVenda = async (id, updateData) => {
    return await connection.transaction(async (t) => {
        // Find the current sale, its items, and its payment within a lock
        const venda = await Venda.findByPk(id, {
            include: [{ model: ItemVenda, as: 'itens' }, { model: Pagamento, as: 'pagamentos' }],
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!venda) {
            throw new Error('Venda não encontrada.');
        }

        // Revert all old item quantities back to stock and delete old items and payments
        for (const item of venda.itens) {
            await updateStockAndMovimentacao(t, item.id_produto, item.quantidade, id, venda.id_funcionario, 'retorno_venda');
            await ItemVenda.destroy({
                where: { id_item_venda: item.id_item_venda },
                transaction: t
            });
        }
        await Pagamento.destroy({
            where: { id_venda: id },
            transaction: t
        });

        // Fetch product prices for all new items in a single query
        const newProductIds = updateData.itens.map(item => item.id_produto);
        const produtos = await Produto.findAll({
            where: { id_produto: newProductIds },
            transaction: t
        });
        const produtoMap = new Map(produtos.map(p => [p.id_produto, p]));

        let newTotal = 0;
        const itensParaCriar = [];

        // Process new items, decrementing stock and calculating the new total
        for (const newItem of updateData.itens) {
            const produto = produtoMap.get(newItem.id_produto);
            if (!produto) {
                throw new Error(`Produto ID: ${newItem.id_produto} não encontrado.`);
            }

            await updateStockAndMovimentacao(t, newItem.id_produto, -newItem.quantidade, id, venda.id_funcionario, 'saida_venda');

            itensParaCriar.push({
                id_venda: id,
                id_lote: newItem.id_lote,
                quantidade: newItem.quantidade,
                preco_unitario: produto.preco
            });

            newTotal += produto.preco * newItem.quantidade;
        }

        // Bulk create the new item records
        await ItemVenda.bulkCreate(itensParaCriar, { transaction: t });

        // Update the main venda record
        await venda.update({
            id_cliente: updateData.id_cliente,
            id_funcionario: updateData.id_funcionario,
            id_caixa: updateData.id_caixa,
            valor_total: updateData.valor_total || newTotal,
            status: updateData.status || venda.status,
            data_hora: updateData.data_hora || venda.data_hora
        }, { transaction: t });

        // Create a new pagamento record with the updated total
        await Pagamento.create({
            id_venda: id,
            tipo_pagamento: updateData.pagamento.tipo_pagamento,
            valor: newTotal,
            data_pagamento: new Date()
        }, { transaction: t });

        return await Venda.findByPk(id, { transaction: t });
    });
};

const updateStockAndMovimentacao = async (t, id_produto, quantityChange, id_venda, id_funcionario, tipo) => {
    const lote = await Lote.findOne({
        where: { id_produto: id_produto },
        lock: t.LOCK.UPDATE,
        transaction: t
    });

    if (!lote) {
        throw new Error(`Estoque para o produto ID: ${id_produto} não encontrado.`);
    }

    if (quantityChange < 0 && estoque.quantidade < Math.abs(quantityChange)) {
        throw new Error(`Estoque insuficiente para o produto ID: ${id_produto}`);
    }

    await lote.increment('quantidade', {
        by: quantityChange,
        transaction: t
    });

    await MovimentacaoEstoque.create({
        id_lote: lote.id_lote,
        data_hora: new Date(),
        tipo: tipo,
        quantidade: quantityChange,
        id_funcionario: id_funcionario,
        id_venda: id_venda
    }, { transaction: t });
};

const deleteVenda = async (id) => {
    return await connection.transaction(async (t) => {
        const venda = await Venda.findByPk(id, {
            include: [{ model: ItemVenda }],
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!venda) {
            throw new Error('Venda não encontrada.');
        }

        for (const item of venda.itemvendas) {
            const lote = await Lote.findOne({
                where: { id_produto: item.id_produto },
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            if (!lote) {
                throw new Error(`Estoque para o produto ID: ${item.id_produto} não encontrado.`);
            }

            await lote.increment('quantidade', {
                by: item.quantidade,
                transaction: t
            });

            await MovimentacaoEstoque.create({
                id_lote: lote.id_lote,
                data_hora: new Date(),
                tipo: 'retorno_venda',
                quantidade: item.quantidade,
                id_funcionario: venda.id_funcionario,
                id_venda: venda.id_venda
            }, { transaction: t });
        }

        await Pagamento.destroy({
            where: { id_venda: id },
            transaction: t
        });

        await ItemVenda.destroy({
            where: { id_venda: id },
            transaction: t
        });

        const rowsDeleted = await Venda.destroy({
            where: { id_venda: id },
            transaction: t
        });

        return rowsDeleted;
    });
};

module.exports = {
    findVendaById,
    getAllVendas,
    getEditData,
    getViewDependencies,
    createVenda,
    updateVenda,
    deleteVenda
}