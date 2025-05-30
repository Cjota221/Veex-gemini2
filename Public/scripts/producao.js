// /veex-app/scripts/producao.js
import { createCard } from '../components/Card.js';
import { showModal, closeModal } from '../components/Modal.js';
import { showToast, displayMessageInPage, showLoading as showGridLoading } from './ui.js';
import { formatDate, formatCurrency } from '../utils/helpers.js';
// Para carregar modelos e insumos para seleção na OP:
import { modelosData as getModelosData } from './modelos.js'; // Supondo que modelos.js exporte os dados carregados
// ou carregar diretamente dos JSONs
const DATA_FILE_PRODUCAO = 'data/producao.json';
const DATA_FILE_MODELOS_REF = 'data/modelos.json'; // Para referenciar nomes de modelos

let ordensProducaoData = [];
let modelosDisponiveis = []; // Para popular select no modal
let nextOrdemProducaoId = 1;

export async function init() {
    console.log('Página Produção Inicializada');
    const filterStatus = document.getElementById('filterProducaoStatus');
    if(filterStatus) {
        filterStatus.addEventListener('change', () => renderOrdensProducao(filterStatus.value));
    }
    await loadProducaoData();
    setupEventListeners();
}

export function cleanup() {
    console.log('Página Produção Desmontada');
    const filterStatus = document.getElementById('filterProducaoStatus');
     if(filterStatus) { // Remover listener
        filterStatus.removeEventListener('change', () => renderOrdensProducao(filterStatus.value));
    }
}

async function loadProducaoData() {
    const grid = document.getElementById('producaoGrid');
    if (grid) showGridLoading(grid);

    try {
        const [producaoRes, modelosRes] = await Promise.all([
            fetch(DATA_FILE_PRODUCAO),
            fetch(DATA_FILE_MODELOS_REF) // Carrega modelos para referência
        ]);

        if (!producaoRes.ok) throw new Error(`Falha ao carregar ordens de produção: ${producaoRes.statusText}`);
        if (!modelosRes.ok) throw new Error(`Falha ao carregar dados de modelos para referência: ${modelosRes.statusText}`);

        const data = await producaoRes.json();
        ordensProducaoData = Array.isArray(data) ? data : [];
        const modelos = await modelosRes.json();
        modelosDisponiveis = Array.isArray(modelos) ? modelos : [];


        let maxId = 0;
        ordensProducaoData.forEach(op => {
            if (typeof op.idProd !== 'number') op.idProd = Date.now() + Math.random(); // 'idProd' conforme JSON
            if (op.idProd > maxId) maxId = op.idProd;
        });
        nextOrdemProducaoId = ordensProducaoData.length > 0 ? Math.max(...ordensProducaoData.map(op => op.idProd || 0)) + 1 : 1;

        renderOrdensProducao();
    } catch (error) {
        console.error("Erro ao carregar dados de Produção:", error);
        ordensProducaoData = [];
        modelosDisponiveis = [];
        if (grid) displayMessageInPage(grid, 'Erro ao carregar dados das ordens de produção.', 'error', 0);
    }
}

function renderOrdensProducao(statusFilter = '') {
    const grid = document.getElementById('producaoGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filteredOPs = ordensProducaoData.filter(op =>
        statusFilter ? op.status === statusFilter : true
    );

    if (filteredOPs.length === 0) {
        grid.innerHTML = `<p style="padding: 20px; text-align:center;">Nenhuma Ordem de Produção encontrada${statusFilter ? ' para o status "' + statusFilter + '"' : ''}.</p>`;
        return;
    }

    filteredOPs.forEach(op => {
        // O JSON de produção tem `modeloNome`, mas o ideal seria buscar pelo `modeloId` em `modelosDisponiveis`
        const modeloRef = modelosDisponiveis.find(m => m.id === op.modeloId);
        const nomeModeloDisplay = modeloRef ? modeloRef.nome : (op.modeloNome || 'Modelo Desconhecido');
        const fotoModeloDisplay = modeloRef ? (modeloRef.foto || 'assets/img-modelos/placeholder-modelo.png') : 'assets/img-modelos/placeholder-modelo.png';

        const statusClass = `status-${op.status ? op.status.toLowerCase().replace(/\s+/g, '-') : 'desconhecido'}`;

        const card = createCard({
            imageUrl: fotoModeloDisplay,
            title: `OP #${op.idProd} - ${nomeModeloDisplay}`,
            info: `Quantidade: <strong>${op.quantidadeProgramada || op.quantidade || 0} un.</strong><br>
                   Início: <strong>${formatDate(op.dataInicio)}</strong> | Prev. Fim: <strong>${formatDate(op.dataPrevistaFim) || 'N/A'}</strong><br>
                   Status: <span class="status-tag ${statusClass}">${op.status || 'N/A'}</span><br>
                   Custo Est.: <strong>${formatCurrency(op.custoTotalEstimado || 0)}</strong>`,
            buttons: [
                { text: 'Detalhes', type: 'secondary', small: true, iconSvg: 'view.svg', onClick: () => openOrdemProducaoModal(op.idProd, true) },
                { text: 'Editar', type: 'primary', small: true, iconSvg: 'edit.svg', onClick: () => openOrdemProducaoModal(op.idProd) }
            ]
        });
        grid.appendChild(card);
    });
}

