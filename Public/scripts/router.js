// /veex-app/scripts/router.js
import { setActiveMenuItem, getRouteByPath } from '../components/MenuLateral.js';
import { updateAppTitle } from '../components/Header.js';
import { showLoading, hideLoading, displayMessageInPage } from './ui.js';

// Mapeamento de rotas para arquivos HTML parciais e scripts de módulo
// Os arquivos HTML devem estar na pasta /pages/
// Os arquivos JS dos módulos devem estar em /scripts/ e exportar uma função init()
const routes = {
    '/': { page: 'dashboard.html', script: 'dashboard.js', title: 'Dashboard' },
    '/modelos': { page: 'modelos.html', script: 'modelos.js', title: 'Modelos' },
    '/insumos': { page: 'insumos.html', script: 'insumos.js', title: 'Insumos' },
    '/producao': { page: 'producao.html', script: 'producao.js', title: 'Produção' },
    '/custos': { page: 'custos.html', script: 'custos.js', title: 'Custos' },
    '/calculadora': { page: 'calculadora.html', script: 'calculadora.js', title: 'Calculadora de Preço' },
    '/relatorios': { page: 'relatorios.html', script: 'relatorios.js', title: 'Relatórios' },
    '/financeiro': { page: 'financeiro.html', script: 'financeiro.js', title: 'Financeiro' },
    '/configuracoes': { page: 'configuracoes.html', script: 'configuracoes.js', title: 'Configurações' }
    // Adicione aqui outras rotas conforme necessário
};

let pageContentContainer; // Elemento DOM

export function initializeRouter(pageContentContainerId) {
    pageContentContainer = document.getElementById(pageContentContainerId);
    if (!pageContentContainer) {
        console.error(`Router: Page content container #${pageContentContainerId} not found.`);
        return;
    }

    window.addEventListener('hashchange', navigateToCurrentHash);
    navigateToCurrentHash(); // Carga inicial da rota baseada no hash atual
}

export async function navigateToCurrentHash() {
    const path = window.location.hash.substring(1) || '/'; // Remove o '#' e default para '/'
    await loadContentForPath(path);
}

export async function navigateTo(path) { // Função para navegação programática
    if (window.location.hash.substring(1) !== path) {
        window.location.hash = path;
    } else {
        // Se já está no path, força o recarregamento do conteúdo
        // (útil para "refresh" da página atual ou navegação para o mesmo path com params diferentes no futuro)
        await loadContentForPath(path);
    }
}


async function loadContentForPath(path) {
    const routeConfig = routes[path] || routes['/']; // Default para dashboard se rota não encontrada

    if (!pageContentContainer) {
        console.error("Router: pageContentContainer não está definido.");
        return;
    }

    showLoading(pageContentContainer); // Mostra mensagem de "carregando"

    try {
        // Carregar o HTML da página
        const pageHtmlPath = `pages/${routeConfig.page}`;
        const response = await fetch(pageHtmlPath);

        if (!response.ok) {
            throw new Error(`Página não encontrada: ${pageHtmlPath} (Status: ${response.status})`);
        }
        const htmlContent = await response.text();
        pageContentContainer.innerHTML = htmlContent;

        updateAppTitle(routeConfig.title); // Atualiza o título no header e na aba
        setActiveMenuItem(path); // Define o item ativo no menu lateral

        // Carregar e executar o script específico do módulo (se houver)
        // Os scripts dos módulos devem estar na pasta /scripts/ e ter o mesmo nome que routeConfig.script
        if (routeConfig.script) {
            const modulePath = `./${routeConfig.script}`; // Relativo ao index.html (onde main.js é carregado)
            try {
                // Descarregar o módulo anterior (se houver função de cleanup)
                // Esta é uma abordagem simples. Módulos mais complexos podem precisar de um
                // gerenciamento de estado mais robusto ou de um "teardown" explícito.
                if (window.currentModule && typeof window.currentModule.cleanup === 'function') {
                    window.currentModule.cleanup();
                }

                const pageModule = await import(modulePath);
                window.currentModule = pageModule; // Armazena referência ao módulo atual

                if (pageModule && typeof pageModule.init === 'function') {
                    pageModule.init(); // Chama a função de inicialização do módulo
                }
            } catch (e) {
                console.error(`Router: Erro ao carregar ou inicializar o script do módulo ${modulePath}:`, e);
                displayMessageInPage(pageContentContainer, `Erro ao carregar funcionalidade da página (${routeConfig.title}).`, 'error');
            }
        }
    } catch (error) {
        console.error(`Router: Erro ao carregar a página para o path "${path}":`, error);
        pageContentContainer.innerHTML = `
            <div class="message message-error" style="margin:20px;">
                <h3>Oops! Algo deu errado.</h3>
                <p>Não foi possível carregar o conteúdo da página "${routeConfig.title}".</p>
                <p>Detalhe do erro: ${error.message}</p>
                <p>Por favor, verifique se o arquivo <code>/pages/${routeConfig.page}</code> existe e tente novamente.</p>
                <button class="btn btn-primary" onclick="window.location.hash='/'">Voltar ao Dashboard</button>
            </div>`;
        updateAppTitle('Erro');
        setActiveMenuItem('/'); // Tenta marcar o dashboard como ativo
    } finally {
        // hideLoading já é tratado pela substituição do innerHTML,
        // mas poderia ser chamado aqui se o loading fosse um overlay.
    }
}
