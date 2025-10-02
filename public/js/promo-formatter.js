async function formatarPromocaoParaExibicao(lote, desconto) {
    const produto = await lote.getProduto();

    let precoPromocional = 0;
    const precoOriginal = parseFloat(lote.preco_produto);

    if (desconto.tipo === 'porcentagem') {
        precoPromocional = precoOriginal * (1 - parseFloat(desconto.valor) / 100);
    } else {
        precoPromocional = precoOriginal - parseFloat(desconto.valor);
    }
    
    return {
        nome: produto.nome,
        lote: lote.numero_lote,
        precoOriginal: precoOriginal.toFixed(2),
        precoPromocional: precoPromocional.toFixed(2),
        dataInicio: desconto.data_inicio,
        dataFim: desconto.data_fim,
        loteId: lote.id_lote,
        produtoId: produto.id_produto
    };
}

module.exports = { formatarPromocaoParaExibicao };