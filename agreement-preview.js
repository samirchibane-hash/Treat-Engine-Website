/*
 * Agreement preview for the Water Leads checkouts (/ads/checkout, /ads/checkout-q).
 *
 * A "Preview the agreement" link under the pay button opens Treat Engine, Inc.'s
 * Master Services Agreement with an Order Form for the add-ons currently
 * selected. The document is rendered by ClearDeals' `leadgen-agreement` edge
 * function (`sample` action): the same template the buyer signs on
 * /ads/onboarding. Display only; the signed copy is built from the Stripe
 * checkout itself.
 *
 * Page markup: a <button id="ag-open"> link. Then:
 *   AgreementPreview.init({ plan, getAddons, onContinue });
 *   AgreementPreview.setCta('Start my subscription — $798/mo');
 */
(function () {
  var AGREEMENT_URL = 'https://ykplghimbbnakdojrpfm.supabase.co/functions/v1/leadgen-agreement';

  var CSS = [
    '.agree-note{margin-top:12px;font-size:12.5px;line-height:1.55;color:var(--ink-muted);text-align:center;}',
    '.agree-link{background:none;border:0;padding:0;font:inherit;font-weight:600;color:var(--blue-dark);text-decoration:underline;text-underline-offset:2px;cursor:pointer;}',
    '.agree-link:hover{color:var(--blue);}',
    '.agree-link:focus-visible,.ag-x:focus-visible{outline:2px solid var(--blue);outline-offset:2px;border-radius:4px;}',
    'dialog.ag-modal{margin:auto;inset:0;width:min(880px,calc(100vw - 32px));height:min(90vh,980px);max-width:none;max-height:none;padding:0;border:0;border-radius:18px;background:#fff;box-shadow:0 30px 80px -20px rgba(15,27,51,.45);overflow:hidden;}',
    'dialog.ag-modal[open]{display:flex;flex-direction:column;}',
    'dialog.ag-modal::backdrop{background:rgba(15,27,51,.55);}',
    '.ag-head{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--cream-dark);background:var(--cream);}',
    '.ag-head img{height:24px;width:auto;flex-shrink:0;}',
    '.ag-head-text{flex:1;min-width:0;}',
    '.ag-head-title{font-size:15px;font-weight:700;color:var(--ink);}',
    '.ag-head-sub{font-size:12.5px;color:var(--ink-muted);line-height:1.45;}',
    '.ag-x{flex-shrink:0;width:36px;height:36px;border-radius:9px;border:1px solid var(--cream-dark);background:#fff;color:var(--ink);font-size:20px;line-height:1;cursor:pointer;}',
    '.ag-x:hover{border-color:var(--ink-muted);}',
    '.ag-body{position:relative;flex:1;min-height:0;background:#fff;}',
    '.ag-body iframe{display:block;width:100%;height:100%;border:0;background:#fff;}',
    '.ag-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;font-size:14.5px;color:var(--ink-muted);background:#fff;}',
    '.ag-msg[hidden]{display:none;}',
    '.ag-msg .ag-spin{width:26px;height:26px;border:3px solid var(--blue-light);border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite;}',
    '.ag-foot{display:flex;align-items:center;gap:12px;padding:14px 20px;border-top:1px solid var(--cream-dark);background:#fff;}',
    '.ag-foot .ag-foot-note{flex:1;font-size:12.5px;color:var(--ink-muted);line-height:1.45;}',
    '.ag-foot .btn-primary{width:auto;margin-top:0;padding:13px 20px;font-size:14.5px;}',
    '.ag-modal .btn-close{background:#fff;border:1px solid rgba(28,24,20,.16);border-radius:9px;padding:12px 16px;font-size:14px;font-weight:600;color:var(--ink-mid);cursor:pointer;}',
    '@keyframes spin{to{transform:rotate(360deg);}}',
    '@media (prefers-reduced-motion:reduce){.ag-msg .ag-spin{animation:none;}}',
    '@media (max-width:768px){',
    '  dialog.ag-modal{width:100vw;height:100dvh;border-radius:0;}',
    '  .ag-head{padding:12px 14px;}',
    '  .ag-head img{display:none;}',
    '  .ag-foot{flex-wrap:wrap;padding:12px 14px;}',
    '  .ag-foot .ag-foot-note{flex-basis:100%;}',
    '  .ag-foot .btn-primary{flex:1;}',
    '}',
  ].join('\n');

  var HTML =
    '<div class="ag-head">' +
      '<img src="/uploads/Treat%20Engine%20Logo%20.png" alt="Treat Engine">' +
      '<div class="ag-head-text">' +
        '<div class="ag-head-title" id="ag-modal-title">Master Services Agreement</div>' +
        '<div class="ag-head-sub">Preview for the services you picked. Your business details and signature are added after checkout.</div>' +
      '</div>' +
      '<button type="button" class="ag-x" id="ag-x" aria-label="Close preview">×</button>' +
    '</div>' +
    '<div class="ag-body">' +
      '<iframe id="ag-frame" title="Master Services Agreement preview" sandbox="allow-same-origin"></iframe>' +
      '<div class="ag-msg" id="ag-loading" role="status"><div class="ag-spin"></div>Loading the agreement…</div>' +
      '<div class="ag-msg" id="ag-error" hidden><span>We couldn’t load the agreement just now.</span>' +
        '<button type="button" class="btn-close" id="ag-retry">Try again</button></div>' +
    '</div>' +
    '<div class="ag-foot">' +
      '<span class="ag-foot-note">You’ll review and sign this right after payment.</span>' +
      '<button type="button" class="btn-close" id="ag-close">Close</button>' +
      '<button type="button" class="btn-primary" id="ag-continue"><span class="btn-text">Continue to checkout</span><div class="spinner"></div></button>' +
    '</div>';

  var cfg = null;
  var modal = null;
  var cache = {};
  var ctaText = 'Continue to checkout';

  function $(id) { return document.getElementById(id); }

  async function load() {
    var addons = cfg.getAddons();
    var key = addons.join(',');
    $('ag-error').hidden = true;
    if (cache[key]) { $('ag-frame').srcdoc = cache[key]; $('ag-loading').hidden = true; return; }
    $('ag-loading').hidden = false;
    try {
      var res = await fetch(AGREEMENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sample', plan: cfg.plan, addons: addons }),
      });
      var data = await res.json();
      if (!res.ok || !data.agreement_html) throw new Error(data.error || 'Failed');
      cache[key] = data.agreement_html;
      $('ag-frame').srcdoc = data.agreement_html;
    } catch (err) {
      $('ag-error').hidden = false;
    } finally {
      $('ag-loading').hidden = true;
    }
  }

  function open() {
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    load();
  }

  function close() {
    if (typeof modal.close === 'function') modal.close();
    else { modal.removeAttribute('open'); onClosed(); }
  }

  function onClosed() {
    document.body.style.overflow = '';
    var link = $('ag-open');
    if (link) link.focus();
  }

  function init(options) {
    cfg = options;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    modal = document.createElement('dialog');
    modal.className = 'ag-modal';
    modal.id = 'ag-modal';
    modal.setAttribute('aria-labelledby', 'ag-modal-title');
    modal.innerHTML = HTML;
    document.body.appendChild(modal);
    $('ag-continue').querySelector('.btn-text').textContent = ctaText;

    modal.addEventListener('close', onClosed);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    $('ag-open').addEventListener('click', open);
    $('ag-x').addEventListener('click', close);
    $('ag-close').addEventListener('click', close);
    $('ag-retry').addEventListener('click', load);
    $('ag-continue').addEventListener('click', function () {
      var b = $('ag-continue');
      b.classList.add('loading'); b.disabled = true;
      Promise.resolve(cfg.onContinue()).finally(function () { b.classList.remove('loading'); b.disabled = false; });
    });
  }

  function setCta(text) {
    ctaText = text;
    var el = document.querySelector('#ag-continue .btn-text');
    if (el) el.textContent = text;
  }

  window.AgreementPreview = { init: init, setCta: setCta };
})();
