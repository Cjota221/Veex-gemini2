// /veex-app/service-worker.js
const CACHE_NAME = 'veex-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style/main.css',
  '/style/responsivo.css',
  '/scripts/main.js',
  '/scripts/router.js',
  '/scripts/ui.js',
  '/components/MenuLateral.js',
  '/components/Card.js',
  '/components/Modal.js',
  // Adicione aqui os principais arquivos CSS e JS de módulos que você quer offline de imediato
  '/style/dashboard.css',
  '/scripts/dashboard.js',
  '/style/modelos.css',
  '/scripts/modelos.js',
  '/pages/dashboard.html',
  '/pages/modelos.html',
  // Ícones e imagens principais
  'assets/icons/veex-logo.svg',
  'assets/icons/plus.svg',
  'assets/img-modelos/placeholder-modelo.png',
  // Fontes, se houver alguma local
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Força o novo service worker a ativar imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto:', CACHE_NAME);
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' }))); // 'reload' para garantir que pegue da rede na instalação
      })
      .catch(error => {
        console.error('Falha ao abrir ou popular o cache durante a instalação:', error);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Permite que o SW ativado controle clientes imediatamente
  );
});

self.addEventListener('fetch', event => {
  // Apenas para requisições GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Tenta responder da rede primeiro (estratégia Network First para HTML, por exemplo)
  // Para arquivos de app shell (CSS, JS), Cache First pode ser melhor após o primeiro load.
  // Esta é uma estratégia Cache-First simples:
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('Servindo do cache:', event.request.url);
          return response; // Servindo do cache
        }
        // console.log('Buscando da rede:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Se a requisição for bem-sucedida, clona e armazena no cache
            if (networkResponse && networkResponse.status === 200) {
              // Não armazena respostas de extensões do chrome
              if (!event.request.url.startsWith('chrome-extension://')) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
            }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetch falhou; erro:', error);
          // Poderia retornar uma página offline customizada aqui
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html'); // Se você tiver uma página offline.html
          // }
        });
      })
  );
});
