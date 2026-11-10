/* Bwat Sekr\u00e8m Talks \u2014 petit popup \u00ab X personnes ont d\u00e9j\u00e0 r\u00e9serv\u00e9 \u00bb pour bwatsekremtalks.com
 *
 * \u00c0 ajouter une seule fois sur le site :
 *   <script src="https://bwatsekremtalks.github.io/admin/compteur/toast.js" defer></script>
 * Options facultatives (attributs sur la balise <script>) :
 *   data-lang="fr|ht|en"      langue (sinon : langue de la page, sinon fr)
 *   data-cible="#reservation" \u00e9l\u00e9ment vers lequel d\u00e9filer quand on clique (sinon : le formulaire de r\u00e9servation trouv\u00e9 sur la page)
 *   data-lien="https://\u2026"     page de r\u00e9servation, si le formulaire n'est pas sur la page affich\u00e9e
 *
 * Comportement : appara\u00eet UNE fois par visite, seulement apr\u00e8s que la personne a commenc\u00e9 \u00e0 d\u00e9filer
 * ET que la banni\u00e8re des cookies a disparu ; se ferme tout seul apr\u00e8s 12 s ; bouton \u2715 ; aucune donn\u00e9e personnelle.
 */
(function () {
  if (window.__bstToast) return; window.__bstToast = true;
  var me = document.currentScript || document.querySelector('script[src*="compteur/toast.js"]');
  var opt = function (k) { return me && me.getAttribute('data-' + k); };
  var SB = 'https://nltlgytehikguydcdhyy.supabase.co', KEY = 'sb_publishable_ncDXEDbAodI2yxhwlTrnwg_M4SvBqly';
  var SEEN = 'bst_toast_vu';
  try { if (sessionStorage.getItem(SEEN)) return; } catch (e) {}

  var T = {
    fr: { t: function (n) { return n + ' personnes ont d\u00e9j\u00e0 r\u00e9serv\u00e9 leur place'; }, s: function (d) { return (d > 0 ? 'dont ' + d + ' aujourd\u2019hui \u00b7 ' : '') + 'Places limit\u00e9es'; }, b: 'R\u00e9server ma place', x: 'Fermer' },
    ht: { t: function (n) { return n + ' moun deja rez\u00e8ve plas yo'; }, s: function (d) { return (d > 0 ? d + ' jodi a \u00b7 ' : '') + 'Plas yo limite'; }, b: 'Rez\u00e8ve plas mwen', x: 'F\u00e8men' },
    en: { t: function (n) { return n + ' people have already booked their seat'; }, s: function (d) { return (d > 0 ? d + ' today \u00b7 ' : '') + 'Limited seats'; }, b: 'Book my seat', x: 'Close' },
  };
  function lang() { var l = (opt('lang') || document.documentElement.lang || 'fr').slice(0, 2).toLowerCase(); if (l === 'kr') l = 'ht'; return T[l] ? l : 'fr'; }

  // La banni\u00e8re des cookies est-elle encore \u00e0 l'\u00e9cran ? (\u00e9l\u00e9ment fixe/collant visible qui parle de cookies)
  function cookieVisible() {
    var els = document.querySelectorAll('body *');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; if (el.children.length > 40) continue;
      var cs = getComputedStyle(el); if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      var r = el.getBoundingClientRect(); if (r.width < 40 || r.height < 20 || r.bottom < 0 || r.top > innerHeight) continue;
      if (/cookie/i.test(el.textContent || '')) return true;
    }
    return false;
  }
  function target() {
    var c = opt('cible'); if (c) { try { var e = document.querySelector(c); if (e) return e; } catch (e2) {} }
    var tel = document.querySelector('form input[type="tel"], form input[name*="tel" i], form input[name*="phone" i]');
    return tel ? tel.closest('form') : (document.getElementById('reservation') || document.getElementById('inscription'));
  }

  var data = null, scrolled = false, shown = false;
  fetch(SB + '/rest/v1/rpc/talks_compteur', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}' })
    .then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { data = j; }).catch(function () {});
  function onScroll() { if (scrollY > 250) { scrolled = true; removeEventListener('scroll', onScroll); } }
  addEventListener('scroll', onScroll, { passive: true });

  var tries = 0, timer = setInterval(function () {
    tries++; if (tries > 600) return clearInterval(timer);         // on arr\u00eate d'attendre apr\u00e8s 10 min
    if (shown || !scrolled || !data || !(data.personnes >= 10)) return;
    if (cookieVisible()) return;
    clearInterval(timer); setTimeout(show, 1500);                  // petite pause apr\u00e8s les cookies
  }, 1000);

  function show() {
    if (shown) return; shown = true; try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
    var L = T[lang()], host = document.createElement('div');
    host.style.cssText = 'position:fixed;z-index:2147483000;left:16px;bottom:16px;right:auto;';
    var sh = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    sh.innerHTML = '<style>@import url("https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap");' +
      '.c{box-sizing:border-box;font-family:Lexend,system-ui,sans-serif;width:min(360px,calc(100vw - 32px));background:#fff;color:#0D2D4A;border:2px solid rgba(93,176,51,.55);border-radius:20px;box-shadow:0 18px 50px rgba(13,45,74,.22);padding:14px 16px 14px 14px;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;position:relative;' +
      (reduce ? '' : 'transform:translateY(140%);opacity:0;transition:transform .55s cubic-bezier(.2,.9,.3,1.2),opacity .35s;') + '}' +
      '.c.on{transform:none;opacity:1}' +
      (reduce ? '' : '@keyframes bob{0%,55%,100%{transform:translateY(0) scale(1)}8%{transform:translateY(-16px) scale(1.02)}16%{transform:translateY(0) scale(.99,1.01)}23%{transform:translateY(-8px)}30%{transform:translateY(0)}36%{transform:translateY(-3px)}42%{transform:translateY(0)}}' +
      '.c.on.bob{animation:bob 2.6s cubic-bezier(.3,.7,.4,1) infinite}.c.on.bob:hover{animation-play-state:paused}' +
      '@keyframes wig{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-14deg) scale(1.15)}40%{transform:rotate(12deg) scale(1.15)}60%{transform:rotate(-6deg) scale(1.05)}80%{transform:rotate(3deg)}}.c.on .i{animation:wig 1.3s ease-in-out infinite}' +
      '@keyframes shine{0%{left:-60%}55%,100%{left:130%}}.a{position:relative;overflow:hidden}.a:after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:shine 2.2s ease-in-out infinite}' +
      '@keyframes glow{0%,100%{box-shadow:0 18px 50px rgba(13,45,74,.22),0 0 0 0 rgba(93,176,51,.45)}50%{box-shadow:0 18px 50px rgba(13,45,74,.22),0 0 0 10px rgba(93,176,51,0)}}.c.on.bob{animation:bob 2.6s cubic-bezier(.3,.7,.4,1) infinite,glow 2.6s ease-out infinite}') + '.i{grid-row:span 2;width:44px;height:44px;border-radius:14px;background:#EAF6E2;display:grid;place-items:center;font-size:22px}' +
      '.t{font-weight:600;font-size:15px;line-height:1.25;padding-right:18px}.t b{color:#5DB033;font-weight:700;font-size:18px}' +
      '.s{font-size:12.5px;color:#8a4b00;font-weight:600}.a{grid-column:1/-1;margin-top:8px;display:block;text-align:center;background:#5DB033;color:#fff;text-decoration:none;font-weight:600;font-size:14px;border-radius:999px;padding:10px 14px;cursor:pointer;border:0;font-family:inherit}' +
      '.a:hover{filter:brightness(1.06)}.x{position:absolute;top:6px;right:8px;border:0;background:none;font-size:18px;line-height:1;color:#6b7f96;cursor:pointer;padding:4px}' +
      '@media (max-width:520px){.c{width:calc(100vw - 32px)}}</style>' +
      '<div class="c" role="status" aria-live="polite"><button class="x" type="button" aria-label="' + L.x + '">\u00d7</button>' +
      '<div class="i">\ud83d\udd25</div><div class="t"></div><div class="s"></div><button class="a" type="button"></button></div>';
    var c = sh.querySelector('.c'), n = data.personnes;
    sh.querySelector('.t').innerHTML = L.t('<b>' + n + '</b>');
    sh.querySelector('.s').textContent = '\u26a0\ufe0f ' + L.s(data.aujourdhui || 0);
    sh.querySelector('.a').textContent = L.b;
    document.body.appendChild(host);
    requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add('on'); setTimeout(function () { c.classList.add('bob'); }, 650); }); });
    var close = function () { c.classList.remove('on'); setTimeout(function () { host.remove(); }, 600); };
    var auto = setTimeout(close, 12000);
    c.addEventListener('mouseenter', function () { clearTimeout(auto); });
    c.addEventListener('mouseleave', function () { auto = setTimeout(close, 6000); });
    sh.querySelector('.x').addEventListener('click', close);
    sh.querySelector('.a').addEventListener('click', function () {
      try { if (window.gtag) gtag('event', 'popup_reserver'); } catch (e) {}
      var el = target(), lien = opt('lien');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); var f = el.querySelector && el.querySelector('input,select,textarea'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 700); }
      else if (lien) location.href = lien;
      else location.href = 'https://bwatsekremtalks.com/';
      close();
    });
  }
})();
