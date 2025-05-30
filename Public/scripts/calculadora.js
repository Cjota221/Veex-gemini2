// /veex-app/scripts/calculadora.js
import { formatCurrency, getHashQueryParam } from '../utils/helpers.js';
import { calcularPrecoVenda, calcularCustoTotalInsumos } from '../utils/calculations.js';
import { showToast } from './ui.js';
// Supondo que modelos.js e custos.js exportem seus dados para consulta
// ou que você carregue os JSONs aqui.
const DATA_FILE_MODELOS = 'data/modelos.json';
const DATA_FILE_INSUMOS = 'data/insumos.json'; // Para calcular custo de insumos do modelo
// Custos fixos podem ser carregados para sugerir rateio
// const DATA_FILE_CUSTOS_FIXOS = 'data/custos_fixos.json'; (Não implementado neste exemplo)

let modelosDisponiveisCalc = [];
let insumosDisponiveisCalc = [];

export async function init() {
    console.log('Página Calculadora Inicializada');
    await loadCalculadoraData();
    populateModeloSelect();
    setupCalculadoraListeners();

    // Se um ID de modelo for passado via hash (ex: #/calculadora?modeloId=1)
    const modeloIdParam = getHashQueryParam('modeloId');
    if (modeloIdParam) {
        const modeloSelect = document.getElementById('calcModeloSelect');
        if (modeloSelect) {
            modeloSelect.value = modeloIdParam;
            handleModeloSelectChange(); // Preenche os campos com dados do modelo
        }
    }
}

export function cleanup() {
    console.log('Página Calculadora Desmontada');
}

async function loadCalculadoraData() {
    try {
        const [modelosRes, insumosRes] = await Promise.all([
            fetch(DATA_FILE_MODELOS),
            fetch(DATA_FILE_INSUMOS)
        ]);
        if(modelosRes.ok) modelosDisponiveisCalc = await modelosRes.json(); else modelosDisponiveisCalc = [];
        if(insumosRes.ok) insumosDisponiveisCalc = await insumosRes.json(); else insumosDisponiveisCalc = [];

    } catch (error) {
        console.error("Erro ao carregar dados para calculadora:", error);
        showToast("Erro ao carregar dados de modelos/insumos.", "error");
    }
}


function populateModeloSelect() {
    const select = document.getElementById('calcModeloSelect');
    if (!select || modelosDisponiveisCalc.length === 0) return;

    modelosDisponiveisCalc.forEach(modelo => {
        const option = document.createElement('option');
        option.value = modelo.id;
        option.textContent = `${modelo.nome} (Custo Dir.: ${formatCurrency(modelo.custoUnitario || 0)})`;
        option.dataset.custo = modelo.custoUnitario || 0;
        option.dataset.margem = modelo.margemLucro || 0;
        // Para carregar custo de insumos:
        // option.dataset.insumos = JSON.stringify(modelo.insumos || []);
        select.appendChild(option);
    });
}

function setupCalculadoraListeners() {
    document.getElementById('calcularPrecoBtn')?.addEventListener('click', performCalculation);
    document.getElementById('calcModeloSelect')?.addEventListener('change', handleModeloSelectChange);

    // Atualizar em tempo real (opcional, pode ser pesado)
    // ['calcCustoProduto', 'calcCustosFixosRateados', 'calcOutrosCustosVariaveis', 'calcMargemLucro'].forEach(id => {
    //     document.getElementById(id)?.addEventListener('input', performCalculation);
    // });
}

function handleModeloSelectChange() {
    const select = document.getElementById('calcModeloSelect');
    const custoProdutoInput = document.getElementById('calcCustoProduto');
    const margemLucroInput = document.getElementById('calcMargemLucro');
    // const custoInsumosInput = document.getElementById('calcCustoInsumos'); // Se for mostrar separado

    const selectedOption = select.options[select.selectedIndex];

    if (selectedOption && selectedOption.value !== "") {
        const custo = parseFloat(selectedOption.dataset.custo) || 0;
        const margem = parseFloat(selectedOption.dataset.margem) * 100 || 0; // Converte 0.5 para 50
        // const insumosDoModelo = JSON.parse(selectedOption.dataset.insumos || "[]");

        // const custoTotalInsumos = calcularCustoTotalInsumos(insumosDoModelo, insumosDisponiveisCalc);
        // if (custoInsumosInput) custoInsumosInput.value = custoTotalInsumos.toFixed(2);
        // Decidir se custoProdutoInput usa custoUnitario do modelo ou custo de insumos.
        // Por ora, usa o custoUnitario já calculado do modelo.
        if (custoProdutoInput) custoProdutoInput.value = custo.toFixed(2);
        if (margemLucroInput) margemLucroInput.value = margem.toFixed(0); // Margem em %

    } else { // Limpa se "--Selecione--"
        if (custoProdutoInput) custoProdutoInput.value = '';
        if (margemLucroInput) margemLucroInput.value = '';
    }
    // Limpar resultado ao mudar seleção
    document.getElementById('resultadoCalculadora').style.display = 'none';
}


function performCalculation() {
    const custoProduto = parseFloat(document.getElementById('calcCustoProduto').value) || 0;
    const custosFixosRateados = parseFloat(document.getElementById('calcCustosFixosRateados').value) || 0;
    const outrosCustosVariaveis = parseFloat(document.getElementById('calcOutrosCustosVariaveis').value) || 0; // Pode ser % ou valor
    const margemLucroPercent = parseFloat(document.getElementById('calcMargemLucro').value) || 0;

    if (custoProduto <= 0) {
        showToast('Informe o Custo Direto do Produto.', 'warning');
        return;
    }
    if (margemLucroPercent <= 0) {
        showToast('Informe a Margem de Lucro desejada (%).', 'warning');
        return;
    }

    // Interpretar outrosCustosVariaveis: se < 1, assume % do custoProduto, senão valor fixo.
    // Esta é uma simplificação. Poderia ter um select para tipo (%, R$).
    let outrosCustosVariaveisValor = outrosCustosVariaveis;
    if (outrosCustosVariaveis > 0 && outrosCustosVariaveis < 1) { // Ex: 0.1 para 10%
        outrosCustosVariaveisValor = custoProduto * outrosCustosVariaveis;
    }

    const custoTotalUnidade = custoProduto + custosFixosRateados + outrosCustosVariaveisValor;
    const margemDecimal = margemLucroPercent / 100;

    // Cálculo do preço de venda usando markup sobre o custo total
    // Preço de Venda = Custo Total / (1 - Margem de Lucro Desejada como decimal)
    // OU Preço de Venda = Custo Total * (1 + Margem de Lucro sobre o Custo) - Escolha uma abordagem.
    // A mais comum para garantir a margem sobre o preço de venda é:
    // Preço de Venda = Custo Total / (1 - %MargemSobrePrecoDeVenda)
    // Se a margem é sobre o custo:
    const precoVendaCalculado = custoTotalUnidade * (1 + margemDecimal);
    const valorLucro = precoVendaCalculado - custoTotalUnidade;
    const markupAplicado = precoVendaCalculado / custoTotalUnidade;


    document.getElementById('resCustoTotal').textContent = formatCurrency(custoTotalUnidade);
    document.getElementById('resValorLucro').textContent = formatCurrency(valorLucro);
    document.getElementById('resPrecoVenda').textContent = formatCurrency(precoVendaCalculado);
    document.getElementById('resMarkup').textContent = markupAplicado.toFixed(2);

    document.getElementById('resultadoCalculadora').style.display = 'block';
}
