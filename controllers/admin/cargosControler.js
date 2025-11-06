const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Funcionarios = require('../../models/Funcionario');
const { stringValidation, checkAssociations, numberValidation } = require('../../utils/data/data-validation');
const { parseIntValue } = require('../../utils/data/data-parsers');
const { getAllCargos, findCargoById, createCargo, deleteCargo, updateCargo } = require('../../services/admin/cargosService');

router.get('/cargos/new', (req, res) => {
    res.render('admin/cargos/new', { title: 'Novo Cargo' });
});

router.get('/cargos', asyncHandler(async (req, res) => {
    const cargos = await getAllCargos();

    res.render('admin/cargos', { cargos })
}));

router.get('/cargos/edit/:id_cargo', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cargo);

    numberValidation(parsedId);

    const cargo = await findCargoById(parsedId);

    res.render('admin/cargos/edit', { cargo })
}));

router.post('/cargos/save', asyncHandler(async (req, res) => {
    const { nome_cargo } = req.body;

    stringValidation(nome_cargo);

    await createCargo({ nome_cargo });

    res.status(200).json({
        message: 'Cargo registrado com sucesso!',
        redirectUrl: '/admin/cargos'
    });
}));

router.post('/cargos/delete/:id_cargo', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cargo);

    numberValidation(parsedId);

    await checkAssociations(Funcionarios,
        'id_fornecedor',
        parsedId,
        "Não é possível excluir o cargo, pois exitem funcionários associados a ele."
    );

    await deleteCargo(parsedId);

    res.json({ message: 'Cargo excluído com sucesso' });
}));

router.post('/cargos/update/:id_cargo', asyncHandler(async (req, res) => {
    const { nome_cargo } = req.body;
    const [parsedId] = parseIntValue(req.params.id_cargo);

    numberValidation(parsedId);
    stringValidation(nome_cargo);

    await updateCargo(parsedId, { nome_cargo });

    res.status(200).json({
        message: 'Cargo atualizado com sucesso!',
        redirectUrl: '/admin/cargos'
    });
}));

router.get('/cargos/:id_cargo/funcionarios', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_cargo);
    numberValidation(parsedId);

    const funcionarios = await Funcionarios.findAll({
        where: { id_cargo: parsedId }
    });

    const cargo = await findCargoById(parsedId);

    res.render('admin/funcionarios/func-cargos', {
        funcionarios,
        cargo_nome: cargo.nome_cargo
    });
}));

module.exports = router;