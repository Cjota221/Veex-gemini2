// /veex-app/utils/calculations.js

/**
 * Calcula o preço de venda sugerido.
 * @param {number} custoTotal - Custo total do modelo/produto.
 * @param {number} margemDesejada - Margem de lucro desejada (ex: 0.5 para 50%, 1.0 para 100%).
 * @returns {number} - Preço de venda sugerido.
 */
export function calcularPrecoVenda(custoTotal, margemDesejada) {
    if (isNaN(parseFloat(custoTotal)) || isNaN(parseFloat(margemDesejada))) {
        console.warn('calcularPrecoVenda: Custo ou margem inválidos.', { custoTotal, margemDesejada });
        return 0;
    }
    return parseFloat(custoTotal) * (1 + parseFloat(margemDesejada));
}

/**
 * Calcula o lucro bruto unitário.
 * @param {number} precoVenda - Preço de venda unitário.
 * @param {number} custoTotal - Custo total unitário.
 * @returns {number} - Lucro bruto unitário.
 */
export function calcularLucroBrutoUnitario(precoVenda, custoTotal) {
    if (isNaN(parseFloat(precoVenda)) || isNaN(parseFloat(custoTotal))) {
        return 0;
    }
    return parseFloat(precoVenda) - parseFloat(custoTotal);
}

/**
 * Calcula o custo total de uma lista de insumos.
 * @param {Array<object>} insumosUsados - Array de insumos [{ insumoId, qtd, nome (opcional) }]
 * @param {Array<object>} definicoesInsumos - Array com definições de todos insumos [{ id, custoPorUnidade, nome }]
 * @returns {number} - Custo total dos insumos.
 */
export function calcularCustoTotalInsumos(insumosUsados, definicoesInsumos) {
    if (!Array.isArray(insumosUsados) || !Array.isArray(definicoesInsumos)) return 0;

    return insumosUsados.reduce((total, itemUsado) => {
        const definicao = definicoesInsumos.find(
            def => def.id === itemUsado.insumoId || def.nome === itemUsado.nome // Compatibilidade
        );
        if (definicao && definicao.custoPorUnidade && itemUsado.qtd) {
            return total + (parseFloat(definicao.custoPorUnidade) * parseFloat(itemUsado.qtd));
        }
        return total;
    }, 0);
}

// Adicionar outras funções de cálculo conforme necessário
// Ex: calcularCustoMaoDeObra, calcularCustosFixosRateadosPorProduto, etc.
