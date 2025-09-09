const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { stringValidation, numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue } = require('../../utils/data/data-parsers');
const { getAllLotes, getEditData, getViewDependencies, createLote, updateLote, deleteLote } = require('../../services/admin/lotesService');

router.get('/lotes/new', asyncHandler(async (req, res) => {
    const produtos = await getViewDependencies();
    res.render('admin/lotes/new', { produtos });
}));

router.get('/lotes', asyncHandler(async (req, res) => {
    const { lotes, produtos } = await getAllLotes();

    res.render('admin/lotes/index', { lotes, produtos });
}));

router.get('/lotes/edit/:id_lote', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_lote);

    numberValidation(parsedId);

    const { lote, produtos } = await getEditData(parsedId);

    res.render('admin/lotes/edit', { lote, produtos })
}));

router.post('/lotes/save', asyncHandler(async (req, res) => {
    const { localizacao } = req.body;
    const [parsedId, parsedNumLote, parsedValidade, parsedQuant] = parseIntValue(req.body.id_produto, req.body.numero_lote, req.body.data_validade, req.body.quantidade);

    numberValidation(parsedId, parsedQuant, parsedNumLote, parsedValidade);
    stringValidation(localizacao);

    await createLote({
        id_produto: parsedId,
        quantidade_atual: parsedQuant,
        localizacao,
        numero_lote: parsedNumLote,
        data_validade: parsedValidade
    });

    res.redirect('/admin/lotes');
}));

router.post('/lotes/delete/:id_lote', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_lote);

    numberValidation(parsedId);

    await deleteLote(parsedId);

    res.redirect('/admin/lotes');
}));

router.post('/lotes/update/:id_lote', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_estoque);
    const [parsedQuant, parsedNumLote, parsedValidade] = parseIntValue(req.body.quantidade, req.body.numero_lote, req.body.data_validade);
    const { localizacao } = req.body;

    numberValidation(parsedId, parsedQuant, parsedNumLote, parsedValidade);
    stringValidation(localizacao);

    await updateLote(parsedId, ({
        quantidade_atual: parsedQuant,
        localizacao,
        numero_lote: parsedNumLote,
        data_validade: parsedValidade
    }));

    res.redirect('/admin/lotes');
}));

module.exports = router;
