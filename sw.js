const CACHE='are-static-v13';
const FILES=['./','./index.html','./installa.html','./manifest.json','./parlotueio-icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  // Le pagine PHP sono dinamiche (sessione, esito copie, stato database): mai servirle dalla cache.
  if(/\.php$/i.test(u.pathname)||u.searchParams.has('azione')){
    e.respondWith(fetch(e.request,{cache:'no-store'}));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{
    if(x.ok){const copy=x.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return x;
  })));
});
