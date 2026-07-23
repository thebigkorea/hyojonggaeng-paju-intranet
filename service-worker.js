const CACHE_NAME = "hyojonggaeng-paju-intranet-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./store-manager.html",
  "./store-manager.css",
  "./store-manager.js",
  "./manifest.json",
  "./images/hero-hyojonggaeng.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(APP_FILES);
      })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys
            .filter(function(key) {
              return key !== CACHE_NAME;
            })
            .map(function(key) {
              return caches.delete(key);
            })
        );
      })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        return cachedResponse || fetch(event.request);
      })
  );
});
