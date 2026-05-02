/**
 * LearningOS Service Worker
 * 
 * 提供离线访问能力：
 * - 缓存核心资源（HTML、CSS、JS）
 * - 缓存策略：Cache First for assets, Network First for API
 * - 后台同步支持
 */

const CACHE_NAME = 'learningos-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 安装事件：预缓存核心资源
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求：实现缓存策略
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // 静态资源：Cache First
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML 页面：Stale While Revalidate
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API 请求：Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 默认：Network First
  event.respondWith(networkFirst(request));
});

/**
 * Cache First 策略
 * 适用于：静态资源（CSS、JS、图片等）
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);
  
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  
  return response;
}

/**
 * Network First 策略
 * 适用于：API 请求、动态内容
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    console.log('[SW] Trying network:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // 返回离线页面
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Stale While Revalidate 策略
 * 适用于：HTML 页面
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// 后台同步（可选）
self.addEventListener('sync', (event: ExtendableEvent) => {
  if (event.tag === 'sync-notes') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncNotes());
  }
});

async function syncNotes() {
  // TODO: 实现后台同步逻辑
  console.log('[SW] Syncing notes to server...');
}

export {};
