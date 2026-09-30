const CACHE="migraine-v10";
const CORE=["./","index.html","manifest.json","icon-180.png","icon-192.png","icon-512.png","icon.svg"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET") return;
  const url=new URL(req.url);
  // app files: network first (so updates arrive), cache as fallback when offline
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return r; }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))));
    return;
  }
  // fonts: cache first
  if(url.host.includes("fonts.googleapis.com")||url.host.includes("fonts.gstatic.com")){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return res; })));
  }
});
