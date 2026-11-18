/* Bwat Sekrem Talks - popups lisibles quand une page est intégrée (iframe) dans bwatsekremtalks.com
 *
 * À ajouter dans les pages intégrées : <script src="../compteur/embed-view.js" defer></script>
 * Le site (compteur/toast.js) envoie la partie de l'iframe visible à l'écran : { bstView: { top, h } }.
 * Ici, les popups (<dialog>, visionneuse, notifications) sont placés dans cette partie visible,
 * avec leur propre défilement, et le site bloque le défilement de la page tant qu'un popup est ouvert.
 */
(function () {
  if (window.parent === window || window.__bstEmbedView) return; window.__bstEmbedView = true;
  var root = document.documentElement;
  root.classList.add('bst-embed');
  var css = document.createElement('style');
  css.textContent =
    'html.bst-embed.bst-view dialog[open]{position:absolute!important;top:calc(var(--bst-vt,0px) + 10px)!important;bottom:auto!important;margin:0 auto!important;max-height:calc(var(--bst-vh,100vh) - 20px)!important;overflow:auto!important;overscroll-behavior:contain}' +
    'html.bst-embed.bst-view .bst-fix{position:absolute!important;top:var(--bst-vt,0px)!important;bottom:auto!important;height:var(--bst-vh,100vh)!important}' +
    'html.bst-embed.bst-view .bst-fix-bottom{position:absolute!important;top:calc(var(--bst-vt,0px) + var(--bst-vh,100vh) - 76px)!important;bottom:auto!important}' +
    '@media (max-width:640px){html.bst-embed.bst-view dialog[open]{top:calc(var(--bst-vt,0px) + 6px)!important;max-height:calc(var(--bst-vh,100vh) - 12px)!important;width:calc(100% - 12px)!important}}';
  (document.head || root).appendChild(css);

  addEventListener('message', function (e) {
    var v = e.data && e.data.bstView; if (!v || e.source !== window.parent) return;
    root.style.setProperty('--bst-vt', Math.max(0, Math.round(v.top)) + 'px');
    root.style.setProperty('--bst-vh', Math.max(240, Math.round(v.h)) + 'px');
    root.classList.add('bst-view');
  });

  // Un popup est-il ouvert ? (<dialog open> ou élément marqué .bst-fix visible)
  function ouvert() {
    if (document.querySelector('dialog[open]')) return true;
    var l = document.querySelectorAll('.bst-fix');
    for (var i = 0; i < l.length; i++) if (l[i].offsetParent !== null || getComputedStyle(l[i]).display !== 'none') { if (!l[i].classList.contains('hidden')) return true; }
    return false;
  }
  var etat = false;
  function check() { var o = ouvert(); if (o !== etat) { etat = o; try { parent.postMessage({ bstModal: o }, '*'); } catch (x) {} } }
  new MutationObserver(check).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open', 'class', 'style', 'hidden'] });
  document.addEventListener('close', check, true);
  try { parent.postMessage({ bstReady: 1 }, '*'); } catch (x) {}
})();
