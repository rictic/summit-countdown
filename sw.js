const resources = [
    '/',
    '/favicon.ico',
    'https://polygit.org/components/webcomponentsjs/webcomponents.js',
];

this.addEventListener('install', (event) => {
  event.waitUntil(caches.open('v1').then((cache) => cache.addAll(resources)));
});

self.addEventListener('fetch', (event) => {
  // Policy: race the cache and the network, always update the cache from the
  //         network.
  event.respondWith(
    promiseAny([
      caches.match(event.request),
      fetch(event.request).then((response) => {
        caches.open('v1').then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
    ])
  );
});

// Promise.race is no good to us because it rejects if
// a promise rejects before fulfilling. Let's make a proper
// race function:
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    // make sure promises are all promises
    promises = promises.map(p => Promise.resolve(p));
    // resolve this promise as soon as one resolves
    promises.forEach(p => p.then(resolve));
    // reject if all promises reject
    promises.reduce((a, b) => a.catch(() => b))
      .catch(() => reject(Error("All failed")));
  });
};
