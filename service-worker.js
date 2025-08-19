// 定义缓存名称和版本
const CACHE_NAME = 'fitness-app-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'down_fail.mp3',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
  'https://clockcn.com/favicon.ico'
];

// 安装Service Worker时缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 激活Service Worker时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截网络请求并从缓存提供资源
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中则返回缓存资源
        if (response) {
          return response;
        }

        // 缓存未命中则发起网络请求
        return fetch(event.request).then(
          (response) => {
            // 如果响应有效，将其克隆并添加到缓存
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch((error) => {
          // 网络请求失败的处理
          console.error('Fetching failed:', error);
          // 可以返回一个离线备用页面
        });
      })
  );
});
