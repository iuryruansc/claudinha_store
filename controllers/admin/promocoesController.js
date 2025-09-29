const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const Desconto = require('../../models/desconto');
const Produto = require('../../models/produto');
const Lote = require('../../models/lote')
const { Op } = require('sequelize');
const formatDate = require('../../utils/data/date-formatter');

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
        include: [{ model: Lote, as: 'lote' }]
    });
    if (promo) {
        res.json(promo);
    } else {
        res.status(404).json({ error: 'Promoção não encontrada' });
    }
}));

module.exports = router;