function setupEventListeners() {
    const addBtn = document.getElementById('addProducaoBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openOrdemProducaoModal(null));
    }
}

function openOrdemProducaoModal(opId, readOnly = false) {
    const op = opId ? ordensProducaoData.find(o => o.idProd === opId) : {};
    const isNew = !opId;
    const title = isNew ? 'Nova Ordem de Produção' : (readOnly ? `Detalhes OP #${op.idProd}` : `Editar OP #${op.idProd}`);
    const formId = `producaoForm-${opId || 'new'}`;

    let modelosOptions = '<option value="">Selecione um modelo...</option>';
    modelosDisponiveis.forEach(mod => {
        modelosOptions += `<option value="${mod.id}" ${op.modeloId === mod.id ? 'selected' : ''}>${mod.nome} (Custo: ${formatCurrency(mod.custoUnitario)})</option>`;
    });

    const statusOptions = ['Planejada', 'Em Andamento', 'Pausada', 'Concluída', 'Cancelada'];
    let statusSelectOptions = '';
    statusOptions.forEach(s => {
        statusSelectOptions += `<option value="${s}" ${op.status === s ? 'selected' : ''}>${s}</option>`;
    });

    const content = `
        <form id="${formId}" class="modal-form" novalidate>
            <input type="hidden" name="idProd" value="${op.idProd || ''}">
            <div class="form-group">
                <label for="${formId}-modeloId">Modelo do Produto*</label>
                <select id="${formId}-modeloId" name="modeloId" ${readOnly ? 'disabled' : ''} required>${modelosOptions}</select>
            </div>
            <div class="form-group">
                <label for="${formId}-quantidade">Quantidade a Produzir*</label>
                <input type="number" id="${formId}-quantidade" name="quantidade" value="${op.quantidadeProgramada || op.quantidade || ''}" min="1" step="1" ${readOnly ? 'disabled' : ''} required>
            </div>
            <div class="form-group">
                <label for="${formId}-dataInicio">Data de Início*</label>
                <input type="date" id="${formId}-dataInicio" name="dataInicio" value="${op.dataInicio || new Date().toISOString().split('T')[0]}" ${readOnly ? 'disabled' : ''} required>
            </div>
            <div class="form-group">
                <label for="${formId}-dataPrevistaFim">Data Prev. de Conclusão</label>
                <input type="date" id="${formId}-dataPrevistaFim" name="dataPrevistaFim" value="${op.dataPrevistaFim || ''}" ${readOnly ? 'disabled' : ''}>
            </div>
             <div class="form-group">
                <label for="${formId}-status">Status*</label>
                <select id="${formId}-status" name="status" ${readOnly ? 'disabled' : ''} required>${statusSelectOptions}</select>
            </div>
            <div class="form-group">
                <label for="${formId}-observacoes">Observações</label>
                <textarea id="${formId}-observacoes" name="observacoes" ${readOnly ? 'disabled' : ''}>${op.observacoes || ''}</textarea>
            </div>
             <div class="form-group">
                <label>Custo Total Estimado (R$)</label>
                <p id="${formId}-custoEstimado" class="text-pink" style="font-size: 1.1em;">${formatCurrency(op.custoTotalEstimado || 0)}</p>
            </div>
        </form>
    `;

    const footerButtons = readOnly ?
        [{ text: 'Fechar', type: 'secondary', onClick: closeModal }]
        :
        [
            { text: 'Cancelar', type: 'secondary', onClick: closeModal },
            { text: 'Salvar', type: 'primary', id: `${formId}-saveBtn`, onClick: () => saveOrdemProducao(formId), keepOpen: true }
        ];
    if (!isNew && !readOnly) {
        footerButtons.unshift({
            text: 'Excluir', type: 'error', onClick: () => deleteOrdemProducao(op.idProd, `OP #${op.idProd}`), keepOpen: false
        });
    }

    showModal({ title, content, footerButtons, size: 'lg' });

    if(!readOnly){
        // Listener para recalcular custo estimado ao mudar modelo ou quantidade
        const modeloSelect = document.getElementById(`${formId}-modeloId`);
        const qtdInput = document.getElementById(`${formId}-quantidade`);
        if(modeloSelect) modeloSelect.addEventListener('change', () => recalcularCustoEstimado(formId));
        if(qtdInput) qtdInput.addEventListener('input', () => recalcularCustoEstimado(formId));
    }
}

