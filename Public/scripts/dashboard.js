// /veex-app/scripts/dashboard.js
import { createCard } from '../components/Card.js';
import { showModal } from '../components/Modal.js';
import { navigateTo } from './router.js';
import { formatCurrency } from '../utils/helpers.js';
// import { fetchData } from '../utils/api.js'; // Exemplo para buscar dados reais

export function init() {
    console.log('Dashboard Module Initialized');
    renderSummaryCards();
    setupQuickActions();
    loadRecentActivity();
}

// Opcional: Função de cleanup se o módulo precisar limpar listeners ou timers
export function cleanup() {
    console.log('Dashboard Module Cleaned Up');
    // Remover event listeners específicos do dashboard se houver
}

async function renderSummaryCards() {
    const container = document.getElementById('dashboardSummaryCards');
    if (!container) {
        console.warn('Dashboard: Container de cards de resumo não encontrado.');
        return;
    }
    container.innerHTML = '<p class="loading-placeholder">Carregando resumos...</p>'; // Placeholder

    // Simulação de fetch de dados. Substituir por chamadas reais.
    try {
        // const summaryData = await fetchData('/api/dashboard/summary'); // Exemplo
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da API

        const mockSummaryData = [
            { title: 'Modelos Ativos', value: '23', icon: 'modelos.svg', color: 'var(--light-blue-accent)', actionPath: '/modelos' },
            { title: 'Produções em Andamento', value: '7', icon: 'producao.svg', color: 'var(--accent-pink)', actionPath: '/producao' },
            { title: 'Custo Médio por Unidade', value: formatCurrency(27.50), icon: 'custos.svg', color: '#FFD700', actionPath: '/custos' },
            { title: 'Faturamento Mensal', value: formatCurrency(12340.90), icon: 'financeiro.svg', color: 'var(--success-color)', actionPath: '/financeiro' },
        ];

        container.innerHTML = ''; // Limpa o placeholder de loading

        if (mockSummaryData.length === 0) {
            container.innerHTML = '<p>Nenhum dado de resumo disponível.</p>';
            return;
        }

        mockSummaryData.forEach(data => {
            const card = createCard({
                iconSvgName: data.icon,
                title: data.title,
                info: `<strong style="font-size: 1.8em; color: ${data.color}; display: block; margin-bottom: 5px;">${data.value}</strong>`,
                buttons: [{
                    text: 'Ver Detalhes',
                    type: 'secondary',
                    small: true,
                    onClick: () => data.actionPath ? navigateTo(data.actionPath) : alert(`Detalhes de ${data.title}`)
                }]
            });
            // Para colorir o ícone do card de resumo:
            const iconInCard = card.querySelector('.card-icon-svg');
            if (iconInCard) {
                iconInCard.style.filter = `drop-shadow(0 0 5px ${data.color})`; // Ou outra forma de colorir
            }

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        container.innerHTML = '<p class="text-error">Não foi possível carregar os resumos.</p>';
    }
}

function setupQuickActions() {
    const quickActionsContainer = document.querySelector('.action-buttons');
    if (!quickActionsContainer) return;

    quickActionsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        switch (action) {
            case 'novo-modelo':
                navigateTo('/modelos?action=novo'); // Router pode precisar lidar com query params
                // Ou abrir um modal diretamente:
                // showModal({ title: 'Novo Modelo', content: 'Formulário de novo modelo aqui...' });
                break;
            case 'nova-producao':
                navigateTo('/producao?action=novo');
                break;
            case 'novo-lancamento':
                navigateTo('/financeiro?action=novo');
                break;
            default:
                console.warn(`Ação rápida desconhecida: ${action}`);
        }
    });
}

async function loadRecentActivity() {
    const listContainer = document.getElementById('recentActivityList');
    if (!listContainer) return;
    listContainer.innerHTML = '<li>Carregando atividades...</li>';

    // Simulação de fetch
    try {
        // const activities = await fetchData('/api/dashboard/recent-activity');
        await new Promise(resolve => setTimeout(resolve, 700));
        const mockActivities = [
            { text: 'Nova produção do "Modelo X" (50 un.) iniciada.', time: 'Há 20 minutos', type: 'producao' },
            { text: 'Insumo "Tecido Azul Escuro" abaixo do estoque mínimo.', time: 'Há 1 hora', type: 'alerta' },
            { text: 'Modelo "Sapato Confort Premium" cadastrado.', time: 'Há 3 horas', type: 'cadastro' },
            { text: 'Faturamento de R$ 1.250,00 registrado.', time: 'Ontem', type: 'financeiro' },
        ];

        listContainer.innerHTML = ''; // Limpa o loading

        if (mockActivities.length === 0) {
            listContainer.innerHTML = '<li>Nenhuma atividade recente.</li>';
            return;
        }

        mockActivities.forEach(activity => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="activity-text">${activity.text}</span>
                <small class="activity-time text-secondary">${activity.time}</small>
            `;
            // Adicionar um ícone baseado no tipo de atividade (opcional)
            // li.classList.add(`activity-${activity.type}`);
            listContainer.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao carregar atividades recentes:", error);
        listContainer.innerHTML = '<li><span class="text-error">Não foi possível carregar atividades.</span></li>';
    }
}
