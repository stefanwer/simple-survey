const CACHE_NAME = 'poll-app-v1';
const ASSETS = [
    'index.html',
    'question.html',
    'result.html',
    'style.css',
    'script.js',
    'questions.json',
    'jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});