const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/handlers/async-handler');
const auditoriaService = require('../../services/admin/auditoriaService');
const Funcionario = require('../../models/Funcionario');

router.get('/auditoria', asyncHandler(async (req, res) => {
    const options = {
        page: req.query.page,
        limit: req.query.limit,
        tipo: req.query.tipo,
        id_funcionario: req.query.id_funcionario
    };

    const { logs, pagination } = await auditoriaService.getAuditLog(options);
    
    const funcionarios = await Funcionario.findAll(); 

    res.render('admin/auditoria/index', { 
        logs, 
        pagination,
        funcionarios,
        currentFilters: options // Para manter os filtros selecionados na view
    });
}));

module.exports = router;