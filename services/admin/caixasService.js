const connection = require('../../database/database');
const Caixa = require('../../models/caixa');
const Pdv = require('../../models/pdv');
const Venda = require('../../models/venda');
const Cliente = require('../../models/cliente');
const Pagamento = require('../../models/pagamento');
const PagamentoParcial = require('../../models/pagamentoParcial');
const Funcionario = require('../../models/funcionario');
const { modelValidation } = require('../../utils/data/data-validation');

const findCaixaById = async (id) => {
    const caixa = await Caixa.findByPk(id);
    modelValidation(caixa);
    return caixa;
};

const getAllCaixas = async () => {
    const caixas = await Caixa.findAll({
        include: [
            { model: Funcionario, as: 'funcionario' },
            { model: Pdv, as: 'pdv' }
        ],
        order: [['data_abertura', 'DESC']]
    });
    return { caixas };
};

const deleteCaixa = async (id) => {
    await Caixa.destroy({
        where: {
            id_caixa: id
        }
    });
};

const openCaixa = async ({ id_pdv, id_funcionario, saldo_inicial }) => {
    return await connection.transaction(async (t) => {
        const caixa = await Caixa.create({
            id_pdv,
            id_funcionario,
            saldo_inicial,
            status: 'aberto',
            data_abertura: new Date()
        }, { transaction: t });

        await Pdv.update(
            { status: 'inativo' },
            { where: { id_pdv }, transaction: t }
        );

        return caixa
    });
}

const closeCaixa = async ({ id_caixa, saldo_final }) => {
    return await connection.transaction(async (t) => {
        const caixa = await Caixa.findByPk(id_caixa, { transaction: t });

        caixa.saldo_final = saldo_final;
        caixa.data_fechamento = new Date();
        caixa.status = 'fechado';
        await caixa.save({ transaction: t });

        await Pdv.update(
            { status: 'ativo' },
            { where: { id_pdv: caixa.id_pdv }, transaction: t }
        );

        return caixa;
    });
};

const findCaixaDetailsById = async (id_caixa) => {
    const caixa = await Caixa.findByPk(id_caixa, {
        include: [
            { model: Funcionario, as: 'funcionario' },
            { model: Pdv, as: 'pdv' },
            {
                model: Venda,
                as: 'vendas',
                include: [
                    { model: Pagamento, as: 'pagamentos' },
                    { model: PagamentoParcial, as: 'pagamentoparcials' },
                    { model: Cliente, as: 'cliente' }
                ]
            }
        ]
    });

    if (!caixa) {
        throw new Error('Registro de caixa não encontrado.');
    }

    let resumoFinanceiro = {
        totalVendas: 0,
        totalRecebidoDinheiro: 0,
        totalRecebidoCartao: 0,
        totalRecebidoPix: 0,
        totalRecebidoOutros: 0,
        saldoEsperado: parseFloat(caixa.saldo_inicial)
    };

    if (caixa.vendas) {
        resumoFinanceiro.totalVendas = caixa.vendas.reduce((acc, v) => acc + parseFloat(v.valor_total), 0);

        const todosPagamentos = caixa.vendas.flatMap(v =>
            [...v.pagamentos, ...v.pagamentoparcials]
        );

        todosPagamentos.forEach(p => {
            const valor = parseFloat(p.valor_total || p.valor_pago);
            switch (p.forma_pagamento) {
                case 'dinheiro':
                    resumoFinanceiro.totalRecebidoDinheiro += valor;
                    break;
                case 'cartao_credito':
                case 'cartao_debito':
                    resumoFinanceiro.totalRecebidoCartao += valor;
                    break;
                case 'pix':
                    resumoFinanceiro.totalRecebidoPix += valor;
                    break;
                default:
                    resumoFinanceiro.totalRecebidoOutros += valor;
            }
        });

        resumoFinanceiro.saldoEsperado += resumoFinanceiro.totalRecebidoDinheiro;
    }

    return { caixa, resumoFinanceiro };
};

module.exports = {
    findCaixaById,
    getAllCaixas,
    openCaixa,
    closeCaixa,
    deleteCaixa,
    findCaixaDetailsById
};
