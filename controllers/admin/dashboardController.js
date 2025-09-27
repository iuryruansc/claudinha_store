const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const formatDate = require('../../utils/data/date-formatter');
const { getRecentActivity } = require('../../services/admin/movEstoqueService');
const { getLowStockLotes } = require('../../services/admin/lotesService');
const { findCaixaById } = require('../../services/admin/caixasService');
const { getPdvsAtivos } = require('../../services/admin/pdvsService');
const { getProdutoByCodigoBarras } = require('../../services/admin/produtosService');
const { getPromocoes } = require('../../services/admin/descontosService');

router.get('/dashboard', asyncHandler(async (req, res) => {
    const atividades = await getRecentActivity();
    const lotesBaixoEstoque = await getLowStockLotes();
    const pdvs = await getPdvsAtivos();
    const promoList = await getPromocoes({ omitSemLote: true });
    const erro = req.query.erro;
    let caixa = null;

    if (req.session.caixaId) {
        caixa = await findCaixaById(req.session.caixaId);
    }

    res.render('admin/dashboard', { erro, atividades, lotesBaixoEstoque, pdvs, caixa, promoList, formatDate });
}));

router.get('/dashboard/entrada/iniciar', asyncHandler(async (req, res) => {
    const { codigo_barras } = req.query;

    if (!codigo_barras) {
        return res.status(400).json({ error: 'Código de barras é obrigatório.' });
    }

    const produto = await getProdutoByCodigoBarras(codigo_barras);

    res.json({ id_produto: produto.id_produto, nome: produto.nome, preco: produto.preco_compra });
}));

module.exports = router;