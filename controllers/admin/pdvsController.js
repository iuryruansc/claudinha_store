const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { stringValidation, enumValidation, numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue } = require('../../utils/data/data-parsers');
const { getAllPdvs, findPdvById, createPdv, deletePdv, updatePdv } = require('../../services/admin/pdvsService');

router.get('/pdvs/new', asyncHandler(async (req, res) => {
    res.render('admin/pdvs/new', { title: 'Novo Ponto de Vendas' });
}));

router.get('/pdvs', asyncHandler(async (req, res) => {
    const pdvs = await getAllPdvs();

    res.render('admin/pdvs/index', { pdvs })
}));

router.get('/pdvs/edit/:id_pdv', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pdv);

    numberValidation(parsedId);

    const pdv = await findPdvById(parsedId);

    res.render('admin/pdvs/edit', { pdv })
}));

router.post('/pdvs/save', asyncHandler(async (req, res) => {
    const { identificacao, descricao, status } = req.body;

    stringValidation(identificacao, descricao);
    enumValidation(status, 'ativo', 'inativo');

    await createPdv({ identificacao, descricao, status });

    res.status(200).json({
        message: 'PDV registrado com sucesso!',
        redirectUrl: '/admin/pdvs'
    });
}));

router.post('/pdvs/delete/:id_pdv', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pdv);

    numberValidation(parsedId);

    await deletePdv(parsedId);

    res.redirect('/admin/pdvs');
}));

router.post('/pdvs/update/:id_pdv', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_pdv);
    const { identificacao, descricao, status } = req.body;

    numberValidation(parsedId);
    stringValidation(identificacao, descricao);
    enumValidation(status, 'ativo', 'inativo');

    await updatePdv(parsedId, { identificacao, descricao, status });

    res.status(200).json({
        message: 'PDV atualizado com sucesso!',
        redirectUrl: '/admin/produtos'
    });;
}));

module.exports = router;
