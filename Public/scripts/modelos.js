// /veex-app/scripts/modelos.js
import { createCard } from '../components/Card.js';
import { showModal, closeModal, getCurrentModalBody } from '../components/Modal.js';
import { showLoading, displayMessageInPage, showToast } from './ui.js';
import { formatCurrency } from '../utils/helpers.js';
// import { fetchData, postData, putData, deleteData } from '../utils/api.js'; // Para API real

// Mock de dados - Em um app real, isso viria de uma API ou IndexedDB
let modelosData = []; // Será populado com dados do JSON ou API
let insumosDisponiveis = []; // Para o select de insumos no modal
const DATA_FILE_MODELOS = 'data/modelos.json';
const DATA_FILE_INSUMOS = 'data/insumos.json'; // Para popular o select de insumos

export async function init() {
    console.log('Página Modelos Inicializada');
    await loadInitialData(); // Carrega modelos e insumos
    renderModelos();
    setupEventListeners();

    // Lidar com ?action=novo na URL (exemplo)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    if (urlParams.get('action') === 'novo') {
        openModeloModal(null);
    }
}

export function cleanup() {
    console.log('Página Modelos Desmontada');
    // Remover event listeners específicos se necessário
}

async function loadInitialData() {
    const grid = document.getElementById('modelosGrid');
    if (grid) showLoading(grid);

    try {
        const [modelosRes, insumosRes] = await Promise.all([
            fetch(DATA_FILE_MODELOS),
            fetch(DATA_FILE_INSUMOS)
        ]);

        if (!modelosRes.ok) throw new Error(`Falha ao carregar modelos: ${modelosRes.statusText}`);
        if (!insumosRes.ok) throw new Error(`Falha ao carregar insumos: ${insumosRes.statusText}`);

        modelosData = await modelosRes.json();
        insumosDisponiveis = await insumosRes.json();

        if (!Array.isArray(modelosData)) modelosData = [];
        // Adiciona um ID numérico simples se não houver, para simular banco de dados.
        // Em um app real, o backend cuidaria dos IDs.
        let maxId = 0;
        modelosData.forEach(m => {
            if(typeof m.id !== 'number') m.id = Date.now() + Math.random(); // ID temporário
            if (typeof m.id === 'number' && m.id > maxId) maxId = m.id;
        });
        // Para garantir que nextId seja único para novos itens, se ids são numéricos
        // nextId = modelosData.length > 0 ? Math.max(...modelosData.map(m => m.id || 0)) + 1 : 1;

    } catch (error) {
        console.error("Erro ao carregar dados iniciais de Modelos:", error);
        modelosData = [];
        insumosDisponiveis = [];
        if (grid) displayMessageInPage(grid, 'Erro ao carregar dados dos modelos.', 'error', 0);
    }
}


function setupEventListeners() {
    const addModeloBtn = document.getElementById('addModeloBtn');
    if (addModeloBtn) {
        addModeloBtn.addEventListener('click', () => openModeloModal(null));
    }
    // Event listener para botões de delete (delegação de evento, caso os cards sejam re-renderizados)
    // O ideal é adicionar listeners nos botões quando são criados, como já está no `createCard`.
}

function renderModelos() {
    const grid = document.getElementById('modelosGrid');
    if (!grid) return;
    grid.innerHTML = ''; // Limpar

    if (modelosData.length === 0) {
        grid.innerHTML = '<p style="padding: 20px; text-align:center;">Nenhum modelo cadastrado. Clique em "Adicionar Novo Modelo" para começar.</p>';
        return;
    }

    modelosData.forEach(modelo => {
        const valorVenda = modelo.custoUnitario && typeof modelo.margemLucro !== 'undefined'
            ? modelo.custoUnitario * (1 + modelo.margemLucro)
            : 0;

        const card = createCard({
            imageUrl: modelo.foto || 'assets/img-modelos/placeholder-modelo.png',
            title: modelo.nome,
            info: `Código: <strong>${modelo.codigo || 'N/A'}</strong><br>
                   Custo Unit.: <strong>${formatCurrency(modelo.custoUnitario || 0)}</strong><br>
                   Venda Sug.: <strong>${formatCurrency(valorVenda)}</strong>`,
            buttons: [
                { text: 'Detalhes', type: 'secondary', small: true, iconSvg: 'view.svg', onClick: () => openModeloModal(modelo.id, true) },
                { text: 'Editar', type: 'primary', small: true, iconSvg: 'edit.svg', onClick: () => openModeloModal(modelo.id) }
            ],
            dataAttributes: { 'data-modelo-id': modelo.id }
        });
        grid.appendChild(card);
    });
}

