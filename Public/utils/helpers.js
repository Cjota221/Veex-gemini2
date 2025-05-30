// /veex-app/utils/helpers.js

/**
 * Formata um número para o padrão monetário brasileiro (BRL).
 * @param {number} value - Número a ser formatado.
 * @param {object} [options] - Opções de formatação Intl.NumberFormat.
 * @returns {string} - Valor formatado como R$ 0,00. Retorna 'N/A' se o valor não for número.
 */
export function formatCurrency(value, options = {}) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return 'N/A'; // Ou 'R$ 0,00' ou lançar erro, dependendo da preferência
    }
    const defaultOptions = { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return numValue.toLocaleString('pt-BR', { ...defaultOptions, ...options });
}

/**
 * Formata uma data para o padrão dd/mm/yyyy.
 * @param {string | Date} dateInput - String de data (ISO 8601 preferível) ou objeto Date.
 * @returns {string} - Data formatada ou string vazia se inválida.
 */
export function formatDate(dateInput) {
    if (!dateInput) return '';
    try {
        const date = new Date(dateInput);
        // Adiciona verificação se a data é válida após a conversão
        if (isNaN(date.getTime())) return '';

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é base 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.warn("Erro ao formatar data:", dateInput, error);
        return '';
    }
}

/**
 * Gera um ID único simples (para uso client-side em mocks, não globalmente único).
 * Cuidado: Não use para chaves primárias em bancos de dados reais.
 * @returns {string}
 */
export function generateSimpleUID() {
    return `uid-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Debounce function: Atrasar a execução de uma função até que um certo tempo tenha passado sem chamadas.
 * @param {Function} func - A função a ser "debounced".
 * @param {number} delay - O tempo de espera em milissegundos.
 * @returns {Function} - A nova função "debounced".
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Capitaliza a primeira letra de cada palavra em uma string.
 * @param {string} str - A string para capitalizar.
 * @returns {string} - A string capitalizada.
 */
export function capitalizeWords(str) {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Obtém o valor de um parâmetro da query string da URL do hash.
 * Ex: #/modelos?action=novo -> getHashQueryParam('action') retorna 'novo'
 * @param {string} paramName - O nome do parâmetro.
 * @returns {string|null} - O valor do parâmetro ou null se não encontrado.
 */
export function getHashQueryParam(paramName) {
    const hash = window.location.hash;
    const queryStringPart = hash.split('?')[1];
    if (queryStringPart) {
        const urlParams = new URLSearchParams(queryStringPart);
        return urlParams.get(paramName);
    }
    return null;
}
