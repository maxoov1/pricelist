const SERVICE_WORKER_VERSION = 'v1';

const addResourceToCache = async (resources) => {
  const cache = await caches.open(SERVICE_WORKER_VERSION);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(SERVICE_WORKER_VERSION);
  await cache.put(request, response);
};

const cacheFirstStrategy = async (request) => {
  const responseFromCache = await caches.match(request.clone());
  if (responseFromCache)
    return responseFromCache;

  try {
    const responseFromNetwork = await fetch(request.clone());
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    addResourceToCache(['index.html', 'style.css', 'main.js']),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    cacheFirstStrategy(event.request),
  );
});
