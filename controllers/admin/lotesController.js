const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const formatDate = require('../../utils/data/date-formatter');
const { stringValidation, numberValidation, dateValidation } = require('../../utils/data/data-validation');
const { parseIntValue, parseDateValue } = require('../../utils/data/data-parsers');
const { getAllLotes, getEditData, getViewDependencies, createLote, updateLote, deleteLote, adicionarQuantidadeAoLote } = require('../../services/admin/lotesService');

router.get('/lotes/new', asyncHandler(async (req, res) => {
    const produtos = await getViewDependencies();
    res.render('admin/lotes/new', { produtos });
}));

router.get('/lotes', asyncHandler(async (req, res) => {
    const { lotes, produtos } = await getAllLotes();

    res.render('admin/lotes/', { lotes, produtos, formatDate });
}));

router.get('/lotes/edit/:id_lote', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_lote);

    numberValidation(parsedId);

    const { lote, produtos } = await getEditData(parsedId);

    res.render('admin/lotes/edit', { lote, produtos })
}));

router.post('/lotes/save', asyncHandler(async (req, res) => {
    const { localizacao } = req.body;
    const [parsedId, parsedNumLote, parsedQuant] = parseIntValue(req.body.id_produto, req.body.numero_lote, req.body.quantidade);
    const parsedValidade = parseDateValue(req.body.data_validade);

    numberValidation(parsedId, parsedQuant, parsedNumLote);
    stringValidation(localizacao);
    dateValidation(parsedValidade);

    await createLote({
        id_produto: parsedId,
        quantidade: parsedQuant,
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
    const [parsedId] = parseIntValue(req.params.id_lote);
    const [parsedQuant, parsedNumLote] = parseIntValue(req.body.quantidade, req.body.numero_lote);
    const { localizacao } = req.body;
    const parsedValidade = parseDateValue(req.body.data_validade);


    numberValidation(parsedId, parsedQuant, parsedNumLote);
    stringValidation(localizacao);
    dateValidation(parsedValidade);

    await updateLote(parsedId, ({
        quantidade: parsedQuant,
        localizacao,
        numero_lote: parsedNumLote,
        data_validade: parsedValidade
    }));

    res.redirect('/admin/lotes');
}));

router.post('/lotes/add-quantidade/:id_lote', asyncHandler(async (req, res) => {
    const [id_lote] = parseIntValue(req.params.id_lote);
    const [quantidade] = parseIntValue(req.body.quantidade);

    numberValidation(id_lote, quantidade);

    await adicionarQuantidadeAoLote(id_lote, quantidade);

    res.status(200).json({ message: 'Quantidade adicionada com sucesso' });
}));


module.exports = router;
