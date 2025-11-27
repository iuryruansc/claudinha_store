const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { Op } = require('sequelize');
const Produto = require('../../models/Produto');
const { numberValidation, stringValidation } = require('../../utils/data/data-validation');
const { parseIntValue, parseFloatValue } = require('../../utils/data/data-parsers');
const { getViewDependencies, getProdutosByCategoria, getEditData, createProduto, deleteProduto, updateProduto, getProdutosByFornecedor, getProdutosByMarca, produtoDetails } = require('../../services/admin/produtosService');

router.get('/produtos/new', asyncHandler(async (req, res) => {
    const { categorias, fornecedores, marcas } = await getViewDependencies();

    res.render('admin/produtos/new', { categorias, fornecedores, marcas });
}));

router.get('/produtos', asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const perPage = Math.min(parseInt(req.query.perPage) || 25, 200);
    const offset = (page - 1) * perPage;

    const search = (req.query.search || '').trim();
    const id_categoria = req.query.id_categoria ? Number(req.query.id_categoria) : null;
    const id_fornecedor = req.query.id_fornecedor ? Number(req.query.id_fornecedor) : null;
    const id_marca = req.query.id_marca ? Number(req.query.id_marca) : null;
    const order = req.query.order || 'nome:ASC';

    const where = {};
    if (search) {
        where[Op.or] = [
            { nome: { [Op.like]: `%${search}%` } },
            { codigo_barras: { [Op.like]: `%${search}%` } }
        ];
    }
    if (id_categoria) where.id_categoria = id_categoria;
    if (id_fornecedor) where.id_fornecedor = id_fornecedor;
    if (id_marca) where.id_marca = id_marca;

    const [orderField, orderDir] = order.split(':');

    const orderArr = [[orderField || 'nome', (orderDir || 'ASC').toUpperCase()]];

    const { rows: produtos, count } = await Produto.findAndCountAll({
        where,
        attributes: ['id_produto', 'nome', 'preco_compra', 'preco_venda', 'quantidade_estoque', 'id_categoria', 'id_fornecedor', 'id_marca', 'codigo_barras'],
        limit: perPage,
        offset,
        order: orderArr
    });

    const { categorias, fornecedores, marcas } = await getViewDependencies();

    const renderData = {
        produtos,
        total: count,
        page,
        perPage,
        categorias,
        fornecedores,
        marcas,
        querySearch: search,
        queryCategoria: id_categoria,
        queryFornecedor: id_fornecedor,
        queryMarca: id_marca,
        queryOrder: order,
    };

    if (req.query.ajax === '1' || req.xhr) {
        res.render('admin/produtos/_produtos-table', renderData);
    } else {
        res.render('admin/produtos/index', renderData);
    }
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

    const { produtos, marca } = await getProdutosByMarca(id_marca);
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

router.get('/produtos/:id_produto/json', asyncHandler(async (req, res) => {
    const [id_produto] = parseIntValue(req.params.id_produto);
    numberValidation(id_produto);

    const { produto } = await produtoDetails(id_produto);

    console.log(produto.marca.nome_marca);

    res.json({
        id_produto: produto.id_produto,
        nome: produto.nome,
        codigo_barras: produto.codigo_barras || null,
        preco_compra: produto.preco_compra,
        preco_venda: produto.preco_venda,
        quantidade_estoque: produto.quantidade_estoque,
        categoria: produto.id_categoria || null,
        nome_fornecedor: produto.fornecedore.nome_fornecedor,
        nome_marca: produto.marca.nome_marca,
        lotes: (produto.lote || []).map(l => ({
            id_lote: l.id_lote,
            numero_lote: l.numero_lote,
            quantidade: l.quantidade,
            preco_venda: l.preco_venda,
            data_validade: l.data_validade
        }))
    });
}));

router.get('/produtos/edit/:id_produto', asyncHandler(async (req, res) => {
    const [parsedId] = parseIntValue(req.params.id_produto);

    numberValidation(parsedId);

    const { produto, categorias, fornecedores, marcas } = await getEditData(parsedId);

    res.render('admin/produtos/edit', { produto, categorias, fornecedores, marcas });
}));

router.post('/produtos/save', asyncHandler(async (req, res) => {
    const { nome, codigo_barras } = req.body;
    const [id_categoria, id_fornecedor, id_marca] = parseIntValue(
        req.body.id_categoria,
        req.body.id_fornecedor,
        req.body.id_marca
    );
    const [preco_compra, preco_venda] = parseFloatValue(req.body.preco_compra, req.body.preco_venda);

    numberValidation(id_categoria, id_fornecedor, id_marca, preco_compra, preco_venda);
    stringValidation(nome, codigo_barras);

    await createProduto({
        nome,
        preco_compra,
        preco_venda,
        codigo_barras,
        id_categoria,
        id_fornecedor,
        id_marca
    });

    res.status(200).json({
        message: 'Produto registrado com sucesso!',
        redirectUrl: '/admin/produtos'
    });
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
    const [preco_compra, preco_venda] = parseFloatValue(req.body.preco_compra, req.body.preco_venda);
    const { nome, codigo_barras } = req.body;

    numberValidation(id_produto, id_categoria, id_fornecedor, id_marca, preco_compra, preco_venda);
    stringValidation(nome, codigo_barras);

    await updateProduto(id_produto, {
        nome,
        preco_compra,
        preco_venda,
        codigo_barras,
        id_categoria,
        id_fornecedor,
        id_marca
    });

    res.status(200).json({
        message: 'Produto atualizado com sucesso!',
        redirectUrl: '/admin/produtos'
    });
}));

module.exports = router;