function getNextId() {
    // Para simulação de IDs únicos. Em um backend, o DB geraria isso.
    return modelosData.length > 0 ? Math.max(...modelosData.map(m => (typeof m.id === 'number' ? m.id : 0) )) + 1 : 1;
}


function openModeloModal(modeloId, readOnly = false) {
    const modelo = modeloId ? modelosData.find(m => m.id === modeloId) : {};
    const isNew = !modeloId;
    const title = isNew ? 'Adicionar Novo Modelo' : (readOnly ? `Detalhes: ${modelo.nome}` : `Editar: ${modelo.nome}`);
    const formId = `modeloForm-${modeloId || 'new'}`;

    let insumosHtmlList = '';
    if (modelo && modelo.insumos && modelo.insumos.length > 0) {
        modelo.insumos.forEach(ins => {
            const insumoDetalhe = insumosDisponiveis.find(iDisp => iDisp.id === ins.insumoId || iDisp.nome === ins.nome); // Compatibilidade
            const unidade = insumoDetalhe ? ` ${insumoDetalhe.unidadeMedida || 'un'}` : '';
            insumosHtmlList += `<li data-insumo-id="${ins.insumoId || ins.nome}" data-insumo-nome="${ins.nome}">
                                <span class="insumo-details">${ins.nome}: ${ins.qtd}${unidade}</span>
                                ${!readOnly ? '<button type="button" class="btn-remove-insumo">&times;</button>' : ''}
                              </li>`;
        });
    } else if (!readOnly) {
        insumosHtmlList = '<li>Nenhum insumo adicionado.</li>';
    }


    // Dropdown para adicionar insumos
    let insumosDropdownOptions = '<option value="">Selecione um insumo...</option>';
    insumosDisponiveis.forEach(ins => {
        insumosDropdownOptions += `<option value="${ins.id}" data-unidade="${ins.unidadeMedida || 'un'}">${ins.nome} (${ins.unidadeMedida || 'un'})</option>`;
    });

    const custoTotalInsumos = modelo.insumos ? modelo.insumos.reduce((acc, curr) => {
        const insumoDef = insumosDisponiveis.find(i => i.id === curr.insumoId || i.nome === curr.nome);
        return acc + ((insumoDef ? insumoDef.custoPorUnidade : 0) * curr.qtd);
    }, 0) : 0;

    const custoUnitarioCalculado = (modelo.custoUnitario && !isNew) ? modelo.custoUnitario : custoTotalInsumos;


    const valorVendaSugerido = custoUnitarioCalculado && typeof modelo.margemLucro !== 'undefined'
        ? (custoUnitarioCalculado * (1 + modelo.margemLucro))
        : 0;

    const content = `
        <form id="${formId}" class="modal-form" novalidate>
            <input type="hidden" name="id" value="${modelo.id || ''}">
            <div class="form-group">
                <label for="${formId}-nome">Nome do Modelo*</label>
                <input type="text" id="${formId}-nome" name="nome" value="${modelo.nome || ''}" ${readOnly ? 'disabled' : ''} required>
            </div>
            <div class="form-group">
                <label for="${formId}-codigo">Código</label>
                <input type="text" id="${formId}-codigo" name="codigo" value="${modelo.codigo || ''}" ${readOnly ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label for="${formId}-foto">URL da Foto</label>
                <input type="url" id="${formId}-foto" name="foto" value="${modelo.foto || ''}" placeholder="https://exemplo.com/imagem.png" ${readOnly ? 'disabled' : ''}>
            </div>

            <div class="insumos-list-container">
                <h4>Insumos Utilizados <span class="text-secondary" style="font-weight:normal;font-size:0.9em;">(Custo total insumos: <span id="${formId}-custoInsumosVal">${formatCurrency(custoTotalInsumos)}</span>)</span></h4>
                <div class="insumos-list">
                    <ul id="${formId}-insumosListUl">${insumosHtmlList}</ul>
                </div>
                ${!readOnly ? `
                <div class="add-insumo-form-group form-group">
                    <label for="${formId}-selectInsumo">Adicionar Insumo</label>
                    <div class="form-group-inline">
                        <select id="${formId}-selectInsumo" style="min-width: 200px;">${insumosDropdownOptions}</select>
                        <input type="number" id="${formId}-insumoQtd" placeholder="Qtd" min="0.01" step="0.01" style="max-width:100px;">
                        <button type="button" class="btn btn-secondary btn-small" id="${formId}-addInsumoBtn">Adicionar</button>
                    </div>
                </div>` : ''}
            </div>

            <div class="form-group">
                <label for="${formId}-custoUnitario">Custo Unitário Total (R$)*</label>
                <input type="number" id="${formId}-custoUnitario" name="custoUnitario" value="${custoUnitarioCalculado.toFixed(2) || '0.00'}" step="0.01" ${readOnly ? 'disabled' : ''} required>
                 <small class="text-secondary">Este custo pode ser preenchido manualmente ou calculado a partir dos insumos.</small>
            </div>
            <div class="form-group">
                <label for="${formId}-margemLucro">Margem de Lucro (Ex: 0.5 para 50%)*</label>
                <input type="number" id="${formId}-margemLucro" name="margemLucro" value="${modelo.margemLucro || '0.00'}" step="0.01" ${readOnly ? 'disabled' : ''} required>
            </div>
            <div class="form-group">
                <label>Valor de Venda Sugerido (R$)</label>
                <p id="${formId}-valorVendaSugerido" class="text-pink" style="font-size: 1.3em; font-weight: bold;">${formatCurrency(valorVendaSugerido)}</p>
            </div>
        </form>
    `;

    const footerButtons = readOnly ?
        [{ text: 'Fechar', type: 'secondary', onClick: closeModal }]
        :
        [
            { text: 'Cancelar', type: 'secondary', onClick: closeModal, keepOpen: false },
            { text: 'Salvar', type: 'primary', id: `${formId}-saveBtn`, onClick: () => saveModelo(formId), keepOpen: true } // KeepOpen para validação
        ];

    if (!isNew && !readOnly) {
        footerButtons.unshift({
            text: 'Excluir', type: 'error', onClick: () => deleteModelo(modelo.id, modelo.nome), keepOpen: false
        });
    }

    showModal({ title, content, footerButtons, size: 'lg' });

    if (!readOnly) {
        attachModalEventListeners(formId);
    }
}

