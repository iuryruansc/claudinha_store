const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Produtos = require('../../models/produto')
const { stringValidation, checkAssociations, numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue } = require('../../utils/data/data-parsers');
const { getAllFornecedores, findFornecedorById, createFornecedor, deleteFornecedor, updateFornecedor } = require('../../services/admin/fornecedoresService');

router.get('/fornecedores/new', (req, res) => {
    res.render('admin/fornecedores/new', { title: 'Novo Fornecedor' });
});

router.get('/fornecedores', asyncHandler(async (req, res) => {
    const fornecedores = await getAllFornecedores();

    res.render('admin/fornecedores', { fornecedores })
}));

router.get('/fornecedores/edit/:id_fornecedor', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_fornecedor);

    numberValidation(parsedId);

    const fornecedor = await findFornecedorById(parsedId);

    res.render('admin/fornecedores/edit', { fornecedor })
}));

router.post('/fornecedores/save', asyncHandler(async (req, res) => {
    const { nome_fornecedor } = req.body;

    stringValidation(nome_fornecedor);

    await createFornecedor({ nome_fornecedor });

    res.status(200).json({ message: 'Fornecedor criado com sucesso' });
}));

router.post('/fornecedores/delete/:id_fornecedor', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_fornecedor);

    numberValidation(parsedId);

    await checkAssociations(Produtos,
        'id_fornecedor',
        parsedId,
        "Não é possível excluir o fornecedor, pois exitem produtos associados a ela."
    );

    await deleteFornecedor(parsedId);

    res.render('/admin/fornecedores');
}));

router.post('/fornecedores/update/:id_fornecedor', asyncHandler(async (req, res) => {
    const { nome_fornecedor } = req.body;
    const [parsedId] = parseIntValue(req.params.id_fornecedor);

    numberValidation(parsedId);
    stringValidation(nome_fornecedor);

    await updateFornecedor(parsedId, { nome_fornecedor });

    res.status(200).json({ message: 'Fornecedor atualizado com sucesso' });
}));

module.exports = router;