// /veex-app/components/Card.js

/**
 * Cria e retorna um elemento de card.
 * @param {object} config - Configuração do card.
 * @param {string} [config.iconSvgName] - Nome do arquivo SVG em assets/icons (para cards de resumo, etc.).
 * @param {string} config.title - Título do card.
 * @param {string} [config.titleColor] - Cor customizada para o título (usar com cautela).
 * @param {string} config.info - Informação resumida do card (aceita HTML básico).
 * @param {Array<object>} [config.buttons] - Array de botões [{text, type, onClick, small, iconSvg, id, disabled}].
 * @param {string} [config.customClasses] - Classes CSS adicionais para o card.
 * @param {object} [config.dataAttributes] - Atributos data-* para adicionar ao card. ex: {'data-id': '123'}
 * @param {string} [config.imageUrl] - URL para uma imagem a ser exibida no topo do card (ex: foto do modelo).
 */
export function createCard({
    iconSvgName,
    title,
    titleColor,
    info,
    buttons = [],
    customClasses = '',
    dataAttributes = {},
    imageUrl
}) {
    const card = document.createElement('div');
    card.className = `card ${customClasses}`;

    for (const attr in dataAttributes) {
        card.setAttribute(attr, dataAttributes[attr]);
    }

    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = title;
        img.className = 'card-image';
        img.loading = 'lazy'; // Lazy load images
        card.appendChild(img);
    }

    if (iconSvgName && !imageUrl) { // Ícone de topo (geralmente para cards sem imagem principal)
        const iconContainer = document.createElement('div');
        iconContainer.className = 'card-icon-container';
        const icon = document.createElement('img');
        icon.src = `assets/icons/${iconSvgName}`;
        icon.alt = "";
        icon.className = 'card-icon-svg';
        iconContainer.appendChild(icon);
        card.appendChild(iconContainer);
    }

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content-inner'; // Para padding interno se a imagem ocupa tudo

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = title;
    if (titleColor) {
        cardTitle.style.color = titleColor;
    }
    cardContent.appendChild(cardTitle);

    const cardInfo = document.createElement('div'); // Usar div para permitir mais estrutura se necessário
    cardInfo.className = 'card-info';
    cardInfo.innerHTML = info;
    cardContent.appendChild(cardInfo);

    card.appendChild(cardContent); // Adiciona o conteúdo após a imagem/ícone de topo

    if (buttons.length > 0) {
        const cardActions = document.createElement('div');
        cardActions.className = 'card-actions';
        buttons.forEach(btnConfig => {
            const button = document.createElement('button');
            button.textContent = btnConfig.text;
            button.className = `btn btn-${btnConfig.type || 'secondary'}`;
            if (btnConfig.id) button.id = btnConfig.id;
            if (btnConfig.small) button.classList.add('btn-small');
            if (btnConfig.disabled) button.disabled = true;

            if (btnConfig.iconSvg) {
                const btnIcon = document.createElement('img');
                btnIcon.src = `assets/icons/${btnConfig.iconSvg}`;
                btnIcon.alt = "";
                btnIcon.className = 'btn-icon-svg';
                button.prepend(btnIcon);
            }
            button.onclick = btnConfig.onClick;
            cardActions.appendChild(button);
        });
        card.appendChild(cardActions);
    }

    return card;
}
