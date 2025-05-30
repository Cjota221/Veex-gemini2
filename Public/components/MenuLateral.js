// /veex-app/components/MenuLateral.js

const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: 'dashboard.svg', path: '/' },
    { id: 'modelos', text: 'Modelos', icon: 'modelos.svg', path: '/modelos' },
    { id: 'insumos', text: 'Insumos', icon: 'insumos.svg', path: '/insumos' },
    { id: 'producao', text: 'Produção', icon: 'producao.svg', path: '/producao' },
    { id: 'custos', text: 'Custos', icon: 'custos.svg', path: '/custos' },
    { id: 'calculadora', text: 'Calculadora', icon: 'calculadora.svg', path: '/calculadora' },
    { id: 'relatorios', text: 'Relatórios', icon: 'relatorios.svg', path: '/relatorios' },
    { id: 'financeiro', text: 'Financeiro', icon: 'financeiro.svg', path: '/financeiro' },
    { id: 'configuracoes', text: 'Configurações', icon: 'configuracoes.svg', path: '/configuracoes' }
];

function getIconPath(iconName) {
    return `assets/icons/${iconName}`; // Assume SVGs em assets/icons
}

export function renderMenu(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Menu container #${containerId} not found.`);
        return;
    }

    const ul = document.createElement('ul');
    menuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${item.path}`;
        a.dataset.route = item.path;
        a.id = `nav-${item.id}`;
        a.title = item.text; // Tooltip

        const iconEl = document.createElement('img');
        iconEl.src = getIconPath(item.icon);
        iconEl.alt = ""; // Alt text é redundante pois o link tem texto ou title
        iconEl.classList.add('nav-icon');

        const span = document.createElement('span');
        span.classList.add('nav-text');
        span.textContent = item.text;

        a.appendChild(iconEl);
        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
    });
    container.innerHTML = '';
    container.appendChild(ul);
}

export function setActiveMenuItem(path) {
    const currentActive = document.querySelector('.main-nav a.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    // Considerar paths como '/' e '/modelos' vs '#/' e '#/modelos'
    const newActive = document.querySelector(`.main-nav a[data-route="${path}"]`);
    if (newActive) {
        newActive.classList.add('active');
    } else {
        // Tenta encontrar o item de menu para '/' se path for vazio (hash inicial)
        const homeItem = document.querySelector(`.main-nav a[data-route="/"]`);
        if (homeItem && (path === '' || path === '#')) {
            homeItem.classList.add('active');
        }
    }
}

export function getMenuItems() {
    return menuItems;
}

export function getRouteByPath(path) {
    return menuItems.find(item => item.path === path);
}
