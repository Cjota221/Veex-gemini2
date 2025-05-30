// /veex-app/scripts/ui.js

/**
 * Mostra uma mensagem de carregamento dentro de um container.
 * @param {HTMLElement} container - O elemento onde a mensagem de loading será exibida.
 */
export function showLoading(container) {
    if (container instanceof HTMLElement) {
        container.innerHTML = '<p class="loading-placeholder" style="padding:40px; text-align:center;">Carregando dados...</p>';
    } else {
        console.warn('showLoading: container inválido', container);
    }
}

/**
 * Esconde a mensagem de carregamento. Geralmente não é necessário se o conteúdo
 * substitui o loading, mas pode ser útil.
 * @param {HTMLElement} container - O elemento de onde a mensagem de loading será removida.
 */
export function hideLoading(container) {
    if (container instanceof HTMLElement) {
        const loadingMessage = container.querySelector('.loading-placeholder');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
}

/**
 * Exibe uma mensagem (info, success, error, warning) dentro de um container na página.
 * A mensagem é adicionada no início do container.
 * @param {HTMLElement} targetContainer - O container onde a mensagem será exibida.
 * @param {string} messageText - O texto da mensagem.
 * @param {'info'|'success'|'error'|'warning'} type - O tipo da mensagem.
 * @param {number} duration - Duração em ms para a mensagem desaparecer (0 para não desaparecer).
 */
export function displayMessageInPage(targetContainer, messageText, type = 'info', duration = 5000) {
    if (!(targetContainer instanceof HTMLElement)) {
        console.error('displayMessageInPage: targetContainer inválido.', targetContainer);
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = messageText;
    messageDiv.style.marginBottom = '20px'; // Adiciona margem para separar do conteúdo abaixo

    // Remove mensagens antigas do mesmo tipo para não acumular
    const oldMessage = targetContainer.querySelector(`.message.message-${type}`);
    if (oldMessage) {
        oldMessage.remove();
    }

    targetContainer.prepend(messageDiv);

    if (duration > 0) {
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => messageDiv.remove(), 500);
        }, duration);
    }
    return messageDiv; // Retorna o elemento da mensagem para controle externo se necessário
}


/**
 * Exibe uma mensagem (toast) no canto da tela.
 * @param {string} messageText - O texto da mensagem.
 * @param {'info'|'success'|'error'|'warning'} type - O tipo da mensagem.
 * @param {number} duration - Duração em ms para a mensagem desaparecer.
 */
export function showToast(messageText, type = 'info', duration = 3000) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        // Estilos para toast-container (adicionar ao main.css ou aqui via JS):
        /*
        #toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .toast {
            padding: 15px 20px;
            border-radius: var(--border-radius);
            color: white;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .toast.show { opacity: 1; transform: translateX(0); }
        .toast.info { background-color: var(--light-blue-accent); color: var(--primary-dark-blue); }
        .toast.success { background-color: var(--success-color); }
        .toast.error { background-color: var(--error-color); }
        .toast.warning { background-color: var(--warning-color); }
        */
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = messageText;

    toastContainer.appendChild(toast);

    // Força reflow para aplicar a transição de entrada
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove(); // Remove o container se estiver vazio
            }
        }, { once: true });
    }, duration);
}

// Adicionar os estilos do toast no seu main.css:
/*
#toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 300px; /* Para não ficar muito largo */
}
.toast {
    padding: 12px 18px;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
    box-shadow: 0 3px 15px rgba(0,0,0,0.2);
    opacity: 0;
    transform: translateX(110%);
    transition: opacity 0.35s ease-in-out, transform 0.35s ease-in-out;
    background-color: var(--card-background); /* Fundo padrão */
    border-left: 4px solid var(--text-secondary); /* Borda padrão */
}
.toast.show {
    opacity: 1;
    transform: translateX(0);
}
.toast.info { border-left-color: var(--light-blue-accent); color: var(--light-blue-accent); }
.toast.success { border-left-color: var(--success-color); color: var(--success-color); }
.toast.error { border-left-color: var(--error-color); color: var(--error-color); }
.toast.warning { border-left-color: var(--warning-color); color: var(--warning-color); }
*/
