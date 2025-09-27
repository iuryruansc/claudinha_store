const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const { requireCaixa } = require('../../utils/handlers/auth-handler');
const vendaService = require('../../services/admin/vendasService');
const formatDate = require('../../utils/data/date-formatter');
const Produto = require('../../models/produto');
const Lote = require('../../models/lote');
const Desconto = require('../../models/desconto');

router.get('/vendas', asyncHandler(async (req, res) => {
    const { vendas, caixas, clientes, funcionarios, produtos } = await vendaService.getAllVendas();

    res.render('admin/vendas/index', { vendas, caixas, clientes, funcionarios, produtos, formatDate })
}));
/* 
router.use(requireCaixa); */

router.get('/vendas/new', asyncHandler(async (req, res) => {
    const { clientes, produtos } = await vendaService.getViewDependencies();
    const formasPagamento = [
        { id_forma_pagamento: 'dinheiro', nome: 'Dinheiro' },
        { id_forma_pagamento: 'cartao_credito', nome: 'Cartão de Crédito' },
        { id_forma_pagamento: 'cartao_debito', nome: 'Cartão de Débito' },
        { id_forma_pagamento: 'pix', nome: 'PIX' },
        { id_forma_pagamento: 'outro', nome: 'Outro' }
    ];

    res.render('admin/vendas/new', { clientes, produtos, formasPagamento });
}));

router.get('/vendas/produtos/codigobarras/:codigo', asyncHandler(async (req, res) => {
    const codigo_barras = req.params.codigo;
    
    const resultado = await vendaService.findProdutoLotePorCodigoBarras(codigo_barras);

    return res.json(resultado);
}));

router.get('/vendas/produtos/:id_produto/lote', asyncHandler(async (req, res) => {
    try {
        const id_produto = parseInt(req.params.id_produto, 10);

        if (isNaN(id_produto)) {
            return res.status(400).json({ error: 'ID de produto inválido.' });
        }
        
        const loteProcessado = await vendaService.findLoteParaVenda(id_produto);

        if (!loteProcessado) {
            return res.status(404).json({ error: 'Nenhum lote disponível encontrado para este produto.' });
        }

        return res.json(loteProcessado);

    } catch (err) {
        console.error('Erro ao buscar lote/desconto', err);
        return res.status(500).json({ error: 'Erro interno' });
    }
}));
module.exports = router;

router.post('/vendas/save', asyncHandler(async (req, res) => {
}));

module.exports = router;