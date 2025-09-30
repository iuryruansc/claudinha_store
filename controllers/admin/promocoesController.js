const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Desconto = require('../../models/desconto');
const Produto = require('../../models/produto');
const Lote = require('../../models/lote')
const { Op } = require('sequelize');
const formatDate = require('../../utils/data/date-formatter');
const { createDescontoParaLoteMaisProximo } = require('../../services/admin/descontosService');

router.post('/promocoes/save', asyncHandler(async (req, res) => {
    const dadosDesconto = {
        id_produto: req.body.id_produto,
        tipo: req.body.tipo,
        valor: req.body.valor,
        data_inicio: req.body.data_inicio,
        data_fim: req.body.data_fim,
        observacao: req.body.observacao
    };

    await createDescontoParaLoteMaisProximo(dadosDesconto);

    res.status(200).json({
        success: true,
        message: 'Nova promoção cadastrado e estoque atualizado!',
    });
}));

router.get('/promocoes', asyncHandler(async (req, res) => {
    const hoje = new Date();
    const findOptions = {
        include: [{
            model: Lote, as: 'lote', required: true,
            include: [{ model: Produto, as: 'produto', required: true }]
        }],
        order: [['data_fim', 'ASC']]
    };

    const [ativas, agendadas, encerradas, lotes] = await Promise.all([
        Desconto.findAll({ where: { ativo: true, data_inicio: { [Op.lte]: hoje }, data_fim: { [Op.gte]: hoje } }, ...findOptions }),
        Desconto.findAll({ where: { ativo: true, data_inicio: { [Op.gt]: hoje } }, ...findOptions }),
        Desconto.findAll({ where: { [Op.or]: [{ data_fim: { [Op.lt]: hoje } }, { ativo: false }] }, ...findOptions }),
        Lote.findAll({ where: { quantidade: { [Op.gt]: 0 } }, include: [{ model: Produto, as: 'produto' }] })
    ]);

    res.render('admin/promocoes/index', { ativas, agendadas, encerradas, lotes, formatDate });
}));

router.get('/promocoes/json/:id', asyncHandler(async (req, res) => {
    const promo = await Desconto.findByPk(req.params.id, {
        include: [{
            model: Lote,
            as: 'lote',
            include: [{ model: Produto, as: 'produto' }]
        }]
    });
    if (promo) {
        res.json(promo);
    } else {
        res.status(404).json({ error: 'Promoção não encontrada' });
    }
}));

router.post('/promocoes/update/:id_desconto', asyncHandler(async (req, res) => {
    const { id_desconto } = req.params;
    const { id_lote, tipo, valor, data_inicio, data_fim, observacao } = req.body;

    const promocao = await Desconto.findByPk(id_desconto);

    if (!promocao) {
        req.flash('error_msg', 'Promoção não encontrada.');
        return res.status(404).json({ message: 'Promoção não encontrada' });
    }

    await promocao.update({
        id_lote,
        tipo,
        valor,
        data_inicio,
        data_fim,
        observacao
    });

    res.status(200).json({
        message: 'Promoção atualizada com sucesso!',
        redirectUrl: '/admin/promocoes'
    });
}));

module.exports = router;