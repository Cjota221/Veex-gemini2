// /veex-app/components/Modal.js

let currentModal = null;
let currentOnCloseCallback = null; // Para a tecla ESC

/**
 * Cria e exibe um modal.
 * @param {object} config - Configuração do modal.
 * @param {string} config.title - Título do modal.
 * @param {string | HTMLElement} config.content - Conteúdo HTML ou elemento DOM para o corpo do modal.
 * @param {Array<object>} [config.footerButtons] - Array de botões para o rodapé [{text, type, onClick, id, disabled, keepOpen}].
 * @param {string} [config.size] - 'sm', 'lg', 'xl' (precisa de CSS .modal-sm, .modal-lg, .modal-xl).
 * @param {function} [config.onClose] - Função chamada quando o modal é fechado intencionalmente.
 * @param {boolean} [config.closeOnOverlayClick=true] - Se o modal deve fechar ao clicar no overlay.
 */
export function showModal({ title, content, footerButtons = [], size = '', onClose, closeOnOverlayClick = true }) {
    if (currentModal) {
        closeModal(currentOnCloseCallback, true); // Fecha o modal anterior, se houver, sem chamar o onClose se for forçado.
    }

    currentOnCloseCallback = onClose; // Armazena o callback para o ESC

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'activeModalOverlay'; // Para referência se necessário

    const modalEl = document.createElement('div');
    modalEl.className = 'modal-content';
    if (size) modalEl.classList.add(`modal-${size}`);

    // Header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = title;
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-btn';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Fechar modal');
    closeButton.onclick = () => closeModal(currentOnCloseCallback);

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    // Body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    if (typeof content === 'string') {
        modalBody.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        modalBody.appendChild(content);
    }

    modalEl.appendChild(modalHeader);
    modalEl.appendChild(modalBody);

    // Footer
    if (footerButtons.length > 0) {
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        footerButtons.forEach(btnConfig => {
            const button = document.createElement('button');
            button.textContent = btnConfig.text;
            button.className = `btn btn-${btnConfig.type || 'secondary'}`;
            if (btnConfig.id) button.id = btnConfig.id;
            if (btnConfig.disabled) button.disabled = true;

            button.onclick = () => {
                if (btnConfig.onClick) btnConfig.onClick();
                if (!btnConfig.keepOpen) { // Por padrão, botões fecham o modal
                    closeModal(currentOnCloseCallback);
                }
            };
            modalFooter.appendChild(button);
        });
        modalEl.appendChild(modalFooter);
    }

    overlay.appendChild(modalEl);
    document.getElementById('modalContainer').appendChild(overlay);
    currentModal = overlay;

    // Adiciona a classe 'active' após um pequeno delay para permitir a transição de opacidade
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { // Double requestAnimationFrame for some browsers
            overlay.classList.add('active');
        });
    });


    document.addEventListener('keydown', escapeKeyListener);

    if (closeOnOverlayClick) {
        overlay.addEventListener('click', function(event) {
            if (event.target === overlay) {
                closeModal(currentOnCloseCallback);
            }
        });
    }
}

export function closeModal(onCloseFn = currentOnCloseCallback, calledInternally = false) {
    if (currentModal) {
        currentModal.classList.remove('active');
        // Espera a transição de opacidade terminar antes de remover
        const transitionDuration = parseFloat(getComputedStyle(currentModal).transitionDuration) * 1000;
        setTimeout(() => {
            if (currentModal) currentModal.remove();
            currentModal = null;
            if (!calledInternally && typeof onCloseFn === 'function') {
                onCloseFn();
            }
            currentOnCloseCallback = null; // Limpa o callback
        }, transitionDuration || 300); // Fallback para 300ms
    }
    document.removeEventListener('keydown', escapeKeyListener);
}

function escapeKeyListener(event) {
    if (event.key === 'Escape' && currentModal) {
        closeModal(currentOnCloseCallback);
    }
}

/**
 * Retorna o elemento do corpo do modal atual, útil para adicionar spinners ou mensagens.
 * @returns {HTMLElement|null}
 */
export function getCurrentModalBody() {
    if (currentModal) {
        return currentModal.querySelector('.modal-body');
    }
    return null;
}
