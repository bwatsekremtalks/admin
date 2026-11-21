/* Bwat Sekrem Talks - popup "Obtenez votre certificat de participation" pour bwatsekremtalks.com (avant : compteur de reservations ; reservations closes le 21 nov.)
 *
 * A ajouter une seule fois sur le site :
 *   <script src="https://bwatsekremtalks.github.io/admin/compteur/toast.js" defer></script>
 * Options facultatives (attributs sur la balise <script>) :
 *   data-lang="fr|ht|en"      langue (sinon : langue de la page, sinon fr)
 *   data-cible="#reservation" formulaire vers lequel defiler (sinon : le formulaire avec un champ telephone)
 *   data-lien="https://..."   page de reservation, si le formulaire n'est pas sur la page affichee
 *
 * Comportement :
 *  - apparait apres l'acceptation des cookies et le debut du defilement ;
 *  - RESTE a l'ecran tant que la personne n'a pas reserve (a chaque visite) ;
 *  - le bouton "-" le reduit en petite pastille qui reste ; il ne disparait pas ;
 *  - se cache pendant que le formulaire de reservation est visible (pour ne pas le couvrir) ;
 *  - disparait pour de bon quand la personne envoie le formulaire de reservation (memorise sur son telephone) ;
 *  - aucune donnee personnelle : seulement les totaux.
 */