function attachModalEventListeners(formId) {
    const formElement = document.getElementById(formId);
    if (!formElement) return;

    const addInsumoBtn = formElement.querySelector(`#${formId}-addInsumoBtn`);
    if (addInsumoBtn) {
        addInsumoBtn.addEventListener('click', () => handleAddInsumoToForm(formId));
    }

    const insumosListUl = formElement.querySelector(`#${formId}-insumosListUl`);
    if (insumosListUl) { // Delegação para botões de remover
        insumosListUl.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-remove-insumo')) {
                event.target.closest('li').remove();
                updateCustosNoModal(formId);
                if(insumosListUl.children.length === 0) {
                    insumosListUl.innerHTML = '<li>Nenhum insumo adicionado.</li>';
                }
            }
        });
    }
    // Atualizar valor de venda e custo de insumos dinamicamente
    const custoInput = formElement.querySelector(`#${formId}-custoUnitario`);
    const margemInput = formElement.querySelector(`#${formId}-margemLucro`);

    if (custoInput) custoInput.addEventListener('input', () => updateCustosNoModal(formId));
    if (margemInput) margemInput.addEventListener('input', () => updateCustosNoModal(formId));

    // Calcular custo a partir de insumos
    const selectInsumo = formElement.querySelector(`#${formId}-selectInsumo`);
    const qtdInsumoInput = formElement.querySelector(`#${formId}-insumoQtd`);
    if(selectInsumo) selectInsumo.addEventListener('change', () => updateCustosNoModal(formId));
    if(qtdInsumoInput) qtdInsumoInput.addEventListener('input', () => updateCustosNoModal(formId));
}

