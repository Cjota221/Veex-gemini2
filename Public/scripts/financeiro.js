// /veex-app/scripts/financeiro.js
import { showModal, closeModal } from '../components/Modal.js';
import { showToast, displayMessageInPage, showLoading } from './ui.js';
import { formatDate, formatCurrency } from '../utils/helpers.js';

const DATA_FILE_FINANCEIRO = 'data/financeiro.json';
let lancamentosData = [];
let nextLancamentoId = 1;

export async function init() {
    console.log('Página Financeiro Inicializada');
    await loadLancamentosData();
    setupFinanceiroEventListeners();
    updateFinanceiroSummary(); // Calcula e exibe o resumo inicial
}

export function cleanup() {
    console.log('Página Financeiro Desmontada');
}

async function loadLancamentosData() {
    const tableBody = document.querySelector('#lancamentosTable tbody');
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="loading-placeholder">Carregando lançamentos...</td></tr>`;

    try {
        const response = await fetch(DATA_FILE_FINANCEIRO);
        if (!response.ok) throw new Error(`Falha ao carregar lançamentos: ${response.statusText}`);
        const data = await response.json();
        lancamentosData = Array.isArray(data) ? data : [];

        let maxId = 0;
        lancamentosData.forEach(l => {
            if (typeof l.id !== 'number') l.id = Date.now() + Math.random();
            if (l.id > maxId) maxId = l.id;
        });
        nextLancamentoId = lancamentosData.length > 0 ? Math.max(...lancamentosData.map(l => l.id || 0)) + 1 : 1;

        renderLancamentos();
    } catch (error) {
        console.error("Erro ao carregar dados Financeiros:", error);
        lancamentosData = [];
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-error">Erro ao carregar lançamentos.</td></tr>`;
    }
}

