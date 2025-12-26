const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const formatDate = require('../../utils/data/date-formatter');
const Lote = require('../../models/Lote')
const Produto = require('../../models/Produto')
const { stringValidation, numberValidation, dateValidation } = require('../../utils/data/data-validation');
const { parseIntValue, parseDateValue, parseFloatValue } = require('../../utils/data/data-parsers');
const { getAllLotes, updateLote, deleteLote, adicionarQuantidadeAoLote, createLoteWithMovimentacao } = require('../../services/admin/lotesService');
const { updateProduto } = require('../../services/admin/produtosService');
const { formatarLoteParaTabela } = require('../../services/admin/loteFormatter');

router.get('/lotes', asyncHandler(async (req, res) => {
    const { lotes } = await getAllLotes();

    const alertaEstoqueBaixo = lotes.some(lote =>
        lote.statusQuantidade === 'baixo' ||
        lote.statusQuantidade === 'critico' ||
        lote.statusQuantidade === 'zerado'
    );

    res.render('admin/lotes/', { lotes, alertaEstoqueBaixo, formatDate });
}));

router.post('/lotes/save', asyncHandler(async (req, res) => {
    const { localizacao, numero_lote } = req.body;

    const [parsedId, parsedQuant,] = parseIntValue(req.body.id_produto, req.body.quantidade);
    const [parsedPrecoCompra, parsedPrecoVenda] = parseFloatValue(req.body.preco_produto_compra, req.body.preco_produto_venda);
    const parsedValidade = parseDateValue(req.body.data_validade);
    const id_funcionario = req.session.userId;

    numberValidation(parsedId, parsedQuant, parsedPrecoCompra, parsedPrecoVenda);
    stringValidation(numero_lote);
    dateValidation(parsedValidade);

    const novoLote = await createLoteWithMovimentacao({
        id_produto: parsedId,
        preco_compra: parsedPrecoCompra,
        preco_venda: parsedPrecoVenda,
        numero_lote: numero_lote,
        quantidade: parsedQuant,
        data_validade: parsedValidade,
        localizacao
    }, id_funcionario);

    const loteCompleto = await Lote.findByPk(novoLote.id_lote, {
        include: [{ model: Produto, as: 'produto' }]
    });

    try {
        const loteParaTabela = await formatarLoteParaTabela(loteCompleto);

        req.io.emit('lote:novo', loteParaTabela);
    } catch (wsError) {
        console.error("Falha ao emitir evento de WebSocket para novo lote:", wsError);
    }

    res.status(200).json({
        success: true,
        message: 'Novo lote cadastrado e estoque atualizado!',
    });
}));

router.post('/lotes/delete/:id_lote', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_lote);
    numberValidation(parsedId);

    await deleteLote(parsedId);

    req.io.emit('lote:removido', { id_lote: parsedId });

    res.status(200).json({
        success: true,
        message: 'Lote removido com sucesso!'
    });
}));

router.post('/lotes/update/:id_lote', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_lote);
    const { numero_lote } = req.body;
    const { localizacao } = req.body;
    const id_funcionario = req.session.userId;
    const parsedValidade = parseDateValue(req.body.data_validade);
    const [preco_compra, preco_venda] = parseFloatValue(req.body.preco_compra, req.body.preco_venda);

    console.log(numero_lote);
    

    numberValidation(parsedId, preco_compra, preco_venda);
    dateValidation(parsedValidade);

    const loteAntigo = await Lote.findByPk(parsedId);
    if (!loteAntigo) {
        req.flash('error_msg', 'Lote não encontrado.');
        return res.redirect('/admin/lotes');
    }

    const precoVendaAntigo = Number(loteAntigo.preco_venda);
    const novoPrecoVenda = Number(preco_venda);
    const precoMudou = !Number.isNaN(precoVendaAntigo) && !Number.isNaN(novoPrecoVenda)
        ? precoVendaAntigo !== novoPrecoVenda
        : String(loteAntigo.preco_venda) !== String(preco_venda);

    const loteAtualizado = await updateLote(parsedId, ({
        localizacao,
        numero_lote,
        data_validade: parsedValidade,
        preco_compra,
    }), id_funcionario);

    if (precoMudou) {
        const idProduto = loteAntigo.id_produto;
        if (idProduto) {
            await updateProduto(idProduto, { preco_venda: novoPrecoVenda });
        }
    }

    const loteParaTabela = await formatarLoteParaTabela(loteAtualizado);

    req.io.emit('lote:atualizado', loteParaTabela);

    req.flash('success_msg', 'Lote atualizado com sucesso!');

    res.redirect('/admin/lotes');
}));

router.post('/lotes/add-quantidade/:id_lote', asyncHandler(async (req, res) => {
    const id_lote = parseInt(req.params.id_lote);
    const quantidade = parseInt(req.body.quantidade);
    const { observacao } = req.body;
    const id_funcionario = req.session.userId;

    numberValidation(id_lote, quantidade);

    const loteAtualizado = await adicionarQuantidadeAoLote(id_lote, quantidade, id_funcionario, observacao);

    const loteParaTabela = await formatarLoteParaTabela(loteAtualizado);

    req.io.emit('lote:atualizado', loteParaTabela);

    res.status(200).json(loteParaTabela);
}));

router.get('/lotes/json/:id', asyncHandler(async (req, res) => {
    const lote = await Lote.findByPk(req.params.id, {
        include: [{ model: Produto, as: 'produto' }]
    });
    if (lote) {
        res.json(lote);
    } else {
        res.status(404).json({ error: 'Lote não encontrado' });
    }
}));

module.exports = router;