function recalcularCustoEstimado(formId) {
    const form = document.getElementById(formId);
    const modeloId = parseInt(form.elements['modeloId'].value);
    const quantidade = parseInt(form.elements['quantidade'].value) || 0;
    const custoEstimadoEl = document.getElementById(`${formId}-custoEstimado`);

    const modeloSelecionado = modelosDisponiveis.find(m => m.id === modeloId);
    if (modeloSelecionado && quantidade > 0) {
        const custoTotal = (modeloSelecionado.custoUnitario || 0) * quantidade;
        if(custoEstimadoEl) custoEstimadoEl.textContent = formatCurrency(custoTotal);
    } else {
        if(custoEstimadoEl) custoEstimadoEl.textContent = formatCurrency(0);
    }
}


function saveOrdemProducao(formId) {
    const form = document.getElementById(formId);
     if (!form || !form.checkValidity()) {
        showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
        form.reportValidity();
        return;
    }
    const saveButton = document.getElementById(`${formId}-saveBtn`);
    if(saveButton) saveButton.disabled = true;

    const idProd = form.elements['idProd'].value ? parseInt(form.elements['idProd'].value) : null;
    const modeloId = parseInt(form.elements['modeloId'].value);
    const quantidade = parseInt(form.elements['quantidade'].value);
    const dataInicio = form.elements['dataInicio'].value;
    const dataPrevistaFim = form.elements['dataPrevistaFim'].value;
    const status = form.elements['status'].value;
    const observacoes = form.elements['observacoes'].value.trim();

    const modeloSelecionado = modelosDisponiveis.find(m => m.id === modeloId);
    const custoTotalEstimado = modeloSelecionado ? (modeloSelecionado.custoUnitario || 0) * quantidade : 0;
    const modeloNome = modeloSelecionado ? modeloSelecionado.nome : 'Desconhecido';


    const opData = {
        modeloId,
        modeloNome, // Adicionar nome para facilitar exibição, embora não ideal para normalização
        quantidadeProgramada: quantidade, // Usar nome do JSON
        dataInicio,
        dataPrevistaFim: dataPrevistaFim || null, // Pode ser nulo
        status,
        observacoes,
        custoTotalEstimado
    };

    // Simulação de API
    setTimeout(() => {
        if (idProd) { // Editando
            const index = ordensProducaoData.findIndex(op => op.idProd === idProd);
            if (index > -1) {
                ordensProducaoData[index] = { ...ordensProducaoData[index], ...opData, idProd: idProd };
                showToast(`Ordem de Produção #${idProd} atualizada!`, 'success');
            }
        } else { // Novo
            opData.idProd = nextOrdemProducaoId++;
            ordensProducaoData.push(opData);
            showToast(`Nova Ordem de Produção #${opData.idProd} criada!`, 'success');
        }
        closeModal();
        renderOrdensProducao(document.getElementById('filterProducaoStatus').value);
    }, 300);
}

function deleteOrdemProducao(opId, opIdentifier) {
     if (confirm(`Tem certeza que deseja excluir a "${opIdentifier}"?`)) {
        setTimeout(() => {
            ordensProducaoData = ordensProducaoData.filter(op => op.idProd !== opId);
            showToast(`"${opIdentifier}" excluída.`, 'warning');
            renderOrdensProducao(document.getElementById('filterProducaoStatus').value);
            closeModal();
        }, 300);
    }
}
