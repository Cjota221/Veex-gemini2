// /veex-app/scripts/configuracoes.js
import { showToast } from './ui.js';

// Chave para localStorage
const CONFIG_STORAGE_KEY = 'veexAppConfig';

// Configurações padrão
const defaultConfig = {
    nomeEmpresa: 'Minha Empresa VEEX',
    logoEmpresa: '',
    moeda: 'BRL',
    tema: 'escuro',
    itensPorPagina: 12,
    notifEstoque: true,
    notifProducao: false
};

export function init() {
    console.log('Página Configurações Inicializada');
    loadConfiguracoes();
    setupConfigEventListeners();
}

export function cleanup() {
    console.log('Página Configurações Desmontada');
}

function loadConfiguracoes() {
    const form = document.getElementById('configForm');
    if (!form) return;

    let currentConfig = defaultConfig;
    try {
        const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (storedConfig) {
            currentConfig = { ...defaultConfig, ...JSON.parse(storedConfig) };
        }
    } catch (e) {
        console.error("Erro ao carregar configurações do localStorage:", e);
        // Usa defaultConfig se houver erro
    }


    form.elements['nomeEmpresa'].value = currentConfig.nomeEmpresa;
    form.elements['logoEmpresa'].value = currentConfig.logoEmpresa;
    form.elements['moeda'].value = currentConfig.moeda;
    form.elements['tema'].value = currentConfig.tema;
    form.elements['itensPorPagina'].value = currentConfig.itensPorPagina;
    form.elements['notifEstoque'].checked = currentConfig.notifEstoque;
    form.elements['notifProducao'].checked = currentConfig.notifProducao;

    // Aplicar tema se houver lógica para isso
    applyTheme(currentConfig.tema);
}

function setupConfigEventListeners() {
    const form = document.getElementById('configForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            saveConfiguracoes();
        });
    }
    const temaSelect = document.getElementById('configTema');
    if (temaSelect) {
        temaSelect.addEventListener('change', (event) => {
            applyTheme(event.target.value);
            // Salvar automaticamente a mudança de tema ou esperar o "Salvar Configurações"
        });
    }
}

function saveConfiguracoes() {
    const form = document.getElementById('configForm');
    if (!form) {
        showToast('Erro: Formulário de configurações não encontrado.', 'error');
        return;
    }

    const newConfig = {
        nomeEmpresa: form.elements['nomeEmpresa'].value.trim(),
        logoEmpresa: form.elements['logoEmpresa'].value.trim(),
        moeda: form.elements['moeda'].value,
        tema: form.elements['tema'].value,
        itensPorPagina: parseInt(form.elements['itensPorPagina'].value) || 12,
        notifEstoque: form.elements['notifEstoque'].checked,
        notifProducao: form.elements['notifProducao'].checked
    };

    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
        showToast('Configurações salvas com sucesso!', 'success');
        // console.log("Configurações salvas:", newConfig);

        // Recarregar ou aplicar certas configurações dinamicamente, se necessário
        // Ex: Se o nome da empresa é usado no header, atualizar.
        // Se itensPorPagina mudou, as listagens podem precisar ser re-renderizadas na próxima visita.
    } catch (e) {
        console.error("Erro ao salvar configurações no localStorage:", e);
        showToast('Erro ao salvar configurações. O armazenamento local pode estar cheio ou indisponível.', 'error', 7000);
    }
}

function applyTheme(themeName) {
    // Exemplo básico: Adicionar/remover classe no body
    // Você precisaria ter CSS para o tema claro.
    if (themeName === 'claro') {
        document.body.classList.add('theme-claro');
        document.body.classList.remove('theme-escuro'); // Se houver uma classe específica para escuro
        console.log("Tema Claro aplicado (simulação).");
    } else { // escuro (padrão)
        document.body.classList.remove('theme-claro');
        document.body.classList.add('theme-escuro'); // Ou simplesmente remover a .theme-claro se o escuro é o base
        console.log("Tema Escuro aplicado.");
    }
    // Esta é uma simulação. CSS para tema claro não foi fornecido.
}

/**
 * Função para obter uma configuração específica.
 * @param {string} key - A chave da configuração.
 * @returns {*} - O valor da configuração ou undefined.
 */
export function getConfig(key) {
    try {
        const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (storedConfig) {
            const config = JSON.parse(storedConfig);
            return config[key] !== undefined ? config[key] : defaultConfig[key];
        }
    } catch (e) {
        console.error("Erro ao obter configuração:", e);
    }
    return defaultConfig[key]; // Retorna padrão se não encontrado ou erro
}
