// /veex-app/scripts/insumos.js
import { createCard } from '../components/Card.js';
import { showModal, closeModal } from '../components/Modal.js';
import { showToast, displayMessageInPage, showLoading as showGridLoading } from './ui.js';
import { formatCurrency } from '../utils/helpers.js';
import { isNotEmpty, isNonNegativeNumber, isPositiveNumber } from '../utils/validations.js';

let insumosData = [];
const DATA_FILE_INSUMOS = 'data/insumos.json';
let nextInsumoId = 1; // Para simular auto-incremento

export async function init() {
    console.log('Página Insumos Inicializada');
    const searchInput = document.getElementById('searchInsumoInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderInsumos(searchInput.value.toLowerCase()));
    }
    await loadInsumosData();
    setupEventListeners();
}

export function cleanup() {
    console.log('Página Insumos Desmontada');
    const searchInput = document.getElementById('searchInsumoInput');
    if (searchInput) { // Remover listener se a página for realmente "desmontada"
        searchInput.removeEventListener('input', () => renderInsumos(searchInput.value.toLowerCase()));
    }
}

async function loadInsumosData() {
    const grid = document.getElementById('insumosGrid');
    if (grid) showGridLoading(grid);
    try {
        const response = await fetch(DATA_FILE_INSUMOS);
        if (!response.ok) throw new Error(`Falha ao carregar insumos: ${response.statusText}`);
        const data = await response.json();
        insumosData = Array.isArray(data) ? data : [];

        // Simula IDs se não existirem (para mock)
        let maxId = 0;
        insumosData.forEach(ins => {
            if (typeof ins.id !== 'number') ins.id = Date.now() + Math.random();
            if (ins.id > maxId) maxId = ins.id;
        });
        nextInsumoId = insumosData.length > 0 ? Math.max(...insumosData.map(i => i.id || 0)) + 1 : 1;

        renderInsumos();
    } catch (error) {
        console.error("Erro ao carregar dados de Insumos:", error);
        insumosData = [];
        if (grid) displayMessageInPage(grid, 'Erro ao carregar dados dos insumos.', 'error', 0);
    }
}

function renderInsumos(searchTerm = '') {
    const grid = document.getElementById('insumosGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filteredInsumos = insumosData.filter(insumo =>
        insumo.nome.toLowerCase().includes(searchTerm) ||
        (insumo.categoria && insumo.categoria.toLowerCase().includes(searchTerm))
    );

    if (filteredInsumos.length === 0) {
        grid.innerHTML = `<p style="padding: 20px; text-align:center;">Nenhum insumo encontrado${searchTerm ? ' para "' + searchTerm + '"' : ''}.</p>`;
        return;
    }

    filteredInsumos.forEach(insumo => {
        const estoqueAtual = insumo.estoqueAtual || 0;
        const estoqueMinimo = insumo.estoqueMinimo || 0;
        let estoqueInfo = `Estoque: <strong>${estoqueAtual} ${insumo.unidadeMedida || ''}</strong>`;
        if (estoqueAtual < estoqueMinimo) {
            estoqueInfo += ` <span class="text-error">(Abaixo do mínimo: ${estoqueMinimo})</span>`;
        } else if (estoqueAtual === estoqueMinimo) {
            estoqueInfo += ` <span class="text-warning">(No limite mínimo: ${estoqueMinimo})</span>`;
        }


        const card = createCard({
            title: insumo.nome,
            iconSvgName: 'insumos.svg',
            info: `Categoria: <strong>${insumo.categoria || 'N/A'}</strong><br>
                   Custo/Un.: <strong>${formatCurrency(insumo.custoPorUnidade || 0)}</strong><br>
                   ${estoqueInfo}`,
            buttons: [
                { text: 'Editar', type: 'primary', small: true, iconSvg: 'edit.svg', onClick: () => openInsumoModal(insumo.id) }
            ],
            customClasses: estoqueAtual < estoqueMinimo ? 'card-warning-border' : '' // Adicionar CSS para .card-warning-border
        });
        grid.appendChild(card);
    });
}

function setupEventListeners() {
    const addBtn = document.getElementById('addInsumoBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openInsumoModal(null));
    }
}