(function () {
  if (window.__bstToast) return; window.__bstToast = true;
  var me = document.currentScript || document.querySelector('script[src*="compteur/toast.js"]');
  var opt = function (k) { return me && me.getAttribute('data-' + k); };
  var SB = 'https://nltlgytehikguydcdhyy.supabase.co', KEY = 'sb_publishable_ncDXEDbAodI2yxhwlTrnwg_M4SvBqly';
  var DONE = 'bst_a_reserve', MINI = 'bst_toast_mini';
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  /* ---- Ajuste la hauteur des iframes BST (compteur, section b\u00e9n\u00e9vole) selon leur contenu r\u00e9el ---- */
  addEventListener('message', function (e) {
    try {
      if (!/bwatsekremtalks\.github\.io$/.test(new URL(e.origin).hostname) || !e.data || !(e.data.bstH > 50 && e.data.bstH < 30000)) return;
      var fr = [].slice.call(document.querySelectorAll('iframe')).filter(function (f) { return f.contentWindow === e.source; })[0];
      if (fr) { fr.style.setProperty('height', e.data.bstH + 'px', 'important'); fr.style.setProperty('overflow', 'hidden'); }
    } catch (x) {}
  });
  /* ---- Popups des pages intégrées (iframes) : on leur indique la partie visible et on bloque le défilement pendant qu'un popup est ouvert ---- */
  (function () {
    var bst = function (f) { try { return /bwatsekremtalks\.github\.io$/.test(new URL(f.src).hostname); } catch (e) { return false; } };
    var headerH = function () { var h = document.querySelector('header'); if (!h) return 0; var cs = getComputedStyle(h), r = h.getBoundingClientRect(); return (cs.position === 'sticky' || cs.position === 'fixed') && r.bottom > 0 ? r.bottom : 0; };
    var vue = function (f) { var r = f.getBoundingClientRect(), hh = headerH(), top = Math.max(hh, r.top), bot = Math.min(innerHeight, r.bottom); return { top: top - r.top, h: Math.max(0, bot - top) }; };
    var envoi = function () { [].slice.call(document.querySelectorAll('iframe')).filter(bst).forEach(function (f) { try { f.contentWindow.postMessage({ bstView: vue(f) }, '*'); } catch (e) {} }); };
    var raf = 0; var plan = function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; envoi(); }); };
    addEventListener('scroll', plan, { passive: true }); addEventListener('resize', plan); if (window.visualViewport) visualViewport.addEventListener('resize', plan);
    var lock = null;
    addEventListener('message', function (e) {
      try { if (!/bwatsekremtalks\.github\.io$/.test(new URL(e.origin).hostname) || !e.data) return; } catch (x) { return; }
      var f = [].slice.call(document.querySelectorAll('iframe')).filter(function (x) { return x.contentWindow === e.source; })[0];
      if (e.data.bstReady && f) { setTimeout(envoi, 50); return; }
      if (e.data.bstScroll && f && !lock) {   // une page intégrée demande d'aller à une de ses sections
        var s = e.data.bstScroll, base = f.getBoundingClientRect().top + scrollY, hh = headerH(), y = base + (+s.y || 0);
        var cible = s.block === 'center' ? y + (+s.h || 0) / 2 - (hh + (innerHeight - hh) / 2) : s.block === 'end' ? y + (+s.h || 0) - innerHeight + 12 : y - hh - 12;
        scrollTo({ top: Math.max(0, cible), behavior: s.smooth === false ? 'auto' : 'smooth' }); return;
      }
      if (!('bstModal' in e.data) || !f) return;
      var de = document.documentElement, bd = document.body;
      if (e.data.bstModal) {
        // l'iframe doit couvrir l'écran : on fait défiler la page pour que le popup ait toute la hauteur disponible
        var r = f.getBoundingClientRect(), hh = headerH(), dispo = innerHeight - hh;
        if (r.height >= dispo) { if (r.top > hh) scrollBy(0, r.top - hh); else if (r.bottom < innerHeight) scrollBy(0, r.bottom - innerHeight); }
        else if (r.top < hh || r.bottom > innerHeight) scrollBy(0, r.top - hh - (dispo - r.height) / 2);
        if (!lock) { lock = { o: de.style.overflow, b: de.style.overscrollBehavior }; de.style.overflow = 'hidden'; de.style.overscrollBehavior = 'none'; }   // seulement <html> : sinon l'en-tête collant du site se décroche
        envoi(); setTimeout(envoi, 120); setTimeout(envoi, 400);
      } else if (lock) { de.style.overflow = lock.o; de.style.overscrollBehavior = lock.b; lock = null; envoi(); }
    });
    setTimeout(envoi, 800);
  })();
  /* ---- Compteur de visites anonyme : sans cookie, sans IP ; un identifiant al\u00e9atoire par onglet (sessionStorage) ---- */
  (function () {
    try {
      var sid = ss.get('bst_sid'), nouveau = false;
      if (!sid) { sid = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); ss.set('bst_sid', sid); nouveau = true; }
      var src = ss.get('bst_src');
      if (!src) {
        var q = new URLSearchParams(location.search), u = (q.get('utm_source') || q.get('src') || '').toLowerCase(), r = '';
        try { r = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
        if (r && r.indexOf('bwatsekremtalks') >= 0) r = '';
        src = u || (/whatsapp|wa\.me/.test(r) ? 'whatsapp' : /facebook|fb\.com|fb\.me/.test(r) ? 'facebook' : /instagram/.test(r) ? 'instagram' : /google\./.test(r) ? 'google' : /tiktok/.test(r) ? 'tiktok' : /linkedin|lnkd/.test(r) ? 'linkedin' : /t\.co$|twitter|x\.com/.test(r) ? 'x' : r ? r.split('.').slice(-2).join('.') : (/FBAN|FBAV|FB_IAB/.test(navigator.userAgent) ? 'facebook' : /Instagram/.test(navigator.userAgent) ? 'instagram' : 'direct'));
        ss.set('bst_src', src);
      }
      var dev = /iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : (/Mobi|Android|iPhone/i.test(navigator.userAgent) || innerWidth < 760) ? 'mobile' : 'desktop';
      var last = '';
      var hit = function () {
        var path = location.pathname || '/'; if (path === last) return; last = path;
        fetch(SB + '/rest/v1/rpc/talks_visite', { method: 'POST', keepalive: true, headers: { apikey: KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_sid: sid, p_path: path, p_src: src, p_dev: dev, p_lang: (document.documentElement.lang || '').slice(0, 5), p_nouveau: nouveau }) }).catch(function () {});
        nouveau = false;
      };
      hit();
      // le site change de page sans recharger (React) : on suit les changements d'adresse
      ['pushState', 'replaceState'].forEach(function (k) { var o = history[k]; history[k] = function () { var r2 = o.apply(this, arguments); setTimeout(hit, 50); return r2; }; });
      addEventListener('popstate', function () { setTimeout(hit, 50); });
    } catch (e) {}
  })();
  /* ---- Popup « Obtenir mon certificat de participation » (les réservations sont closes) ---- */
  if (/^\/certificat/i.test(location.pathname)) return;           // pas sur la page du certificat elle-même
  var CMINI = 'bst_cert_mini', FORCE = /[?&]popup=1/.test(location.search);
  if (FORCE) { try { sessionStorage.removeItem(CMINI); } catch (e) {} }
  var CT = {
    fr: { t: 'Obtenez votre <b>certificat de participation</b>', s: 'À votre nom · vérifiable par QR code · remis le jour même', b: 'Obtenir mon certificat', m: 'Mon certificat', x: 'Réduire' },
    ht: { t: 'Jwenn <b>sètifika patisipasyon</b> ou', s: 'Ak non w · ou ka verifye l ak QR code · w ap resevwa l jou a menm', b: 'Mwen vle sètifika m', m: 'Sètifika m', x: 'Redwi' },
    en: { t: 'Get your <b>certificate of participation</b>', s: 'In your name · verifiable by QR code · handed out on the day', b: 'Get my certificate', m: 'My certificate', x: 'Minimize' }
  };
  function lang() { var l = (opt('lang') || document.documentElement.lang || 'fr').slice(0, 2).toLowerCase(); if (l === 'kr') l = 'ht'; return CT[l] ? l : 'fr'; }
  var URLC = opt('certificat') || 'https://bwatsekremtalks.com/certificat', scrolled = !!ss.get(CMINI) || scrollY > 250 || FORCE, shown = false, host = null;
  function cookieVisible() {
    var els = document.querySelectorAll('body *');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; if (el.children.length > 40 || el === host) continue;
      var cs = getComputedStyle(el); if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      var r = el.getBoundingClientRect(); if (r.width < 40 || r.height < 20 || r.bottom < 0 || r.top > innerHeight) continue;
      if (/cookie/i.test(el.textContent || '')) return true;
    }
    return false;
  }
  function onScroll() { if (scrollY > 250) { scrolled = true; removeEventListener('scroll', onScroll); } }
  addEventListener('scroll', onScroll, { passive: true });
  var timer = setInterval(function () { if (shown || !scrolled || cookieVisible()) return; clearInterval(timer); setTimeout(show, 1500); }, 1000);
  function go() { try { if (window.gtag) gtag('event', 'popup_certificat'); } catch (e) {} location.href = URLC; }
  function show() {
    if (shown) return; shown = true;
    var L = CT[lang()], reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    host = document.createElement('div');
    host.style.cssText = 'position:fixed;z-index:2147483000;left:16px;bottom:16px;transition:opacity .35s;';
    var sh = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    sh.innerHTML = '<style>@import url("https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap");' +
      '.c{position:relative;box-sizing:border-box;font-family:Lexend,system-ui,sans-serif;width:min(360px,calc(100vw - 32px));background:#fff;color:#0D2D4A;border:2px solid rgba(30,140,240,.45);border-radius:20px;box-shadow:0 18px 50px rgba(13,45,74,.22);padding:14px 16px 14px 14px;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;' +
      (reduce ? '' : 'transform:translateY(140%);opacity:0;transition:transform .55s cubic-bezier(.2,.9,.3,1.2),opacity .35s;') + '}' +
      '.c.on{transform:none;opacity:1}.c.hide,.p.hide{display:none}' +
      (reduce ? '' : '@keyframes bob{0%,55%,100%{transform:translateY(0)}8%{transform:translateY(-14px)}16%{transform:translateY(0)}23%{transform:translateY(-6px)}30%{transform:translateY(0)}}' +
      '@keyframes glow{0%,100%{box-shadow:0 18px 50px rgba(13,45,74,.22),0 0 0 0 rgba(30,140,240,.4)}50%{box-shadow:0 18px 50px rgba(13,45,74,.22),0 0 0 10px rgba(30,140,240,0)}}' +
      '.c.on.bob,.p{animation:bob 3.2s cubic-bezier(.3,.7,.4,1) infinite,glow 3.2s ease-out infinite}.c.on.bob:hover,.p:hover{animation-play-state:paused}' +
      '@keyframes wig{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-12deg) scale(1.12)}40%{transform:rotate(10deg) scale(1.12)}60%{transform:rotate(-5deg)}80%{transform:rotate(2deg)}}.c.on .i,.p i{animation:wig 1.6s ease-in-out infinite}' +
      '@keyframes shine{0%{left:-60%}55%,100%{left:130%}}.a:after,.p:after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:shine 2.4s ease-in-out infinite}') +
      '.i{grid-row:span 2;width:46px;height:46px;border-radius:14px;background:#e6f1ff;display:grid;place-items:center;font-size:24px}' +
      '.t{font-weight:600;font-size:15px;line-height:1.3;padding-right:18px}.t b{color:#1a5cc0;font-weight:700}' +
      '.s{font-size:12.5px;line-height:1.35;color:#5b6f8a;font-weight:500}' +
      '.a{position:relative;overflow:hidden;grid-column:1/-1;margin-top:8px;display:block;text-align:center;background:#1a5cc0;color:#fff;font-weight:600;font-size:14px;border-radius:999px;padding:10px 14px;cursor:pointer;border:0;font-family:inherit}' +
      '.a:hover,.p:hover{filter:brightness(1.08)}.x{position:absolute;top:2px;right:6px;border:0;background:none;font-size:24px;line-height:1;color:#6b7f96;cursor:pointer;padding:4px 6px}' +
      '.p{position:relative;overflow:hidden;box-sizing:border-box;max-width:calc(100vw - 32px);font-family:Lexend,system-ui,sans-serif;display:inline-flex;align-items:center;gap:8px;background:#1a5cc0;color:#fff;border:0;border-radius:999px;padding:11px 18px;font-weight:600;font-size:14px;cursor:pointer;box-shadow:0 12px 30px rgba(13,45,74,.3)}' +
      '.p i{font-style:normal;display:inline-block}</style>' +
      '<div class="c" role="status" aria-live="polite"><button class="x" type="button" aria-label="' + L.x + '" title="' + L.x + '">–</button>' +
      '<div class="i">🎓</div><div class="t">' + L.t + '</div><div class="s">' + L.s + '</div><button class="a" type="button">' + L.b + ' →</button></div>' +
      '<button class="p hide" type="button"><i>🎓</i><span>' + L.m + '</span></button>';
    var c = sh.querySelector('.c'), pill = sh.querySelector('.p');
    document.body.appendChild(host);
    function mini(on) { c.classList.toggle('hide', on); pill.classList.toggle('hide', !on); if (on) ss.set(CMINI, '1'); }
    if (ss.get(CMINI)) mini(true);
    else requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add('on'); setTimeout(function () { c.classList.add('bob'); }, 650); }); });
    sh.querySelector('.x').addEventListener('click', function () { mini(true); });
    sh.querySelector('.a').addEventListener('click', go); pill.addEventListener('click', go);
    // le popup s'efface pendant qu'un formulaire intégré (bénévoles, certificat) est à l'écran
    var sect = document.querySelector('iframe[src*="benevole"], iframe[src*="certificat"]');
    if (sect && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { if (!host) return; var v = es[0].isIntersecting; host.style.opacity = v ? '0' : '1'; host.style.pointerEvents = v ? 'none' : ''; }, { threshold: 0.2 }).observe(sect);
  }
})();
