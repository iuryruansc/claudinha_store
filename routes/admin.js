const express = require('express');
const router = express.Router();

const categoriesController = require('../controllers/CategoriesController');
const produtosController = require('../controllers/ProdutosController');
const funcionariosController = require('../controllers/FuncionariosController');
const clientesController = require('../controllers/ClientesController');
const estoquesController = require('../controllers/EstoquesController');
const pdvsController = require('../controllers/PdvsController');
const caixasController = require('../controllers/CaixasController');

router.use('/', categoriesController);
router.use('/', produtosController);
router.use('/', funcionariosController);
router.use('/', clientesController);
router.use('/', estoquesController);
router.use('/', pdvsController);
router.use('/', caixasController);

module.exports = router;
