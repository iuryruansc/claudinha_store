const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { numberValidation, stringValidation } = require('../../utils/data/data-validation');
const { parseIntValue, parseFloatValue } = require('../../utils/data/data-parsers');
const { getAllProdutos, getViewDependencies, getProdutosByCategoria, getEditData, createProduto, deleteProduto, updateProduto, getProdutosByFornecedor, getProdutosByMarca } = require('../../services/admin/produtosService');

router.get('/produtos/new', asyncHandler(async (req, res) => {
    const categorias = await getViewDependencies();

    res.render('admin/produtos/new', { categorias, fornecedores, marcas });
}));

router.get('/produtos', asyncHandler(async (req, res) => {
    const { produtos, categorias } = await getAllProdutos();

    res.render('admin/produtos/index', {
        produtos,
        categorias,
        fornecedores,
        marcas,
        categoria_nome: null,
        fornecedor_nome: null,
        marca_nome: null
    });
}));

router.get('/produtos/categoria/:id_categoria', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_categoria);

    numberValidation(parsedId);

    const { produtos, categoria } = await getProdutosByCategoria(parsedId);
    const { fornecedores, marcas } = await getViewDependencies();

    res.render('admin/produtos/index', {
        produtos,
        categorias: null,
        fornecedores,
        marcas,
        categoria_nome: categoria.nome,
        fornecedor_nome: null,
        marca_nome: null
    });
}));

router.get('/produtos/fornecedor/:id_fornecedor', asyncHandler(async (req, res) => {
    const [id_fornecedor] = parseIntValue(req.params.id_fornecedor);
    numberValidation(id_fornecedor);

    const { produtos, fornecedor } = await getProdutosByFornecedor(id_fornecedor);
    const { categorias, marcas } = await getViewDependencies();

    res.render('admin/produtos/index', {
        produtos,
        categorias,
        fornecedores: null,
        marcas,
        categoria_nome: null,
        fornecedor_nome: fornecedor?.nome_fornecedor || 'Fornecedor desconhecido',
        marca_nome: null
    });
}));

router.get('/produtos/marca/:id_marca', asyncHandler(async (req, res) => {
    const [id_marca] = parseIntValue(req.params.id_marca);
    numberValidation(id_marca);

    const { produtos, marca } = await getProdutosByMarca();
    const { categorias, fornecedores } = await getViewDependencies();

    res.render('admin/produtos/index', {
        produtos,
        categorias,
        fornecedores,
        marcas: null,
        categoria_nome: null,
        fornecedor_nome: null,
        marca_nome: marca?.nome_marca || 'Marca desconhecida'
    });
}));

router.get('/produtos/edit/:id_produto', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_produto);

    numberValidation(parsedId);

    const { produto, categorias } = await getEditData(parsedId);

    res.render('admin/produtos/edit', { produto, categorias, fornecedores, marcas });
}));

router.post('/produtos/save', asyncHandler(async (req, res) => {
    const { nome, codigo_barras } = req.body;
    const [id_categoria, id_fornecedor, id_marca] = parseIntValue(
        req.body.id_categoria,
        req.body.id_fornecedor,
        req.body.id_marca
    );
    const [preco] = parseFloatValue(req.body.preco);

    numberValidation(id_categoria, id_fornecedor, id_marca, preco);
    stringValidation(nome, codigo_barras);

    await createProduto({
        nome,
        preco,
        codigo_barras,
        id_categoria,
        id_fornecedor,
        id_marca
    });

    res.status(200).json({ message: 'Produto criado com sucesso' });
}));

router.post('/produtos/delete/:id_produto', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_produto);

    numberValidation(parsedId);

    await deleteProduto(parsedId);

    res.redirect('/admin/produtos');
}));

router.post('/produtos/update/:id_produto', asyncHandler(async (req, res) => {
    const [id_produto] = parseIntValue(req.params.id_produto);
    const [id_categoria, id_fornecedor, id_marca] = parseIntValue(
        req.body.id_categoria,
        req.body.id_fornecedor,
        req.body.id_marca
    );
    const [preco] = parseFloatValue(req.body.preco);
    const { nome, codigo_barras } = req.body;

    numberValidation(id_produto, id_categoria, id_fornecedor, id_marca, preco);
    stringValidation(nome, codigo_barras);

    await updateProduto(id_produto, {
        nome,
        preco,
        codigo_barras,
        id_categoria,
        id_fornecedor,
        id_marca
    });

    res.status(200).json({ message: 'Produto atualizado com sucesso' });
}));

module.exports = router;