function renderLancamentos(filterMes = '', filterTipo = '') {
    const tableBody = document.querySelector('#lancamentosTable tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    let filteredLancamentos = lancamentosData;

    if (filterMes) { // filterMes está no formato "YYYY-MM"
        filteredLancamentos = filteredLancamentos.filter(l => l.data.startsWith(filterMes));
    }
    if (filterTipo) {
        filteredLancamentos = filteredLancamentos.filter(l => l.tipo === filterTipo);
    }

    // Ordenar por data (mais recente primeiro)
    filteredLancamentos.sort((a, b) => new Date(b.data) - new Date(a.data));


    if (filteredLancamentos.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum lançamento encontrado para os filtros aplicados.</td></tr>`;
        return;
    }

    filteredLancamentos.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(l.data)}</td>
            <td>${l.descricao}</td>
            <td>${l.categoria || 'N/A'}</td>
            <td class="tipo-${l.tipo}">${l.tipo.charAt(0).toUpperCase() + l.tipo.slice(1)}</td>
            <td class="tipo-${l.tipo}">${formatCurrency(l.valor)}</td>
            <td class="action-buttons-table">
                <button class="btn btn-secondary btn-small btn-edit-lancamento" data-id="${l.id}" title="Editar">
                    <img src="assets/icons/edit.svg" alt="Editar" class="btn-icon-svg">
                </button>
                <button class="btn btn-error btn-small btn-delete-lancamento" data-id="${l.id}" title="Excluir">
                     <img src="assets/icons/trash.svg" alt="Excluir" class="btn-icon-svg"> </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function updateFinanceiroSummary() {
    const saldoEl = document.getElementById('financeiroSaldoAtual');
    const entradasEl = document.getElementById('financeiroTotalEntradas');
    const saidasEl = document.getElementById('financeiroTotalSaidas');

    let totalEntradas = 0;
    let totalSaidas = 0;
    const hoje = new Date();
    const mesAtual = hoje.toISOString().substring(0, 7); // YYYY-MM

    lancamentosData.forEach(l => {
        if (l.tipo === 'entrada') {
            totalEntradas += l.valor;
            // Para entradas do mês atual (exemplo)
            // if (l.data.startsWith(mesAtual)) totalEntradasMes += l.valor;
        } else if (l.tipo === 'saida') {
            totalSaidas += l.valor;
            // if (l.data.startsWith(mesAtual)) totalSaidasMes += l.valor;
        }
    });

    const saldoAtual = totalEntradas - totalSaidas;

    if (saldoEl) saldoEl.textContent = formatCurrency(saldoAtual);
    if (entradasEl) entradasEl.textContent = formatCurrency(totalEntradas); // Poderia ser total do mês
    if (saidasEl) saidasEl.textContent = formatCurrency(totalSaidas);   // Poderia ser total do mês
}

function setupFinanceiroEventListeners() {
    document.getElementById('addLancamentoBtn')?.addEventListener('click', () => openLancamentoModal(null));
    document.getElementById('filterLancamentoMes')?.addEventListener('change', applyFilters);
    document.getElementById('filterLancamentoTipo')?.addEventListener('change', applyFilters);

    // Delegação de eventos para botões na tabela
    const table = document.getElementById('lancamentosTable');
    table?.addEventListener('click', (event) => {
        const editButton = event.target.closest('.btn-edit-lancamento');
        const deleteButton = event.target.closest('.btn-delete-lancamento');

        if (editButton) {
            const lancamentoId = parseInt(editButton.dataset.id);
            openLancamentoModal(lancamentoId);
        } else if (deleteButton) {
            const lancamentoId = parseInt(deleteButton.dataset.id);
            const lancamento = lancamentosData.find(l => l.id === lancamentoId);
            if(lancamento) deleteLancamento(lancamentoId, lancamento.descricao);
        }
    });
}

function applyFilters() {
    const mes = document.getElementById('filterLancamentoMes').value;
    const tipo = document.getElementById('filterLancamentoTipo').value;
    renderLancamentos(mes, tipo);
}


function openLancamentoModal(lancamentoId) {
    const lancamento = lancamentoId ? lancamentosData.find(l => l.id === lancamentoId) : {};
    const isNew = !lancamentoId;
    const title = isNew ? 'Novo Lançamento Financeiro' : `Editar Lançamento: ${lancamento.descricao}`;
    const formId = `lancamentoForm-${lancamentoId || 'new'}`;

    const content = `
        <form id="${formId}" class="modal-form" novalidate>
            <input type="hidden" name="id" value="${lancamento.id || ''}">
            <div class="form-group">
                <label for="${formId}-data">Data*</label>
                <input type="date" id="${formId}-data" name="data" value="${lancamento.data || new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label for="${formId}-descricao">Descrição*</label>
                <input type="text" id="${formId}-descricao" name="descricao" value="${lancamento.descricao || ''}" required>
            </div>
            <div class="form-group">
                <label for="${formId}-categoria">Categoria</label>
                <input type="text" id="${formId}-categoria" name="categoria" value="${lancamento.categoria || ''}">
            </div>
            <div class="form-group">
                <label for="${formId}-tipo">Tipo*</label>
                <select id="${formId}-tipo" name="tipo" required>
                    <option value="entrada" ${lancamento.tipo === 'entrada' ? 'selected' : ''}>Entrada</option>
                    <option value="saida" ${lancamento.tipo === 'saida' ? 'selected' : ''}>Saída</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${formId}-valor">Valor (R$)*</label>
                <input type="number" id="${formId}-valor" name="valor" value="${lancamento.valor || '0.00'}" step="0.01" required>
            </div>
        </form>
    `;
    const footerButtons = [
        { text: 'Cancelar', type: 'secondary', onClick: closeModal },
        { text: 'Salvar', type: 'primary', id: `${formId}-saveBtn`, onClick: () => saveLancamento(formId), keepOpen: true }
    ];
     if (!isNew) {
        footerButtons.unshift({ text: 'Excluir', type: 'error', onClick: () => deleteLancamento(lancamento.id, lancamento.descricao), keepOpen: false });
    }

    showModal({ title, content, footerButtons });
}

function saveLancamento(formId) {
    const form = document.getElementById(formId);
    if (!form || !form.checkValidity()) {
        showToast('Preencha os campos obrigatórios.', 'error');
        form.reportValidity();
        return;
    }
     const saveButton = document.getElementById(`${formId}-saveBtn`);
    if(saveButton) saveButton.disabled = true;

    const id = form.elements['id'].value ? parseInt(form.elements['id'].value) : null;
    const data = form.elements['data'].value;
    const descricao = form.elements['descricao'].value.trim();
    const categoria = form.elements['categoria'].value.trim();
    const tipo = form.elements['tipo'].value;
    const valor = parseFloat(form.elements['valor'].value);

    if (valor <= 0) {
        showToast('O valor do lançamento deve ser positivo.', 'error');
        if(saveButton) saveButton.disabled = false;
        return;
    }

    const lancamentoData = { data, descricao, categoria, tipo, valor };

    setTimeout(() => {
        if (id) { // Editando
            const index = lancamentosData.findIndex(l => l.id === id);
            if (index > -1) lancamentosData[index] = { ...lancamentosData[index], ...lancamentoData, id:id };
        } else { // Novo
            lancamentoData.id = nextLancamentoId++;
            lancamentosData.push(lancamentoData);
        }
        showToast(`Lançamento "${descricao}" salvo!`, 'success');
        closeModal();
        renderLancamentos(document.getElementById('filterLancamentoMes').value, document.getElementById('filterLancamentoTipo').value);
        updateFinanceiroSummary();
    }, 300);
}

function deleteLancamento(lancamentoId, lancamentoDescricao) {
    if (confirm(`Tem certeza que deseja excluir o lançamento "${lancamentoDescricao}"?`)) {
        setTimeout(() => {
            lancamentosData = lancamentosData.filter(l => l.id !== lancamentoId);
            showToast(`Lançamento "${lancamentoDescricao}" excluído.`, 'warning');
            renderLancamentos(document.getElementById('filterLancamentoMes').value, document.getElementById('filterLancamentoTipo').value);
            updateFinanceiroSummary();
            closeModal();
        }, 300);
    }
}
