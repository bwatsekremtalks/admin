/* Bwat Sekrem Talks - popup "X personnes ont deja reserve" pour bwatsekremtalks.com
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
  if (/[?&](reserve|reservation)=(ok|1)/i.test(location.search)) ls.set(DONE, '1');
  if (ls.get(DONE)) return;

  var T = {
    fr: { t: function (n, c) { return c ? n + '<em>/' + c + '</em> places r\u00e9serv\u00e9es' : n + ' personnes ont d\u00e9j\u00e0 r\u00e9serv\u00e9 leur place'; }, s: function (d, r) { return (r != null ? (r > 0 ? '<span class="nw">Plus que <b>' + r + '</b> place' + (r > 1 ? 's' : '') + ' disponible' + (r > 1 ? 's' : '') + '</span>' : '\u26d4 Complet') : '\u26a0\ufe0f Places limit\u00e9es') + (d > 0 ? '<br><small>dont ' + d + ' aujourd\u2019hui</small>' : ''); }, b: 'R\u00e9server ma place', x: 'R\u00e9duire', m: function (n, r) { return r != null ? 'Plus que ' + r + ' places \u00b7 R\u00e9server' : n + ' inscrits \u00b7 R\u00e9server'; } },
    ht: { t: function (n, c) { return c ? n + '<em>/' + c + '</em> plas rez\u00e8ve' : n + ' moun deja rez\u00e8ve plas yo'; }, s: function (d, r) { return (r != null ? (r > 0 ? '<span class="nw">Rete <b>' + r + '</b> plas s\u00e8lman</span>' : '\u26d4 Plen') : '\u26a0\ufe0f Plas yo limite') + (d > 0 ? '<br><small>' + d + ' jodi a</small>' : ''); }, b: 'Rez\u00e8ve plas mwen', x: 'F\u00e8 l piti', m: function (n, r) { return r != null ? 'Rete ' + r + ' plas \u00b7 Rez\u00e8ve' : n + ' enskri \u00b7 Rez\u00e8ve'; } },
    en: { t: function (n, c) { return c ? n + '<em>/' + c + '</em> seats booked' : n + ' people have already booked their seat'; }, s: function (d, r) { return (r != null ? (r > 0 ? '<span class="nw">Only <b>' + r + '</b> seat' + (r > 1 ? 's' : '') + ' left</span>' : '\u26d4 Full') : '\u26a0\ufe0f Limited seats') + (d > 0 ? '<br><small>' + d + ' today</small>' : ''); }, b: 'Book my seat', x: 'Minimize', m: function (n, r) { return r != null ? 'Only ' + r + ' seats left \u00b7 Book' : n + ' booked \u00b7 Book now'; } },
  };
  function lang() { var l = (opt('lang') || document.documentElement.lang || 'fr').slice(0, 2).toLowerCase(); if (l === 'kr') l = 'ht'; return T[l] ? l : 'fr'; }

  var data = null, scrolled = !!ss.get(MINI) || scrollY > 250, shown = false, host = null, sh = null;

  // La banniere des cookies est-elle encore a l'ecran ? (element fixe visible qui parle de cookies)
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
  function target() {
    var c = opt('cible'); if (c) { try { var e = document.querySelector(c); if (e) return e; } catch (e2) {} }
    var tel = document.querySelector('form input[type="tel"], form input[name*="tel" i], form input[name*="phone" i]');
    return tel ? tel.closest('form') : (document.getElementById('reservation') || document.getElementById('inscription'));
  }
  function isResaForm(f) {
    if (!f || f.tagName !== 'FORM') return false;
    if (f.querySelector('input[type="tel"], input[name*="tel" i], input[name*="phone" i]')) return true;
    var c = opt('cible'); try { return !!(c && (f.matches(c) || f.closest(c))); } catch (e) { return false; }
  }

  // La personne envoie le formulaire de reservation -> on ne montre plus jamais le popup
  document.addEventListener('submit', function (e) { if (isResaForm(e.target)) { ls.set(DONE, '1'); bye(); } }, true);

  function getData() { return fetch(SB + '/rest/v1/rpc/talks_compteur', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: '{}' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) { data = j; paint(); } }).catch(function () {}); }
  getData(); setInterval(getData, 90000);
  function onScroll() { if (scrollY > 250) { scrolled = true; removeEventListener('scroll', onScroll); } }
  addEventListener('scroll', onScroll, { passive: true });

  var timer = setInterval(function () {
    if (shown || !scrolled || !data || !(data.personnes >= 10)) return;
    if (cookieVisible()) return;
    clearInterval(timer); setTimeout(show, 1500);
  }, 1000);

  function paint() {
    if (!sh || !data) return; var L = T[lang()];
    var n = +data.personnes || 0, c = +data.capacite || 0, r = c ? Math.max(0, c - n) : null;
    sh.querySelector('.t').innerHTML = L.t('<b>' + n + '</b>', c || 0);
    sh.querySelector('.s').innerHTML = L.s(+data.aujourdhui || 0, r);
    sh.querySelector('.p span').textContent = L.m(n, r);
    var bar = sh.querySelector('.g'), f = sh.querySelector('.g i');
    if (c) { var pct = Math.min(100, n / c * 100); bar.style.display = ''; setTimeout(function () { f.style.width = Math.max(4, pct) + '%'; }, 400); f.className = pct >= 90 ? 'tres' : pct >= 70 ? 'chaud' : ''; } else bar.style.display = 'none';
  }
  function bye() { clearInterval(timer); if (host) { var h = host; host = null; h.style.opacity = '0'; setTimeout(function () { h.remove(); }, 450); } }
  function go() {
    try { if (window.gtag) gtag('event', 'popup_reserver'); } catch (e) {}
    var el = target(), lien = opt('lien');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); var f = el.querySelector && el.querySelector('input,select,textarea'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 700); }
    else location.href = lien || 'https://bwatsekremtalks.com/';
  }

  function show() {
    if (shown || ls.get(DONE)) return; shown = true;
    var L = T[lang()], reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    host = document.createElement('div');
    host.style.cssText = 'position:fixed;z-index:2147483000;left:16px;bottom:16px;transition:opacity .35s;';
    sh = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    sh.innerHTML = '<style>@import url("https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap");' +
      '.c{box-sizing:border-box;font-family:Lexend,system-ui,sans-serif;width:min(360px,calc(100vw - 32px));background:#fff;color:#0D2D4A;border:2px solid rgba(93,176,51,.55);border-radius:20px;box-shadow:0 18px 50px rgba(13,45,74,.22);padding:14px 16px 14px 14px;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;position:relative;' +
      (reduce ? '' : 'transform:translateY(140%);opacity:0;transition:transform .55s cubic-bezier(.2,.9,.3,1.2),opacity .35s;') + '}' +
      '.c.on{transform:none;opacity:1}.c.hide,.p.hide{display:none}' +
      (reduce ? '' : '@keyframes bob{0%,55%,100%{transform:translateY(0) scale(1)}8%{transform:translateY(-16px) scale(1.02)}16%{transform:translateY(0) scale(.99,1.01)}23%{transform:translateY(-8px)}30%{transform:translateY(0)}36%{transform:translateY(-3px)}42%{transform:translateY(0)}}' +
      '@keyframes glow{0%,100%{box-shadow:0 18px 50px rgba(13,45,74,.22),0 0 0 0 rgba(93,176,51,.45)}50%{box-shadow:0 18px 50px rgba(13,45,74,.22),0 0 0 10px rgba(93,176,51,0)}}' +
      '.c.on.bob,.p{animation:bob 2.6s cubic-bezier(.3,.7,.4,1) infinite,glow 2.6s ease-out infinite}.c.on.bob:hover,.p:hover{animation-play-state:paused}' +
      '@keyframes wig{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-14deg) scale(1.15)}40%{transform:rotate(12deg) scale(1.15)}60%{transform:rotate(-6deg) scale(1.05)}80%{transform:rotate(3deg)}}.c.on .i,.p i{animation:wig 1.3s ease-in-out infinite}' +
      '@keyframes shine{0%{left:-60%}55%,100%{left:130%}}.a:after,.p:after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:shine 2.2s ease-in-out infinite}') +
      '.i{grid-row:span 2;width:44px;height:44px;border-radius:14px;background:#EAF6E2;display:grid;place-items:center;font-size:22px}' +
      '.t{font-weight:600;font-size:15px;line-height:1.25;padding-right:18px}.t b{color:#5DB033;font-weight:700;font-size:18px}' +
      '.s{font-size:12.5px;color:#8a4b00;font-weight:600}.s b{color:#c2410c;font-size:14px}.s .nw{white-space:nowrap}.s small{font-size:12px;color:#6b7f96;font-weight:500}.t em{font-style:normal;color:#6b7f96;font-weight:600;font-size:15px;margin-right:4px}' +
      '.g{grid-column:1/-1;height:10px;border-radius:999px;background:rgba(13,45,74,.08);overflow:hidden;position:relative;margin-top:6px}.g i{position:absolute;inset:0 auto 0 0;width:0;border-radius:999px;background:linear-gradient(90deg,#5DB033,#8fd14f);transition:width 1.3s cubic-bezier(.2,.8,.2,1)}.g i.chaud{background:linear-gradient(90deg,#5DB033,#F5A623)}.g i.tres{background:linear-gradient(90deg,#F5A623,#e8505b)}' +
      '.a{position:relative;overflow:hidden;grid-column:1/-1;margin-top:8px;display:block;text-align:center;background:#5DB033;color:#fff;font-weight:600;font-size:14px;border-radius:999px;padding:10px 14px;cursor:pointer;border:0;font-family:inherit}' +
      '.a:hover,.p:hover{filter:brightness(1.06)}.x{position:absolute;top:2px;right:6px;border:0;background:none;font-size:24px;line-height:1;color:#6b7f96;cursor:pointer;padding:4px 6px}' +
      '.p{position:relative;overflow:hidden;box-sizing:border-box;font-family:Lexend,system-ui,sans-serif;display:inline-flex;align-items:center;gap:8px;background:#5DB033;color:#fff;border:0;border-radius:999px;padding:11px 18px;font-weight:600;font-size:14px;cursor:pointer;box-shadow:0 12px 30px rgba(13,45,74,.25)}' +
      '.p i{font-style:normal;display:inline-block}' +
      '</style>' +
      '<div class="c" role="status" aria-live="polite"><button class="x" type="button" aria-label="' + L.x + '" title="' + L.x + '">\u2013</button>' +
      '<div class="i">\ud83d\udd25</div><div class="t"></div><div class="s"></div><div class="g"><i></i></div><button class="a" type="button">' + L.b + '</button></div>' +
      '<button class="p hide" type="button"><i>\ud83d\udd25</i><span></span></button>';
    var c = sh.querySelector('.c'), pill = sh.querySelector('.p');
    document.body.appendChild(host); paint();
    function mini(on) { c.classList.toggle('hide', on); pill.classList.toggle('hide', !on); if (on) ss.set(MINI, '1'); }
    if (ss.get(MINI)) mini(true);
    else requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add('on'); setTimeout(function () { c.classList.add('bob'); }, 650); }); });
    sh.querySelector('.x').addEventListener('click', function () { mini(true); });
    sh.querySelector('.a').addEventListener('click', go);
    pill.addEventListener('click', go);
    // Pendant que le formulaire est visible a l'ecran, le popup s'efface pour ne pas le couvrir
    var f = target();
    if (f && 'IntersectionObserver' in window) new IntersectionObserver(function (es) {
      if (!host) return; var vis = es[0].isIntersecting; host.style.opacity = vis ? '0' : '1'; host.style.pointerEvents = vis ? 'none' : '';
    }, { threshold: 0.15 }).observe(f);
  }
})();
