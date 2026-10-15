const CACHE_VERSION = 'v4';
const CACHE_NAME = 'heist-' + CACHE_VERSION;
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './brief-banque.jpg',
  './brief-bijouterie.jpg',
  './brief-casino.jpg',
  './brief-courtage.jpg',
  './brief-depot.jpg',
  './brief-galerie.jpg',
  './brief-hotel.jpg',
  './brief-lingots.jpg',
  './brief-meridian.jpg',
  './brief-musee.jpg',
  './brief-port.jpg',
  './brief-siege-banque.jpg',
  './enemy-federal.png',
  './enemy-guard.png',
  './enemy-police.png',
  './enemy-swat.png',
  './faction-logo.png',
  './icon-192.png',
  './icon-512.png',
  './milestone-tier0-standard.jpg',
  './milestone-tier1-blackened-steel.jpg',
  './milestone-tier10-black-obsidian.jpg',
  './milestone-tier2-bone-white.jpg',
  './milestone-tier3-copper-etched.jpg',
  './milestone-tier4-frost-blue.jpg',
  './milestone-tier5-dark-patina.jpg',
  './milestone-tier6-snakeskin.jpg',
  './milestone-tier7-damascus-steel.jpg',
  './milestone-tier8-legion-burgundy.jpg',
  './milestone-tier9-gold-plated.jpg',
  './music-menu.mp3',
  './op-assault-arctic.png',
  './op-assault-casino.png',
  './op-assault-crimson.png',
  './op-assault-gold.png',
  './op-assault-legion.png',
  './op-assault-vault.png',
  './op-assault.png',
  './op-heavy.png',
  './op-light.png',
  './op-shadow.png',
  './skin-arctic.jpg',
  './skin-casino.jpg',
  './skin-crimson.jpg',
  './skin-gold.jpg',
  './skin-legion.jpg',
  './skin-vault.jpg',
  './sound-assault.mp3',
  './sound-bomb-tick.mp3',
  './sound-click.mp3',
  './sound-explosion.mp3',
  './sound-flashbang.mp3',
  './sound-heavy.mp3',
  './sound-light.mp3',
  './sound-mission-stinger.mp3',
  './sound-night-vision.mp3',
  './sound-night.mp3',
  './sound-shadow-blade.mp3',
  './sound-trap.mp3',
  './sound-unlock.mp3',
  './unit-logo.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHtml = req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Réseau d'abord : charge toujours la version la plus récente du jeu si
    // une connexion est disponible. En cas d'échec (hors ligne), se rabat
    // sur la dernière version mise en cache.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Cache d'abord pour le reste (icônes, manifest, assets) — ces fichiers
  // changent rarement, autant les servir instantanément depuis le cache.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});
