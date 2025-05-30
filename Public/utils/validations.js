// /veex-app/utils/validations.js

/**
 * Valida se um valor não está vazio (após trim).
 * @param {string} value - Valor a ser validado.
 * @returns {boolean} - True se válido (não vazio), false caso contrário.
 */
export function isNotEmpty(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
}

/**
 * Valida se é um email válido (básico).
 * @param {string} email - Email a ser validado.
 * @returns {boolean} - True se válido, false caso contrário.
 */
export function isValidEmail(email) {
    if (!isNotEmpty(email)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email));
}

/**
 * Valida se é um número positivo (maior que zero).
 * @param {number | string} value - Valor a ser validado.
 * @returns {boolean} - True se válido, false caso contrário.
 */
export function isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Valida se é um número não negativo (maior ou igual a zero).
 * @param {number | string} value - Valor a ser validado.
 * @returns {boolean} - True se válido, false caso contrário.
 */
export function isNonNegativeNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Valida se uma URL é válida (básica).
 * @param {string} url - URL a ser validada.
 * @returns {boolean} - True se válida, false caso contrário.
 */
export function isValidUrl(url) {
    if (!isNotEmpty(url)) return false;
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

// Adicionar outras funções de validação específicas da regra de negócio.
