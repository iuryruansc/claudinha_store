const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Produtos = require('../../models/produto')
const { stringValidation, checkAssociations, numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue } = require('../../utils/data/data-parsers');
const { getAllMarcas, findMarcaById, createMarca, deleteMarca, updateMarca } = require('../../services/admin/marcasService');

router.get('/marcas/new', (req, res) => {
    res.render('admin/marcas/new', { title: 'Nova Marca' });
});

router.get('/marcas', asyncHandler(async (req, res) => {
    const marcas = await getAllMarcas();

    res.render('admin/marcas', { marcas })
}));

router.get('/marcas/edit/:id_marca', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_marca);

    numberValidation(parsedId);

    const marca = await findMarcaById(parsedId);

    res.render('admin/marcas/edit', { marca })
}));

router.post('/marcas/save', asyncHandler(async (req, res) => {
    const { nome_marca } = req.body;

    stringValidation(nome_marca);

    await createMarca({ nome_marca });

    res.status(200).json({ message: 'Marca criada com sucesso' });
}));

router.post('/marcas/delete/:id_marca', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_marca);

    numberValidation(parsedId);

    await checkAssociations(Produtos,
        'id_fornecedor',
        parsedId,
        "Não é possível excluir a marca, pois exitem produtos associados a ela."
    );

    await deleteMarca(parsedId);

    res.json({ message: 'Marca excluída com sucesso' });
}));

router.post('/marcas/update/:id_marca', asyncHandler(async (req, res) => {
    const { nome_marca } = req.body;
    const [parsedId] = parseIntValue(req.params.id_marca);

    numberValidation(parsedId);
    stringValidation(nome_marca);

    await updateMarca(parsedId, { nome_marca });

    res.status(200).json({ message: 'Marca atualizada com sucesso' });
}));

module.exports = router;