function openInsumoModal(insumoId) {
    const insumo = insumoId ? insumosData.find(i => i.id === insumoId) : {};
    const isNew = !insumoId;
    const title = isNew ? 'Adicionar Novo Insumo' : `Editar Insumo: ${insumo.nome}`;
    const formId = `insumoForm-${insumoId || 'new'}`;

    const content = `
        <form id="${formId}" class="modal-form" novalidate>
            <input type="hidden" name="id" value="${insumo.id || ''}">
            <div class="form-group">
                <label for="${formId}-nome">Nome do Insumo*</label>
                <input type="text" id="${formId}-nome" name="nome" value="${insumo.nome || ''}" required>
            </div>
            <div class="form-group">
                <label for="${formId}-categoria">Categoria</label>
                <input type="text" id="${formId}-categoria" name="categoria" value="${insumo.categoria || ''}">
            </div>
            <div class="form-group">
                <label for="${formId}-unidadeMedida">Unidade de Medida* (ex: m, kg, un, cone)</label>
                <input type="text" id="${formId}-unidadeMedida" name="unidadeMedida" value="${insumo.unidadeMedida || ''}" required>
            </div>
            <div class="form-group">
                <label for="${formId}-custoPorUnidade">Custo por Unidade (R$)*</label>
                <input type="number" id="${formId}-custoPorUnidade" name="custoPorUnidade" value="${insumo.custoPorUnidade || '0.00'}" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="${formId}-estoqueAtual">Estoque Atual*</label>
                <input type="number" id="${formId}-estoqueAtual" name="estoqueAtual" value="${insumo.estoqueAtual || '0'}" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="${formId}-estoqueMinimo">Estoque Mínimo</label>
                <input type="number" id="${formId}-estoqueMinimo" name="estoqueMinimo" value="${insumo.estoqueMinimo || '0'}" step="0.01">
            </div>
        </form>
    `;
    const footerButtons = [
        { text: 'Cancelar', type: 'secondary', onClick: closeModal },
        { text: 'Salvar', type: 'primary', id: `${formId}-saveBtn`, onClick: () => saveInsumo(formId), keepOpen: true }
    ];
     if (!isNew) {
        footerButtons.unshift({
            text: 'Excluir', type: 'error', onClick: () => deleteInsumo(insumo.id, insumo.nome), keepOpen: false
        });
    }

    showModal({ title, content, footerButtons, size: 'md' });
}

function saveInsumo(formId) {
    const form = document.getElementById(formId);
    if (!form || !form.checkValidity()) {
        showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
        form.reportValidity();
        return;
    }
    const saveButton = document.getElementById(`${formId}-saveBtn`);
    if(saveButton) saveButton.disabled = true;

    const id = form.elements['id'].value ? parseInt(form.elements['id'].value) : null;
    const nome = form.elements['nome'].value.trim();
    const categoria = form.elements['categoria'].value.trim();
    const unidadeMedida = form.elements['unidadeMedida'].value.trim();
    const custoPorUnidade = parseFloat(form.elements['custoPorUnidade'].value);
    const estoqueAtual = parseFloat(form.elements['estoqueAtual'].value);
    const estoqueMinimo = parseFloat(form.elements['estoqueMinimo'].value);

    // Validações adicionais
    if (!isNotEmpty(nome) || !isNotEmpty(unidadeMedida) || !isPositiveNumber(custoPorUnidade) || !isNonNegativeNumber(estoqueAtual)) {
        showToast('Dados inválidos. Verifique os campos.', 'error');
        if(saveButton) saveButton.disabled = false;
        return;
    }

    const insumoData = {
        nome, categoria, unidadeMedida, custoPorUnidade, estoqueAtual, estoqueMinimo
    };

    // Simulação de API
    setTimeout(() => {
        if (id) { // Editando
            const index = insumosData.findIndex(i => i.id === id);
            if (index > -1) {
                insumosData[index] = { ...insumosData[index], ...insumoData, id: id };
                showToast(`Insumo "${nome}" atualizado!`, 'success');
            }
        } else { // Novo
            insumoData.id = nextInsumoId++;
            insumosData.push(insumoData);
            showToast(`Insumo "${nome}" adicionado!`, 'success');
        }
        closeModal();
        renderInsumos();
        // console.log("Insumos para salvar:", insumosData);
    }, 300);
}

function deleteInsumo(insumoId, insumoNome) {
    if (confirm(`Tem certeza que deseja excluir o insumo "${insumoNome}"?`)) {
        // Simulação de API
        setTimeout(() => {
            insumosData = insumosData.filter(i => i.id !== insumoId);
            showToast(`Insumo "${insumoNome}" excluído.`, 'warning');
            renderInsumos();
            closeModal();
        }, 300);
    }
}

// Adicionar no main.css:
// .card-warning-border { border-left: 4px solid var(--warning-color); }
