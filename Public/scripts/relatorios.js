// /veex-app/scripts/relatorios.js
import { showToast } from './ui.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';
// Para relatórios, você precisaria carregar dados de vários módulos/JSONs
// Ex:
// import { ordensProducaoData } from './producao.js';
// import { modelosData } from './modelos.js';
// import { custosFixosData, custosVariaveisData } from './custos.js';

export function init() {
    console.log('Página Relatórios Inicializada');
    setupReportButtons();
}

export function cleanup() {
    console.log('Página Relatórios Desmontada');
    // Remover event listeners se houver algum global ou persistente aqui
}

function setupReportButtons() {
    const reportGrid = document.getElementById('relatoriosGrid');
    if (reportGrid) {
        reportGrid.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-report]');
            if (button) {
                const reportType = button.dataset.report;
                generateReport(reportType);
            }
        });
    }
}

async function generateReport(reportType) {
    const outputArea = document.getElementById('reportOutputArea');
    if (!outputArea) return;

    outputArea.innerHTML = `<p class="loading-placeholder">Gerando relatório "${reportType}"...</p>`;
    showToast(`Gerando relatório: ${reportType}...`, 'info');

    // Simulação de geração de relatório
    // Em um app real, aqui você buscaria e processaria os dados
    // e possivelmente usaria uma biblioteca para gerar PDF/Excel.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula processamento

    let reportContent = `<h5>Relatório: ${capitalizeReportName(reportType)}</h5>`;

    try {
        switch (reportType) {
            case 'producaoMensal':
                // const prodData = await fetch('data/producao.json').then(res => res.json());
                reportContent += `<p><strong>Período:</strong> Maio/2025 (Exemplo)</p>
                                  <ul>
                                    <li>Total Produzido: 80 unidades</li>
                                    <li>Custo Total de Produção: ${formatCurrency(2185.00)}</li>
                                    <li>Eficiência Média: 95%</li>
                                  </ul>`;
                break;
            case 'custosModelo':
                // const modData = await fetch('data/modelos.json').then(res => res.json());
                // const insData = await fetch('data/insumos.json').then(res => res.json());
                reportContent += `<p><strong>Modelo:</strong> Camiseta Clássica VEEX (Exemplo)</p>
                                  <ul>
                                    <li>Custo Insumos: ${formatCurrency(12.50)}/un.</li>
                                    <li>Custo Mão de Obra (Estimado): ${formatCurrency(3.00)}/un.</li>
                                    <li>Custos Indiretos Rateados: ${formatCurrency(2.00)}/un.</li>
                                    <li><strong>Custo Total Unitário: ${formatCurrency(17.50)}</strong></li>
                                  </ul>`;
                break;
            case 'lucratividade':
                reportContent += `<p><strong>Período:</strong> Últimos 30 dias (Exemplo)</p>
                                  <ul>
                                    <li>Receita Total: ${formatCurrency(15200.00)}</li>
                                    <li>Custo dos Produtos Vendidos (CPV): ${formatCurrency(8500.00)}</li>
                                    <li>Lucro Bruto: ${formatCurrency(6700.00)}</li>
                                    <li>Despesas Operacionais: ${formatCurrency(2300.00)}</li>
                                    <li><strong>Lucro Líquido: ${formatCurrency(4400.00)}</strong></li>
                                    <li>Margem de Lucro Líquida: 28.95%</li>
                                  </ul>`;
                break;
            case 'estoqueInsumos':
                // const insumosEstoque = await fetch('data/insumos.json').then(res => res.json());
                reportContent += `<p><strong>Data:</strong> ${formatDate(new Date())}</p>
                                  <table class="data-table" style="font-size:0.85rem;">
                                    <thead><tr><th>Insumo</th><th>Est. Atual</th><th>Est. Mínimo</th><th>Status</th></tr></thead>
                                    <tbody>
                                        <tr><td>Tecido Algodão Premium</td><td>120 m</td><td>50 m</td><td class="text-success">OK</td></tr>
                                        <tr><td>Linha de Costura Branca</td><td>5 cone(s)</td><td>10 cone(s)</td><td class="text-error">Baixo</td></tr>
                                        <tr><td>Denim Indigo</td><td>45 m</td><td>30 m</td><td class="text-success">OK</td></tr>
                                    </tbody>
                                  </table>`;
                break;
            default:
                reportContent += '<p>Tipo de relatório não reconhecido ou dados não disponíveis (simulação).</p>';
                showToast(`Relatório "${reportType}" não implementado.`, 'warning');
        }
        reportContent += `<div style="margin-top:15px;"><button class="btn btn-secondary btn-small">Exportar PDF (Simulado)</button> <button class="btn btn-secondary btn-small">Exportar Excel (Simulado)</button></div>`;

    } catch(error) {
        console.error(`Erro ao gerar relatório ${reportType}:`, error);
        reportContent = `<p class="text-error">Ocorreu um erro ao gerar o relatório "${reportType}".</p>`;
        showToast(`Erro ao gerar relatório ${reportType}.`, 'error');
    }

    outputArea.innerHTML = reportContent;
}

function capitalizeReportName(name) {
    // Simplesmente capitaliza a primeira letra e substitui camelCase por espaços
    const spacedName = name.replace(/([A-Z])/g, ' $1').trim();
    return spacedName.charAt(0).toUpperCase() + spacedName.slice(1);
}
