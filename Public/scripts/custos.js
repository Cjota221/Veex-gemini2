// /veex-app/scripts/custos.js
import { createCard } from '../components/Card.js';
import { showModal, closeModal } from '../components/Modal.js';
import { showToast, displayMessageInPage, showLoading as showGridLoading } from './ui.js';
import { formatCurrency } from '../utils/helpers.js';

// Mock data (em um app real, viria de API/DB)
let custosFixosData = [
    { id: 1, descricao: 'Aluguel Fábrica', valorMensal: 2500.00, categoria: 'Estrutura' },
    { id: 2, descricao: 'Energia Elétrica (Administrativo)', valorMensal: 350.00, categoria: 'Administrativo' },
    { id: 3, descricao: 'Software de Gestão', valorMensal: 150.00, categoria: 'Tecnologia' }
];
let custosVariaveisData = [ // Custos variáveis gerais, não por unidade de produto específico inicialmente
    { id: 101, descricao: 'Embalagens (Caixas Padrão)', custoPorUnidadeEstimado: 0.80, categoria: 'Embalagem' },
    { id: 102, descricao: 'Frete Médio por Envio', custoPorUnidadeEstimado: 15.00, categoria: 'Logística' }
];
let nextCustoFixoId = 4;
let nextCustoVariavelId = 103;

export function init() {
    console.log('Página Custos Inicializada');
    renderCustosFixos();
    renderCustosVariaveis();
    setupEventListeners();
}

export function cleanup() {
    console.log('Página Custos Desmontada');
}

function renderCustosFixos() {
    const grid = document.getElementById('custosFixosGrid');
    const totalEl = document.getElementById('totalCustosFixos');
    if (!grid || !totalEl) return;
    grid.innerHTML = '';
    let totalFixos = 0;

    if (custosFixosData.length === 0) {
        grid.innerHTML = '<p>Nenhum custo fixo cadastrado.</p>';
    } else {
        custosFixosData.forEach(custo => {
            totalFixos += custo.valorMensal;
            const card = createCard({
                title: custo.descricao,
                iconSvgName: 'custos.svg', // Usar um ícone específico ou genérico
                info: `Categoria: <strong>${custo.categoria}</strong><br>
                       Valor Mensal: <strong>${formatCurrency(custo.valorMensal)}</strong>`,
                buttons: [
                    { text: 'Editar', type: 'primary', small: true, iconSvg: 'edit.svg', onClick: () => openCustoModal('fixo', custo.id) }
                ]
            });
            grid.appendChild(card);
        });
    }
    totalEl.textContent = `Total Custos Fixos Mensais: ${formatCurrency(totalFixos)}`;
}

function renderCustosVariaveis() {
    const grid = document.getElementById('custosVariaveisGrid');
     const totalEl = document.getElementById('totalCustosVariaveis');
    if (!grid || !totalEl) return;
    grid.innerHTML = '';
    let totalVariaveisGerais = 0; // Somar apenas os que não são "por unidade de produto" se houver essa distinção

    if (custosVariaveisData.length === 0) {
        grid.innerHTML = '<p>Nenhum custo variável geral cadastrado.</p>';
    } else {
        custosVariaveisData.forEach(custo => {
            // Aqui, o 'custoPorUnidadeEstimado' é um valor de referência
            totalVariaveisGerais += 0; // Não somar aqui, pois são por unidade ou evento específico
            const card = createCard({
                title: custo.descricao,
                iconSvgName: 'custos.svg',
                info: `Categoria: <strong>${custo.categoria}</strong><br>
                       Custo Estimado/Un.: <strong>${formatCurrency(custo.custoPorUnidadeEstimado)}</strong>`,
                buttons: [
                    { text: 'Editar', type: 'primary', small: true, iconSvg: 'edit.svg', onClick: () => openCustoModal('variavel', custo.id) }
                ]
            });
            grid.appendChild(card);
        });
    }
     totalEl.textContent = `(Custos variáveis são aplicados por unidade ou evento)`; // Atualizar se houver um total relevante
}

function setupEventListeners() {
    document.getElementById('addCustoFixoBtn')?.addEventListener('click', () => openCustoModal('fixo', null));
    document.getElementById('addCustoVariavelBtn')?.addEventListener('click', () => openCustoModal('variavel', null));
}

