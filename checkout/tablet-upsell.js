/**
 * ClearDeals field-tablet upsell — shown when a dealer starts a subscription.
 *
 * Framework-agnostic on purpose: /sales/checkout-v2 is plain HTML while /sales
 * and /sales-v2 render their buy boxes in React, and all three start checkout
 * with the same POST to /api/checkout. Keeping this imperative means one modal
 * instead of three, and the React pages can call it straight out of their
 * click handlers.
 *
 * Usage:
 *   TabletUpsell.open({
 *     trial: true,                       // monthly plans only — changes the
 *                                        // "charged today" line, see below
 *     onContinue: (qty) => goToStripe(qty),
 *   });
 *
 * onContinue fires with 0 when the dealer declines. Dismissing the modal
 * (Esc, the X, or the backdrop) cancels instead — it does NOT fall through to
 * checkout, so a stray click can't launch a Stripe redirect nobody asked for.
 */
(function () {
  'use strict';

  // ── The one place to change stock ──
  // Units we can ship next-day. /api/checkout requires this file and enforces
  // the same number server-side, so editing it here updates the "Only N left"
  // copy, the stepper ceiling and the order cap together. It does NOT count
  // down as orders come in — lower it by hand and redeploy as units sell.
  var STOCK = 14;
  // Display only. The amount actually charged is whatever the Stripe price
  // behind STRIPE_PRICE_TABLET_BUNDLE says — change one, change the other.
  var PRICE = 299;

  var mounted = false;
  var els = {};
  var state = { qty: 1, trial: true, onContinue: null, lastFocus: null };

  var money = function (n) { return '$' + n.toLocaleString('en-US'); };

  var CSS = [
    '.tu-backdrop{position:fixed;inset:0;z-index:9000;background:rgba(28,24,20,.52);backdrop-filter:blur(3px);',
      'display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .2s;overflow-y:auto;}',
    '.tu-backdrop.tu-open{opacity:1;}',
    // display:flex above beats the browser's own [hidden] rule, which would
    // leave a closed modal as an invisible overlay eating every tap on the page.
    '.tu-backdrop[hidden]{display:none;}',
    '.tu-modal{position:relative;width:100%;max-width:840px;background:#faf7f2;border-radius:20px;overflow:hidden;',
      'box-shadow:0 30px 80px rgba(28,24,20,.30);transform:translateY(14px) scale(.985);transition:transform .22s;',
      'font-family:"DM Sans",system-ui,sans-serif;color:#1c1814;margin:auto;}',
    '.tu-backdrop.tu-open .tu-modal{transform:none;}',
    '.tu-grid{display:grid;grid-template-columns:1fr 1fr;}',
    '.tu-art{background:linear-gradient(160deg,#1a2744 0%,#24365c 100%);padding:34px 32px;display:flex;flex-direction:column;justify-content:center;gap:18px;}',
    '.tu-art-img{width:100%;max-height:250px;object-fit:contain;filter:drop-shadow(0 18px 34px rgba(0,0,0,.42));}',
    '.tu-specs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;}',
    '.tu-specs li{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.5;color:rgba(255,255,255,.76);}',
    '.tu-specs svg{flex-shrink:0;margin-top:3px;}',
    '.tu-body{padding:34px 32px;display:flex;flex-direction:column;}',
    '.tu-tag{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;background:rgba(59,130,246,.10);color:#1d4ed8;',
      'font-size:10.5px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;padding:6px 12px;border-radius:20px;margin-bottom:15px;}',
    '.tu-title{font-family:"Playfair Display",Georgia,serif;font-size:27px;font-weight:600;line-height:1.16;letter-spacing:-.018em;margin-bottom:10px;}',
    '.tu-sub{font-size:14px;line-height:1.66;color:#7a6f65;margin-bottom:18px;}',
    '.tu-sub strong{color:#1c1814;font-weight:600;}',
    '.tu-stock{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:#b45309;background:#fffbeb;',
      'border:1px solid rgba(180,83,9,.16);border-radius:9px;padding:9px 13px;margin-bottom:20px;}',
    '.tu-stock svg{flex-shrink:0;}',
    '.tu-qty-row{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid rgba(28,24,20,.10);padding-top:18px;}',
    '.tu-qty-label{font-size:13.5px;font-weight:600;}',
    '.tu-qty-note{font-size:11.5px;color:#7a6f65;margin-top:2px;}',
    '.tu-stepper{display:flex;align-items:center;gap:2px;background:#f0ebe0;border:1px solid rgba(28,24,20,.06);border-radius:10px;padding:4px;}',
    '.tu-step{width:34px;height:34px;border:none;background:transparent;border-radius:7px;cursor:pointer;font-size:19px;line-height:1;',
      'color:#1a2744;font-family:inherit;transition:background .15s;}',
    '.tu-step:hover:not(:disabled){background:#fffefb;}',
    '.tu-step:disabled{opacity:.3;cursor:not-allowed;}',
    '.tu-count{min-width:38px;text-align:center;font-size:16px;font-weight:600;font-variant-numeric:tabular-nums;}',
    '.tu-total{display:flex;align-items:baseline;justify-content:space-between;margin-top:16px;padding:14px 16px;background:#fffefb;',
      'border:1px solid rgba(28,24,20,.10);border-radius:11px;}',
    '.tu-total-label{font-size:13px;color:#7a6f65;}',
    '.tu-total-amt{font-family:"Playfair Display",Georgia,serif;font-size:26px;font-weight:600;color:#1a2744;letter-spacing:-.02em;}',
    '.tu-fine{font-size:11.5px;line-height:1.6;color:#7a6f65;margin-top:11px;}',
    '.tu-actions{display:flex;flex-direction:column;gap:9px;margin-top:20px;}',
    '.tu-btn{width:100%;border-radius:9px;padding:15px 20px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .18s;}',
    '.tu-btn.tu-solid{background:#3b82f6;color:#fff;border:1.5px solid #3b82f6;}',
    '.tu-btn.tu-solid:hover{background:#1d4ed8;border-color:#1d4ed8;}',
    '.tu-btn.tu-ghost{background:transparent;color:#7a6f65;border:none;font-size:13.5px;font-weight:500;padding:6px;text-decoration:underline;text-underline-offset:3px;}',
    '.tu-btn.tu-ghost:hover{color:#1c1814;}',
    // z-index: the product shot's drop-shadow filter gives it its own layer,
    // and on mobile, where the panels stack, that layer sits over the X and
    // swallows the tap.
    '.tu-close{position:absolute;z-index:2;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;',
      'background:rgba(250,247,242,.92);color:#3d3530;font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .15s;}',
    '.tu-close:hover{background:#fff;}',
    '.tu-specs-m{display:none;}',
    // Mobile has to fit on one screen with Safari's toolbars showing, so it
    // drops what is repeated elsewhere: the spec list becomes one line, the tag
    // repeats the stock banner, and the total box repeats the button. dvh
    // tracks the toolbars; the vh line is for browsers without it. The scroll
    // is only a fallback for very short screens.
    '@media(max-width:780px){',
      '.tu-backdrop{padding:12px;align-items:center;}',
      '.tu-modal{max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overflow-y:auto;border-radius:16px;}',
      '.tu-grid{grid-template-columns:1fr;}',
      // overflow: keeps the photo's drop-shadow from smudging the panel below.
      '.tu-art{padding:14px 20px 8px;overflow:hidden;}',
      '.tu-art-img{max-height:110px;}',
      '.tu-specs,.tu-tag,.tu-total{display:none;}',
      '.tu-body{padding:14px 20px 14px;}',
      '.tu-title{font-size:21px;margin-bottom:6px;}',
      '.tu-sub{font-size:13px;line-height:1.55;margin-bottom:6px;}',
      '.tu-specs-m{display:block;font-size:11.5px;line-height:1.5;color:#7a6f65;margin-bottom:12px;}',
      '.tu-stock{padding:8px 11px;margin-bottom:12px;font-size:12px;}',
      '.tu-qty-row{padding-top:12px;}',
      '.tu-step{width:32px;height:32px;}',
      '.tu-fine{margin-top:10px;font-size:11px;line-height:1.5;}',
      '.tu-actions{margin-top:12px;gap:2px;}',
      '.tu-btn.tu-solid{padding:13px 16px;}',
    '}',
    // iPhone SE-height screens: the photo is the one thing that can go.
    '@media(max-width:780px) and (max-height:620px){',
      '.tu-art{display:none;}',
      '.tu-title{padding-right:36px;}',
      '.tu-close{top:10px;right:10px;background:#f0ebe0;}',
    '}'
  ].join('');

  var CHECK = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6.5 4.8,9.3 10,3.4"/></svg>';

  var SPECS = [
    '11" 2.5K display at 90&nbsp;Hz — readable on a customer’s kitchen table',
    'MediaTek Dimensity 6300 · 4&nbsp;GB RAM · 128&nbsp;GB storage',
    'Android 15 with Dolby Atmos speakers',
    'Magnetic folio keyboard case — snaps on, no pairing, no charging'
  ];

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var backdrop = document.createElement('div');
    backdrop.className = 'tu-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'tu-title');
    backdrop.hidden = true;

    backdrop.innerHTML = [
      '<div class="tu-modal">',
        '<button class="tu-close" type="button" aria-label="Close">&times;</button>',
        '<div class="tu-grid">',
          '<div class="tu-art">',
            // Drop the product shot at /images/lenovo-idea-tab-keyboard.png. The
            // handler below hides the <img> if it is missing so the panel still
            // reads as a spec list rather than a broken-image icon.
            '<img class="tu-art-img" src="/images/lenovo-idea-tab-keyboard.png" alt="Lenovo Idea Tab 11-inch tablet with the folio keyboard case attached">',
            '<ul class="tu-specs">',
              SPECS.map(function (s) { return '<li>' + CHECK + '<span>' + s + '</span></li>'; }).join(''),
            '</ul>',
          '</div>',
          '<div class="tu-body">',
            '<span class="tu-tag">Add-on · Ships next day</span>',
            '<h2 class="tu-title" id="tu-title">Put ClearDeals in your reps’ hands</h2>',
            '<p class="tu-sub">The <strong>Lenovo Idea Tab 11"</strong> with the attachable keyboard case — the same setup our dealers run proposals on in the home. <strong>' + money(PRICE) + '</strong> each, one time.</p>',
            '<p class="tu-specs-m">11" 2.5K display · 4 GB / 128 GB · Android 15 · magnetic keyboard case</p>',
            '<div class="tu-stock">',
              '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 1.8 12.6 11.7H1.4Z"/><path d="M7 5.8v2.4"/><circle cx="7" cy="10" r=".55" fill="currentColor" stroke="none"/></svg>',
              '<span id="tu-stock-text"></span>',
            '</div>',
            '<div class="tu-qty-row">',
              '<div>',
                '<div class="tu-qty-label">How many tablets?</div>',
                '<div class="tu-qty-note">One per rep in the field</div>',
              '</div>',
              '<div class="tu-stepper">',
                '<button class="tu-step" type="button" id="tu-minus" aria-label="Remove one tablet">&minus;</button>',
                '<span class="tu-count" id="tu-count" aria-live="polite">1</span>',
                '<button class="tu-step" type="button" id="tu-plus" aria-label="Add one tablet">+</button>',
              '</div>',
            '</div>',
            '<div class="tu-total">',
              '<span class="tu-total-label" id="tu-total-label">Hardware total</span>',
              '<span class="tu-total-amt" id="tu-total-amt"></span>',
            '</div>',
            '<p class="tu-fine" id="tu-fine"></p>',
            '<div class="tu-actions">',
              '<button class="tu-btn tu-solid" type="button" id="tu-add"></button>',
              '<button class="tu-btn tu-ghost" type="button" id="tu-skip">No thanks — continue without tablets</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(backdrop);

    els = {
      backdrop: backdrop,
      modal: backdrop.querySelector('.tu-modal'),
      img: backdrop.querySelector('.tu-art-img'),
      stock: backdrop.querySelector('#tu-stock-text'),
      count: backdrop.querySelector('#tu-count'),
      minus: backdrop.querySelector('#tu-minus'),
      plus: backdrop.querySelector('#tu-plus'),
      totalLabel: backdrop.querySelector('#tu-total-label'),
      totalAmt: backdrop.querySelector('#tu-total-amt'),
      fine: backdrop.querySelector('#tu-fine'),
      add: backdrop.querySelector('#tu-add'),
      skip: backdrop.querySelector('#tu-skip'),
      close: backdrop.querySelector('.tu-close'),
    };

    els.img.addEventListener('error', function () { els.img.style.display = 'none'; });
    els.minus.addEventListener('click', function () { setQty(state.qty - 1); });
    els.plus.addEventListener('click', function () { setQty(state.qty + 1); });
    els.add.addEventListener('click', function () { finish(state.qty); });
    els.skip.addEventListener('click', function () { finish(0); });
    els.close.addEventListener('click', dismiss);
    backdrop.addEventListener('mousedown', function (e) { if (e.target === backdrop) dismiss(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !backdrop.hidden) dismiss();
    });

    mounted = true;
  }

  function setQty(n) {
    state.qty = Math.min(STOCK, Math.max(1, n));
    render();
  }

  function render() {
    var qty = state.qty;
    var total = qty * PRICE;

    els.stock.textContent = 'Only ' + STOCK + ' left for next-day shipping';
    els.count.textContent = String(qty);
    els.minus.disabled = qty <= 1;
    els.plus.disabled = qty >= STOCK;

    els.totalLabel.textContent = qty === 1
      ? '1 tablet + keyboard'
      : qty + ' tablets + keyboards (' + money(PRICE) + ' each)';
    els.totalAmt.textContent = money(total);

    // The hardware is a one-time line item on a subscription Checkout Session,
    // so Stripe invoices it the moment checkout completes — the 30-day trial
    // only ever delays the ClearDeals subscription itself. Say so plainly here;
    // a dealer who read "$0 due today" on the plan card and then got a $299
    // charge would have a fair complaint.
    els.fine.textContent = state.trial
      ? 'Charged today and shipped next business day. Your 30-day ClearDeals trial is unaffected — the subscription still starts at $0.'
      : 'Charged today alongside your subscription and shipped next business day.';

    els.add.textContent = 'Add ' + (qty === 1 ? '1 tablet' : qty + ' tablets') + ' — ' + money(total);
  }

  function open(opts) {
    opts = opts || {};
    if (!mounted) build();

    state.trial = opts.trial !== false;
    state.onContinue = typeof opts.onContinue === 'function' ? opts.onContinue : null;
    state.onDismiss = typeof opts.onDismiss === 'function' ? opts.onDismiss : null;
    state.lastFocus = document.activeElement;
    state.qty = 1;

    render();
    els.backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    // Force a layout pass so the fade-in still runs, without waiting on a frame.
    void els.backdrop.offsetWidth;
    els.backdrop.classList.add('tu-open');
    els.add.focus();
  }

  function close() {
    els.backdrop.classList.remove('tu-open');
    els.backdrop.hidden = true;
    document.body.style.overflow = '';
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  // Backing out of the modal leaves the dealer on the page with the plan
  // buttons live again — it is not a silent "continue with zero".
  function dismiss() {
    var cb = state.onDismiss;
    state.onContinue = null;
    state.onDismiss = null;
    close();
    if (cb) cb();
  }

  function finish(qty) {
    var cb = state.onContinue;
    state.onContinue = null;
    state.onDismiss = null;
    close();
    if (cb) cb(qty);
  }

  var api = { open: open, STOCK: STOCK, PRICE: PRICE };

  // Nothing above touches the DOM until open() is called, so /api/checkout can
  // require this file in Node just to read STOCK.
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.TabletUpsell = api;
})();
