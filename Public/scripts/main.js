// /veex-app/scripts/main.js
import { renderMenu } from '../components/MenuLateral.js';
import { initHeader } from '../components/Header.js';
import { initializeRouter, navigateToCurrentHash } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    const mainNavContainerId = 'mainNav';
    const pageContentContainerId = 'pageContent'; // Onde o conteúdo das páginas é injetado
    const sidebarElement = document.getElementById('sidebar');
    const mainContentAreaElement = document.getElementById('mainContentArea');
    const mobileToggleElement = document.getElementById('mobileSidebarToggle');
    const desktopToggleElement = document.getElementById('desktopSidebarToggle');
    const mobileMenuOverlayElement = document.getElementById('mobileMenuOverlay');

    // 1. Inicializar Header (se houver lógica JS nele)
    initHeader();

    // 2. Renderizar o Menu Lateral
    renderMenu(mainNavContainerId);

    // 3. Inicializar o Router (ele cuida da carga inicial da página)
    initializeRouter(pageContentContainerId);

    // 4. Lógica da Sidebar (Toggle)
    function toggleDesktopSidebar() {
        sidebarElement.classList.toggle('collapsed');
        mainContentAreaElement.classList.toggle('sidebar-collapsed');
        const isCollapsed = sidebarElement.classList.contains('collapsed');
        desktopToggleElement.setAttribute('aria-expanded', !isCollapsed);
        // Mudar ícone do botão desktop (exemplo com SVG inline ou classes)
        desktopToggleElement.innerHTML = isCollapsed ?
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>` : // Hamburger (abrir)
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`; // X (fechar)
    }

    function toggleMobileSidebar() {
        sidebarElement.classList.toggle('open'); // Classe 'open' para mobile
        mobileMenuOverlayElement.classList.toggle('active');
        const isOpen = sidebarElement.classList.contains('open');
        mobileToggleElement.setAttribute('aria-expanded', isOpen);
         // Mudar ícone do botão mobile
        mobileToggleElement.innerHTML = isOpen ?
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>` : // X (fechar)
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`; // Hamburger (abrir)
    }

    if (desktopToggleElement) {
        desktopToggleElement.addEventListener('click', toggleDesktopSidebar);
    }
    if (mobileToggleElement) {
        mobileToggleElement.addEventListener('click', toggleMobileSidebar);
    }
    if (mobileMenuOverlayElement) {
        mobileMenuOverlayElement.addEventListener('click', toggleMobileSidebar); // Fecha ao clicar no overlay
    }

    // Estado inicial da sidebar (ex: começar colapsada em desktop > 768px)
    function initializeSidebarState() {
        if (window.innerWidth > 768) {
            if (!sidebarElement.classList.contains('collapsed')) { // Se não estiver colapsada por padrão
                // Deixe como está ou force um estado:
                // toggleDesktopSidebar(); // para começar colapsada
            }
             desktopToggleElement.setAttribute('aria-expanded', !sidebarElement.classList.contains('collapsed'));
        } else {
            sidebarElement.classList.remove('open'); // Garante que mobile comece fechada
            mobileToggleElement.setAttribute('aria-expanded', 'false');
            mobileMenuOverlayElement.classList.remove('active');
        }
    }

    initializeSidebarState(); // Define o estado no carregamento
    window.addEventListener('resize', initializeSidebarState); // E ajusta no resize

    // 5. Lidar com cliques nos links do menu para navegação SPA (delegação de evento)
    const nav = document.getElementById(mainNavContainerId);
    if (nav) {
        nav.addEventListener('click', (event) => {
            const anchor = event.target.closest('a[data-route]');
            if (anchor) {
                event.preventDefault();
                // O router já lida com a navegação no evento hashchange
                // Apenas garantimos que o hash seja atualizado.
                // A função navigateTo do router pode ser chamada se for preciso mais controle.
                window.location.hash = anchor.getAttribute('href');

                if (window.innerWidth <= 768 && sidebarElement.classList.contains('open')) {
                    toggleMobileSidebar(); // Fecha sidebar mobile após navegação
                }
            }
        });
    }
    // Lidar com clique no logo para ir para o dashboard
    const logoLink = document.querySelector('.sidebar-header .logo-link');
    if(logoLink){
        logoLink.addEventListener('click', (event) => {
            const route = logoLink.dataset.route;
            if(route){
                event.preventDefault();
                window.location.hash = `#${route}`;
                 if (window.innerWidth <= 768 && sidebarElement.classList.contains('open')) {
                    toggleMobileSidebar();
                }
            }
        });
    }
});
