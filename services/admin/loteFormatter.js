const Produto = require('../../models/Produto');

async function formatarLoteParaTabela(lote) {
    if (!lote.produto) {
        lote.produto = await Produto.findByPk(lote.id_produto);
    }

    const hoje = new Date();
    const dataValidade = new Date(lote.data_validade);
    const diffDias = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
    const qtd = lote.quantidade;

    let statusValidade = 'ok';
    if (diffDias < 0) statusValidade = 'vencido';
    else if (diffDias <= 7) statusValidade = 'critico';
    else if (diffDias <= 30) statusValidade = 'atencao';

    let statusQuantidade = 'ok';
    if (qtd === 0) statusQuantidade = 'zerado';
    else if (qtd <= 5) statusQuantidade = 'critico';
    else if (qtd <= 10) statusQuantidade = 'baixo';

    let statusTexto = `Válido até ${new Date(lote.data_validade).toLocaleDateString('pt-BR')}`;
    if (statusValidade === 'vencido') {
        statusTexto = `Vencido há ${Math.abs(diffDias)} dia(s)`;
    } else if (diffDias <= 30) {
        statusTexto = `Vence em ${diffDias} dia(s)`;
    }

    return {
        id_lote: lote.id_lote,
        produtoNome: lote.produto ? lote.produto.nome : 'N/A',
        precoCompraFormatado: parseFloat(lote.preco_compra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        precoVendaFormatado: parseFloat(lote.preco_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        numero_lote: lote.numero_lote,
        quantidade: lote.quantidade,
        localizacao: lote.localizacao,
        statusTexto: statusTexto,
        statusValidade: statusValidade,
        statusQuantidade: statusQuantidade,
        produto: {
            nome: lote.produto.nome
        }
    };
}

module.exports = { formatarLoteParaTabela };