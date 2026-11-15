'use strict';

const CACHE_NAME = 'numiquick-v1.0.3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './discovery.js',
  './challenge.js',
  './farm.js',
  './milktea.js',
  './cloud-config.js',
  './cloud.js',
  './admin.js',
  './ui.js',
  './advanced.js',
  './refresh.js',
  './analytics.js',
  './review-exit.js',
  './nunito-400.woff',
  './nunito-500.woff',
  './nunito-600.woff',
  './nunito-700.woff',
  './nunito-800.woff',
  './og-image.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Ignore external Supabase calls or API requests for network-first
  if (req.url.includes('supabase.co') || req.url.includes('api.github.com')) {
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => {
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html', { ignoreSearch: true });
        }
      });
    })
  );
});