function handleAddInsumoToForm(formId) {
    const formElement = document.getElementById(formId);
    const selectInsumo = formElement.querySelector(`#${formId}-selectInsumo`);
    const qtdInsumoInput = formElement.querySelector(`#${formId}-insumoQtd`);
    const insumosListUl = formElement.querySelector(`#${formId}-insumosListUl`);

    const selectedOption = selectInsumo.options[selectInsumo.selectedIndex];
    const insumoId = selectedOption.value;
    const insumoNome = selectedOption.text.split(' (')[0]; // Pega só o nome
    const insumoUnidade = selectedOption.dataset.unidade;
    const qtd = parseFloat(qtdInsumoInput.value);

    if (insumoId && insumoNome && qtd > 0) {
        // Remover mensagem de "nenhum insumo" se existir
        const placeholderLi = insumosListUl.querySelector('li:only-child');
        if(placeholderLi && placeholderLi.textContent.includes("Nenhum insumo adicionado")) {
            placeholderLi.remove();
        }

        // Verifica se o insumo já foi adicionado
        const existingLi = insumosListUl.querySelector(`li[data-insumo-id="${insumoId}"]`);
        if (existingLi) {
            showToast(`Insumo "${insumoNome}" já está na lista. Remova-o para adicionar novamente com outra quantidade.`, 'warning');
            return;
        }


        const li = document.createElement('li');
        li.dataset.insumoId = insumoId; // Usar o ID do insumo
        li.dataset.insumoNome = insumoNome; // Guardar nome para caso ID não seja suficiente
        li.innerHTML = `<span class="insumo-details">${insumoNome}: ${qtd} ${insumoUnidade}</span>
                        <button type="button" class="btn-remove-insumo">&times;</button>`;
        insumosListUl.appendChild(li);

        selectInsumo.value = ''; // Reset dropdown
        qtdInsumoInput.value = '';
        updateCustosNoModal(formId);
    } else {
        showToast('Selecione um insumo e informe a quantidade.', 'warning');
    }
}

function updateCustosNoModal(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const custoTotalInsumosEl = form.querySelector(`#${formId}-custoInsumosVal`);
    const custoUnitarioInput = form.querySelector(`#${formId}-custoUnitario`);
    const margemLucroInput = form.querySelector(`#${formId}-margemLucro`);
    const valorVendaEl = form.querySelector(`#${formId}-valorVendaSugerido`);

    // Calcular custo total dos insumos na lista
    let currentCustoInsumos = 0;
    const insumosLi = form.querySelectorAll(`#${formId}-insumosListUl li`);
    insumosLi.forEach(li => {
        const insumoId = li.dataset.insumoId;
        const qtdText = li.querySelector('.insumo-details').textContent.split(': ')[1].split(' ')[0];
        const qtd = parseFloat(qtdText);

        const insumoDef = insumosDisponiveis.find(i => String(i.id) === String(insumoId) || i.nome === li.dataset.insumoNome);
        if (insumoDef && qtd) {
            currentCustoInsumos += (insumoDef.custoPorUnidade || 0) * qtd;
        }
    });

    if (custoTotalInsumosEl) {
        custoTotalInsumosEl.textContent = formatCurrency(currentCustoInsumos);
    }
    // Se o campo custoUnitário estiver vazio ou for para ser automático, atualiza com o custo dos insumos
    // Isso pode ser uma preferência do usuário: usar custo dos insumos ou manual
    if (custoUnitarioInput && (custoUnitarioInput.value === '' || custoUnitarioInput.dataset.autoUpdate === 'true')) {
         custoUnitarioInput.value = currentCustoInsumos.toFixed(2);
    }


    const custoUnitarioFinal = parseFloat(custoUnitarioInput.value) || 0;
    const margemLucro = parseFloat(margemLucroInput.value) || 0;
    const valorVendaCalculado = custoUnitarioFinal * (1 + margemLucro);
    valorVendaEl.textContent = formatCurrency(valorVendaCalculado);
}


