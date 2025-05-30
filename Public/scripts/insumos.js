// /veex-app/scripts/insumos.js
import { createCard } from '../components/Card.js';
import { showModal, closeModal } from '../components/Modal.js';
import { showToast, displayMessageInPage } from './ui.js';
import { formatCurrency } from '../utils/helpers.js';

let insumosData = [];
const DATA_FILE_INSUMOS = 'data/insumos.json';

export async function init() {
    console.log('Página Insumos Inicializada');
    await loadInsumosData();
    renderInsumos();
    setupEventListeners();
}

export function cleanup() {
    console.log('Página Insumos Desmontada');
}

async function loadInsumosData() {
    const grid = document.getElementById('insumosGrid'); // Supondo que exista um grid
    if (grid) grid.innerHTML = '<p class="loading-placeholder">Carregando insumos...</p>';
    try {
        const response = await fetch(DATA_FILE_INSUMOS);
        if (!response.ok) throw new Error(`Falha ao carregar insumos: ${response.statusText}`);
        insumosData = await response.json();
        if (!Array.isArray(insumosData)) insumosData = [];
    } catch (error) {
        console.error("Erro ao carregar dados de Insumos:", error);
        insumosData = [];
        if (grid) displayMessageInPage(grid, 'Erro ao carregar dados dos insumos.', 'error', 0);
    }
}

function renderInsumos() {
    const grid = document.getElementById('insumosGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (insumosData.length === 0) {
        grid.innerHTML = '<p style="padding: 20px; text-align:center;">Nenhum insumo cadastrado.</p>';
        return;
    }
    // TODO: Implementar a renderização dos cards de insumos
    insumosData.forEach(insumo => {
        const card = createCard({
            title: insumo.nome,
            iconSvgName: 'insumos.svg', // Ou um ícone genérico para item
            info: `Categoria: <strong>${insumo.categoria || 'N/A'}</strong><br>
                   Unidade: <strong>${insumo.unidadeMedida || 'N/A'}</strong><br>
                   Custo/Un.: <strong>${formatCurrency(insumo.custoPorUnidade || 0)}</strong><br>
                   Estoque: <strong>${insumo.estoqueAtual || 0}</strong> (Min: ${insumo.estoqueMinimo || 0})`,
            buttons: [
                { text: 'Editar', type: 'primary', small: true, iconSvg: 'edit.svg', onClick: () => openInsumoModal(insumo.id) }
            ]
        });
        grid.appendChild(card);
    });
}

function setupEventListeners() {
    const addBtn = document.getElementById('addInsumoBtn'); // Precisa existir no insumos.html
    if (addBtn) {
        addBtn.addEventListener('click', () => openInsumoModal(null));
    }
}

function openInsumoModal(insumoId) {
    // TODO: Implementar a lógica do modal para adicionar/editar insumos
    const insumo = insumoId ? insumosData.find(i => i.id === insumoId) : {};
    const isNew = !insumoId;
    const title = isNew ? 'Adicionar Novo Insumo' : `Editar Insumo: ${insumo.nome}`;

    const content = `
        <form id="insumoForm-${insumoId || 'new'}" class="modal-form">
            <p>Formulário de ${title} aqui...</p>
            <div class="form-group">
                <label for="insumoNome">Nome do Insumo</label>
                <input type="text" id="insumoNome" name="nome" value="${insumo.nome || ''}" required>
            </div>
            </form>
    `;
    showModal({
        title,
        content,
        footerButtons: [
            { text: 'Cancelar', type: 'secondary', onClick: closeModal },
            { text: 'Salvar', type: 'primary', onClick: () => saveInsumo(`insumoForm-${insumoId || 'new'}`) }
        ]
    });
}

function saveInsumo(formId) {
    // TODO: Implementar a lógica para salvar o insumo
    showToast('Funcionalidade de salvar insumo a ser implementada.', 'info');
    console.log(`Salvando dados do formulário: ${formId}`);
    // closeModal();
    // renderInsumos();
}
