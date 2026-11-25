'use strict';

const CACHE_NAME = 'numiquick-v2.15.1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './milktea.js',
  './cloud-config.js',
  './cloud.js',
  './admin.js',
  './ui.js',
  './advanced.js',
  './refresh.js',
  './analytics.js',
  './review-exit.js',
  './adaptive-sprint.js',
  './pedagogy.js',
  './engagement.js',
  './admin-assignments.js',
  './admin-dashboard.js',
  './scratchpad-kbd.js',
  './teacher-classes.js',
  './teacher-auth-gate.js',
  './teacher-workspace.js',
  './teacher-integration.js',
  './cloud-classes.js',
  './curriculum-secondary.js',
  './curriculum-knowledge.js',
  './curriculum-topics.js',
  './column-calc.js',
  './worksheet-pdf.js',
  './nunito-400.woff',
  './nunito-500.woff',
  './nunito-600.woff',
  './nunito-700.woff',
  './nunito-800.woff',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './play-race.svg',
  './play-school.svg',
  './play-world.svg',
  './zoo.svg',
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
    fetch(req, { cache: 'no-cache' }).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => {
      return caches.match(req, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html', { ignoreSearch: true });
        }
      });
    })
  );
});
