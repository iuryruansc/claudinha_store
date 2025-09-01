const express = require('express');
const router = express.Router();

const categoriesController = require('../controllers/CategoriesController');
const produtoController = require('../controllers/ProdutosController');
const funcionariosController = require('../controllers/FuncionariosController');
const clientesController = require('../controllers/ClientesController')
const estoqueController = require('../controllers/EstoquesController')

router.use('/', categoriesController);
router.use('/', produtoController);
router.use('/', funcionariosController);
router.use('/', clientesController);
router.use('/', estoqueController);

module.exports = router;