function saveModelo(formId) {
    const form = document.getElementById(formId);
    if (!form || !form.checkValidity()) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        form.reportValidity(); // Mostra as mensagens de validação do navegador
        return;
    }

    const saveButton = document.getElementById(`${formId}-saveBtn`);
    if (saveButton) saveButton.disabled = true; // Prevenir múltiplos cliques

    const id = form.elements['id'].value ? parseInt(form.elements['id'].value) : null;
    const nome = form.elements['nome'].value.trim();
    const codigo = form.elements['codigo'].value.trim();
    const foto = form.elements['foto'].value.trim();
    const custoUnitario = parseFloat(form.elements['custoUnitario'].value);
    const margemLucro = parseFloat(form.elements['margemLucro'].value);

    const insumosNoForm = [];
    form.querySelectorAll(`#${formId}-insumosListUl li`).forEach(li => {
        if (li.dataset.insumoId) { // Ignora o placeholder "Nenhum insumo"
            const insumoId = li.dataset.insumoId; // ID do insumo selecionado
            const nomeInsumo = li.dataset.insumoNome;
            const qtdText = li.querySelector('.insumo-details').textContent.split(': ')[1].split(' ')[0];
            const qtd = parseFloat(qtdText);
            if (insumoId && qtd) {
                insumosNoForm.push({ insumoId: parseInt(insumoId), nome: nomeInsumo, qtd });
            }
        }
    });

    const modeloData = {
        nome,
        codigo,
        foto: foto || 'assets/img-modelos/placeholder-modelo.png',
        custoUnitario,
        margemLucro,
        insumos: insumosNoForm,
        // Lucro estimado é derivado, não precisa salvar diretamente se calculado na exibição.
    };

    // Simulação de POST/PUT. Substituir por API real.
    setTimeout(() => { // Simula delay de API
        if (id) { // Editando
            const index = modelosData.findIndex(m => m.id === id);
            if (index > -1) {
                modelosData[index] = { ...modelosData[index], ...modeloData, id: id }; // Mantém o ID original
                showToast(`Modelo "${nome}" atualizado!`, 'success');
            } else {
                showToast(`Erro: Modelo com ID ${id} não encontrado para atualização.`, 'error');
            }
        } else { // Novo
            modeloData.id = getNextId(); // Gera um novo ID para o mock
            modelosData.push(modeloData);
            showToast(`Modelo "${nome}" adicionado!`, 'success');
        }

        closeModal();
        renderModelos();
        // Aqui você salvaria modelosData no localStorage ou enviaria para API
        // console.log("Dados de modelos para 'salvar':", modelosData);
    }, 500);
}

function deleteModelo(modeloId, modeloNome) {
    if (confirm(`Tem certeza que deseja excluir o modelo "${modeloNome}"? Esta ação não pode ser desfeita.`)) {
        // Simulação de DELETE. Substituir por API real.
        setTimeout(() => { // Simula delay de API
            const initialLength = modelosData.length;
            modelosData = modelosData.filter(m => m.id !== modeloId);

            if (modelosData.length < initialLength) {
                showToast(`Modelo "${modeloNome}" excluído.`, 'warning');
                renderModelos();
                // Aqui você salvaria modelosData no localStorage ou enviaria para API
            } else {
                showToast(`Erro ao excluir: Modelo "${modeloNome}" não encontrado.`, 'error');
            }
            closeModal(); // Fecha qualquer modal que possa estar aberto (ex: detalhes)
        }, 300);
    }
}