function openCustoModal(tipoCusto, custoId) { // tipoCusto: 'fixo' ou 'variavel'
    const isFixo = tipoCusto === 'fixo';
    const dataArray = isFixo ? custosFixosData : custosVariaveisData;
    const custo = custoId ? dataArray.find(c => c.id === custoId) : {};
    const isNew = !custoId;
    const title = `${isNew ? 'Adicionar' : 'Editar'} Custo ${isFixo ? 'Fixo' : 'Variável'}`;
    const formId = `custoForm-${tipoCusto}-${custoId || 'new'}`;

    let valorFieldHtml = '';
    if (isFixo) {
        valorFieldHtml = `
            <div class="form-group">
                <label for="${formId}-valorMensal">Valor Mensal (R$)*</label>
                <input type="number" id="${formId}-valorMensal" name="valorMensal" value="${custo.valorMensal || '0.00'}" step="0.01" required>
            </div>`;
    } else { // Variável
        valorFieldHtml = `
            <div class="form-group">
                <label for="${formId}-custoPorUnidadeEstimado">Custo Estimado por Unidade/Evento (R$)*</label>
                <input type="number" id="${formId}-custoPorUnidadeEstimado" name="custoPorUnidadeEstimado" value="${custo.custoPorUnidadeEstimado || '0.00'}" step="0.01" required>
            </div>`;
    }

    const content = `
        <form id="${formId}" class="modal-form" novalidate>
            <input type="hidden" name="id" value="${custo.id || ''}">
            <input type="hidden" name="tipoCusto" value="${tipoCusto}">
            <div class="form-group">
                <label for="${formId}-descricao">Descrição*</label>
                <input type="text" id="${formId}-descricao" name="descricao" value="${custo.descricao || ''}" required>
            </div>
            <div class="form-group">
                <label for="${formId}-categoria">Categoria</label>
                <input type="text" id="${formId}-categoria" name="categoria" value="${custo.categoria || ''}">
            </div>
            ${valorFieldHtml}
        </form>
    `;
    const footerButtons = [
        { text: 'Cancelar', type: 'secondary', onClick: closeModal },
        { text: 'Salvar', type: 'primary', id: `${formId}-saveBtn`, onClick: () => saveCusto(formId), keepOpen: true }
    ];
    if (!isNew) {
        footerButtons.unshift({
            text: 'Excluir', type: 'error', onClick: () => deleteCusto(tipoCusto, custo.id, custo.descricao), keepOpen: false
        });
    }

    showModal({ title, content, footerButtons });
}

function saveCusto(formId) {
    const form = document.getElementById(formId);
    if (!form || !form.checkValidity()) {
        showToast('Preencha os campos obrigatórios.', 'error');
        form.reportValidity();
        return;
    }
    const saveButton = document.getElementById(`${formId}-saveBtn`);
    if(saveButton) saveButton.disabled = true;

    const id = form.elements['id'].value ? parseInt(form.elements['id'].value) : null;
    const tipoCusto = form.elements['tipoCusto'].value;
    const descricao = form.elements['descricao'].value.trim();
    const categoria = form.elements['categoria'].value.trim();

    let custoData = { descricao, categoria };
    const isFixo = tipoCusto === 'fixo';

    if (isFixo) {
        custoData.valorMensal = parseFloat(form.elements['valorMensal'].value);
    } else {
        custoData.custoPorUnidadeEstimado = parseFloat(form.elements['custoPorUnidadeEstimado'].value);
    }

    // Simulação de API
    setTimeout(() => {
        const dataArray = isFixo ? custosFixosData : custosVariaveisData;
        let nextIdRef = isFixo ? nextCustoFixoId : nextCustoVariavelId;

        if (id) { // Editando
            const index = dataArray.findIndex(c => c.id === id);
            if (index > -1) {
                dataArray[index] = { ...dataArray[index], ...custoData, id:id };
            }
        } else { // Novo
            custoData.id = nextIdRef;
            dataArray.push(custoData);
            if(isFixo) nextCustoFixoId++; else nextCustoVariavelId++;
        }
        showToast(`Custo "${descricao}" salvo!`, 'success');
        closeModal();
        if (isFixo) renderCustosFixos(); else renderCustosVariaveis();
    }, 300);
}

function deleteCusto(tipoCusto, custoId, custoDescricao){
    if (confirm(`Tem certeza que deseja excluir o custo "${custoDescricao}"?`)) {
        setTimeout(() => {
            if(tipoCusto === 'fixo'){
                custosFixosData = custosFixosData.filter(c => c.id !== custoId);
                renderCustosFixos();
            } else {
                custosVariaveisData = custosVariaveisData.filter(c => c.id !== custoId);
                renderCustosVariaveis();
            }
            showToast(`Custo "${custoDescricao}" excluído.`, 'warning');
            closeModal();
        }, 300);
    }
}
