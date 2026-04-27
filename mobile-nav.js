/* Treat Engine — shared mobile drawer.
   Auto-installs on every page that loads it. Idempotent. */
(function(){
  if (window.__teMobileNavInstalled) return;
  window.__teMobileNavInstalled = true;

  const NAV_LINKS = [
    { href: '/home',     label: 'Home',           match: /home\.html$|^\/home\b/i },
    { href: '/websites', label: 'Water Websites', match: /water websites\.html$|^\/websites\b/i },
    { href: '/ads',      label: 'Water Leads',    match: /water leads\.html$|^\/ads\b/i },
    { href: '/sales',    label: 'Water Sales',    match: /water sales\.html$|^\/sales\b/i },
  ];

  function activeIndex(){
    const p = decodeURIComponent(location.pathname).toLowerCase();
    for (let i=0;i<NAV_LINKS.length;i++){
      if (NAV_LINKS[i].match.test(p)) return i;
    }
    return -1;
  }

  function buildDrawer(){
    if (document.getElementById('te-mobile-drawer')) return;
    const active = activeIndex();
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.id = 'te-mobile-drawer';
    drawer.setAttribute('aria-hidden','true');
    drawer.innerHTML = `
      <div class="mobile-drawer-scrim" data-close></div>
      <aside class="mobile-drawer-panel" role="dialog" aria-label="Menu">
        <div class="mobile-drawer-head">
          <a href="/home"><img src="uploads/Treat Engine Logo .png" alt="Treat Engine"/></a>
          <button class="mobile-drawer-close" aria-label="Close menu" data-close>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <nav class="mobile-drawer-nav">
          ${NAV_LINKS.map((l,i) => `<a href="${l.href}"${i===active?' class="active"':''}>${l.label}</a>`).join('')}
        </nav>
        <div class="mobile-drawer-foot">
          <a class="drawer-cta" href="/booking">Book a free strategy call →</a>
          <div class="mobile-drawer-contact">
            <a href="mailto:Info@TreatLeads.com">Info@TreatLeads.com</a>
            <a href="tel:+16173156471">+1 (617) 315-6471</a>
          </div>
        </div>
      </aside>
    `;
    document.body.appendChild(drawer);

    drawer.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) close();
    });
  }

  function ensureToggle(){
    // Find every nav-inner and inject a hamburger if not present
    document.querySelectorAll('.nav .nav-inner, nav.nav .nav-inner').forEach(inner => {
      if (inner.querySelector('.mobile-toggle')) return;
      const btn = document.createElement('button');
      btn.className = 'mobile-toggle';
      btn.setAttribute('aria-label','Open menu');
      btn.setAttribute('aria-expanded','false');
      btn.setAttribute('aria-controls','te-mobile-drawer');
      btn.innerHTML = '<span></span><span></span><span></span>';
      btn.addEventListener('click', open);
      inner.appendChild(btn);
    });
  }

  function open(){
    buildDrawer();
    const drawer = document.getElementById('te-mobile-drawer');
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('drawer-locked');
    document.querySelectorAll('.mobile-toggle').forEach(t => t.setAttribute('aria-expanded','true'));
  }

  function close(){
    const drawer = document.getElementById('te-mobile-drawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    document.body.classList.remove('drawer-locked');
    document.querySelectorAll('.mobile-toggle').forEach(t => t.setAttribute('aria-expanded','false'));
  }

  // Esc closes
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function boot(){
    ensureToggle();
    // Re-run for React pages that mount nav after initial DOMContentLoaded
    const obs = new MutationObserver(() => ensureToggle());
    obs.observe(document.body, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
