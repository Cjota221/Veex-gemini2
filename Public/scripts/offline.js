// /veex-app/scripts/offline.js

// Este arquivo pode ser usado para funcionalidades offline mais avançadas,
// como interagir com IndexedDB, sincronização em segundo plano, etc.

// A lógica básica do Service Worker para cache de assets já está em service-worker.js

export function checkOnlineStatus() {
    window.addEventListener('online', () => updateOnlineStatus(true));
    window.addEventListener('offline', () => updateOnlineStatus(false));
    updateOnlineStatus(navigator.onLine);
}

function updateOnlineStatus(isOnline) {
    console.log('Status da conexão:', isOnline ? 'Online' : 'Offline');
    if (isOnline) {
        // Tentar sincronizar dados pendentes, se houver
        // showToast("Você está online novamente!", "success");
    } else {
        // showToast("Você está offline. Algumas funcionalidades podem ser limitadas.", "warning", 5000);
    }
    // Pode-se adicionar um indicador visual na UI
    // const onlineIndicator = document.getElementById('onlineIndicator');
    // if (onlineIndicator) onlineIndicator.style.display = isOnline ? 'none' : 'block';
}

// Exemplo de como você poderia interagir com IndexedDB (requer uma lib ou código customizado)
// import { openDB, deleteDB, wrap, unwrap } from 'idb'; // Exemplo usando a lib 'idb'

// async function saveToOfflineStorage(storeName, data) {
//   if (!('indexedDB' in window)) {
//     console.warn('IndexedDB não suportado.');
//     return;
//   }
//   const db = await openDB('veex-offline-db', 1, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains(storeName)) {
//         db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
//       }
//     },
//   });
//   await db.add(storeName, data);
//   console.log('Dados salvos offline:', data);
// }

// initOfflineFeatures(); // Chamar em main.js se necessário
function initOfflineFeatures(){
    checkOnlineStatus();
}

// Inicializa as funcionalidades offline ao carregar este módulo
// (Pode ser chamado explicitamente do main.js se preferir mais controle)
initOfflineFeatures();
