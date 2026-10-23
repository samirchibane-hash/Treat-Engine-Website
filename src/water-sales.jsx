
const {useState, useEffect} = React;


// Every CTA label on this page must stay UNIQUE. Clarity aggregates clicks by
// the text inside the element, so two buttons sharing a label are reported as
// one number and cannot be told apart. Seven identical "Start Now" buttons is
// why we previously had no idea which section was actually driving pricing
// clicks. Keep these distinct (and distinct within the first ~25 characters,
// since Clarity truncates and masks digits) whenever you add or reword one.
const CTA = {
  nav:          'Start free trial',
  navLogin:     'Log in',
  hero:         'Start my 30-day free trial',
  heroWatch:    'Watch the 2-min walkthrough',
  features:     'Start My Free Trial',
  comparison:   'Claim my 30-day free trial',
  steps:        'Start my free trial today',
  integrations: 'Talk to us about setup',
  faqDemo:      'Book a 30-min demo',
  final:        'Get my free 30 days',
};

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, {threshold: 0.08});
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}






// The problem section and the motions section were saying the same thing twice.
// Fused: one header carries the stakes, two cards carry the only two ways the
// proposal ever reaches a homeowner.

/* ─────────────────────────── WHAT'S INSIDE ───────────────────────────
 * Capsules up top, then two columns: the value prop's copy on the left and a
 * native animation of the real product on the right. Each animation is four
 * beats, and each beat is one bullet on the left, so the bullet lights up as
 * its beat plays and clicking a bullet jumps to it.
 *
 * Congruence rules (same as the ClearDeals campaign pipeline):
 *  - Every surface shaped like the app is rebuilt from the real component with
 *    VERBATIM copy. The source file is named above each piece.
 *  - Money is Commers Water's real catalog: products.price_cents, their
 *    Commers Customer Care Plan rates, and their financing partner (US Bank
 *    Avvance, 9.99% APR / 60 months) run through the app's own
 *    amortizedMonthlyPayment.
 *  - Ad furniture (product photos, the cursor, the phone bezel) only ever sits
 *    on the canvas, never inside something shaped like the app.
 */

const Lu = window.LucideReact || {};
function Ic({n, size = 16, color, sw = 2, style}) {
  const C = Lu[n];
  return C ? <C size={size} color={color} strokeWidth={sw} style={style} aria-hidden="true"/> : null;
}

/* ClearDeals app tokens: treatprezi/src/index.css :root (mirrored in campaigns/src/brand.ts). */
const APP = {
  bg: 'hsl(40, 25%, 93%)',
  fg: 'hsl(216, 50%, 12%)',
  card: '#fff',
  primary: 'hsl(213, 93%, 28%)',
  primary5: 'hsla(213, 93%, 28%, 0.05)',
  primary10: 'hsla(213, 93%, 28%, 0.10)',
  primary20: 'hsla(213, 93%, 28%, 0.20)',
  secondary: 'hsl(35, 20%, 88%)',
  muted: 'hsl(220, 15%, 94%)',
  mutedFg: 'hsl(216, 15%, 50%)',
  border: 'hsl(220, 15%, 88%)',
  border60: 'hsla(220, 15%, 88%, 0.6)',
  destructive: 'hsl(0, 75%, 55%)',
  emerald: '#10b981',
  emerald700: '#047857',
  emerald100: '#d1fae5',
  amber: '#f59e0b',
  amber700: '#b45309',
  amber100: '#fef3c7',
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green200: '#bbf7d0',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  waterButton: 'linear-gradient(to right, hsl(205, 85%, 45%), hsl(180, 65%, 45%))',
  surface: 'linear-gradient(180deg, hsl(213, 60%, 97%) 0%, #fff 100%)',
  soft: '0 4px 20px hsla(205, 30%, 20%, 0.08)',
  md: '0 4px 12px hsla(216, 30%, 15%, 0.10)',
  lg: '0 8px 30px hsla(216, 30%, 15%, 0.12)',
  font: "'Inter', system-ui, sans-serif",
};

/* Commers Water — confirmed lineup, every item over the $1,500 retail floor. */
const WI_P = {
  wwhs:   {name: 'Whole House System WWHS', category: 'Softeners', retail: 5799, img: 'uploads/whats-inside/wwhs.webp', ar: 420 / 740, care: 15.99},
  croPro: {name: 'CRO PRO 20 R0', category: 'Reverse Osmosis', retail: 2999, img: 'uploads/whats-inside/cropro20.webp', ar: 541 / 783, care: 26.99},
  vortex: {name: 'The Vortex', category: 'Softeners', retail: 4399, img: 'uploads/whats-inside/vortex.webp', ar: 420 / 859},
  evolve: {name: 'Evolve Series Well Water Conditioner', category: 'Filters', retail: 4899, img: 'uploads/whats-inside/evolve.webp', ar: 420 / 813},
};
const WI_FIN = {partner: 'US Bank Avvance', apr: 9.99, months: 60};
const WI_CUSTOMER = 'Sarah Mitchell';
const WI_RED_LINE = 4600;

/* src/lib/utils.ts → amortizedMonthlyPayment */
function amortized(principal, apr, months) {
  const r = apr / 100 / 12;
  if (r <= 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}
const monthly = (dollars) => amortized(dollars, WI_FIN.apr, WI_FIN.months);
const usd0 = (n) => '$' + Math.round(n).toLocaleString('en-US');
const usd2 = (n) => '$' + n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

/* ── motion ─────────────────────────────────────────────────────────── */
const BEAT = 4200;                       // ms per beat
const BEATS = 4;
const LOOP = BEAT * BEATS;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const prog = (t, at, dur) => clamp01((t - at) / dur);
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const back = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const lerp = (a, b, p) => a + (b - a) * p;
/** Fade + lift in, starting at `at` ms. */
const rise = (t, at = 0, dist = 16, dur = 520) => {
  const p = easeOut(prog(t, at, dur));
  return {opacity: p, transform: `translateY(${(1 - p) * dist}px)`};
};
/** Overshoot scale 0 → 1 (badges, checks). */
const pop = (t, at, dur = 420) => { const p = prog(t, at, dur); return p <= 0 ? 0 : back(p); };
/** Characters typed so far. */
const typed = (s, t, at, per = 85) => s.slice(0, Math.max(0, Math.floor((t - at) / per)));
/** Small horizontal shake used on a rejected field. */
const shake = (t, at, dur = 420) => { const p = prog(t, at, dur); return p > 0 && p < 1 ? Math.sin(p * Math.PI * 6) * 9 * (1 - p) : 0; };

/* ── canvas furniture ───────────────────────────────────────────────── */

/** True inside a cropped card scene: beats skip the equipment photo and audience pill. */
const WiMobile = React.createContext(false);

/** Audience tag — the app's own bg-primary/10 text-primary tint. */
function AudiencePill({label, side}) {
  if (React.useContext(WiMobile)) return null;
  return (
    <div data-wi="pill" style={{position: 'absolute', top: 30, [side]: 34, padding: '10px 20px', borderRadius: 999,
      background: APP.primary10, color: APP.primary, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>
      {label}
    </div>
  );
}

/** The client's own system photo, near full canvas height, bleeding off one edge. */
function ProductBleed({p, side, t, height = 600, bottom = -70, inset = -34}) {
  if (React.useContext(WiMobile)) return null;
  const s = lerp(1, 1.035, t / BEAT);
  return (
    <img loading="lazy" data-wi="product" src={p.img} alt="" draggable="false"
      style={{position: 'absolute', bottom, [side]: inset, height, width: 'auto', transformOrigin: `${side} bottom`,
        transform: `scale(${s})`, filter: 'drop-shadow(0 24px 40px rgba(20,30,50,.18))', pointerEvents: 'none'}}/>
  );
}

function Cursor({x, y, down}) {
  return (
    <svg data-wi="cursor" width="30" height="30" viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, transform: `scale(${down ? 0.86 : 1})`,
      transformOrigin: '4px 3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.25))', pointerEvents: 'none', zIndex: 5}}>
      <path d="M4 3l15 8.2-6.6 1.5L9.3 19z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}

/** Where the pointer is between two points, with a press window. */
function pointer(t, from, to, moveAt, moveDur, pressAt) {
  const p = easeInOut(prog(t, moveAt, moveDur));
  return {x: lerp(from[0], to[0], p), y: lerp(from[1], to[1], p), down: t >= pressAt && t < pressAt + 180, pressed: t >= pressAt};
}

/** A plain phone bezel — the customer's side of the link. Furniture, not app UI. */
function Phone({children, s = 1.45, scroll = 0}) {
  return (
    <div style={{transform: `scale(${s})`, transformOrigin: 'top left'}}>
      <div style={{width: 336, height: 680, borderRadius: 48, background: '#0f172a', padding: 12, boxShadow: '0 30px 60px rgba(15,23,42,.28)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 37, background: APP.bg, overflow: 'hidden', position: 'relative'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 46, background: APP.bg, zIndex: 1}}/>
          <div style={{position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 92, height: 26, borderRadius: 20, background: '#0f172a', zIndex: 2}}/>
          <div style={{padding: '52px 18px 18px', transform: `translateY(${-scroll}px)`}}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Scales a real-px app surface on an inner element (the outer one carries rise()). */
const Scaled = ({s, origin = 'top left', children, width}) => (
  <div style={{transform: `scale(${s})`, transformOrigin: origin, width}}>{children}</div>
);

const cardBase = {background: APP.card, borderRadius: 12, boxShadow: APP.soft};

/* ═════════════════════ 1 · QUICK ONBOARDING ═════════════════════
 * Rebuilt from src/components/dashboard/launchpad/LaunchpadPanel.tsx +
 * LaunchpadStepCard.tsx. Titles, metas, state pills and hero lines are verbatim.
 */
const LP_STEPS = [
  {icon: 'ShoppingCart', title: 'Build your product catalog',
    todo: "Your systems and pricing — the wizard can't recommend anything without them", done: '4 active products'},
  {icon: 'Wrench', title: 'Create a maintenance plan',
    todo: 'Recurring service billed monthly through Stripe', done: '1 active plan'},
  {icon: 'MonitorPlay', title: 'Set up your presentation',
    todo: 'Use the ClearDeals deck, or send us yours to build', review: 'We’re getting your deck live', done: 'ClearDeals presentation — live'},
  {icon: 'FileSignature', title: 'Set up your agreement',
    todo: 'Use the ClearDeals contract, or send us yours to code in', done: 'ClearDeals agreement — live'},
  {icon: 'CreditCard', title: 'Connect Stripe',
    todo: 'Take deposits and invoice from inside ClearDeals', done: 'Connected and ready to take payments'},
  {icon: 'Landmark', title: 'Connect your financing partners',
    todo: "Add each lender's application link so reps can apply on the spot", done: '1 partner ready to apply with'},
];
const LP_STATE = {
  complete: {label: 'Complete', bg: 'rgba(16,185,129,.10)', fg: APP.emerald700, bd: 'rgba(16,185,129,.25)'},
  in_review: {label: 'In progress', bg: 'rgba(245,158,11,.10)', fg: APP.amber700, bd: 'rgba(245,158,11,.25)'},
  todo: {label: 'Not started', bg: APP.primary5, fg: APP.primary, bd: APP.primary20},
};

function LpMarker({state, index, s = 1}) {
  const base = {width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: `scale(${s})`};
  if (state === 'complete') return <span style={{...base, background: APP.emerald, color: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.08)'}}><Ic n="Check" size={16} sw={3}/></span>;
  if (state === 'in_review') return <span style={{...base, background: 'rgba(245,158,11,.15)', color: '#d97706', border: '1px solid rgba(245,158,11,.3)'}}><Ic n="Clock" size={16}/></span>;
  return <span style={{...base, background: APP.card, color: APP.primary, border: `2px solid ${APP.primary20}`, fontSize: 13, fontWeight: 700}}>{index}</span>;
}

function LpStepCard({i, state, markerPop = 1}) {
  const step = LP_STEPS[i];
  const done = state === 'complete';
  const meta = state === 'complete' ? step.done : state === 'in_review' ? step.review : step.todo;
  const pill = LP_STATE[state];
  return (
    <div style={{borderRadius: 16, border: `1px solid ${APP.border60}`, background: APP.card, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px'}}>
      <LpMarker state={state} index={i + 1} s={state === 'todo' ? 1 : markerPop}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <Ic n={step.icon} size={16} color={done ? APP.mutedFg : APP.primary}/>
          <div style={{fontSize: 14, fontWeight: 600, color: done ? APP.mutedFg : APP.fg, whiteSpace: 'nowrap'}}>{step.title}</div>
        </div>
        <div style={{fontSize: 13, color: APP.mutedFg, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{meta}</div>
      </div>
      <span style={{flexShrink: 0, height: 24, padding: '0 10px', borderRadius: 999, border: `1px solid ${pill.bd}`, background: pill.bg, color: pill.fg,
        fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center'}}>{pill.label}</span>
      <Ic n="ChevronDown" size={16} color={APP.mutedFg}/>
    </div>
  );
}

function LpHero({settled, total = 6}) {
  const complete = settled >= total;
  const remaining = total - settled;
  const pct = (settled / total) * 100;
  return (
    <div style={{borderRadius: 16, border: `1px solid ${complete ? 'rgba(16,185,129,.3)' : APP.primary20}`,
      background: complete ? 'rgba(16,185,129,.05)' : APP.surface, padding: 22, display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{flex: 1, minWidth: 0}}>
        {complete ? (
          <>
            <div style={{fontSize: 15, fontWeight: 700, color: APP.fg, display: 'flex', alignItems: 'center', gap: 8}}>
              <Ic n="PartyPopper" size={16} color="#059669"/>You’re ready to sell
            </div>
            <div style={{fontSize: 13, color: APP.mutedFg, marginTop: 4}}>Every setup step is done. Start a proposal and walk a customer through it end to end.</div>
          </>
        ) : (
          <>
            <div style={{fontSize: 15, fontWeight: 700, color: APP.fg}}>{remaining} step{remaining === 1 ? '' : 's'} left before your first proposal</div>
            <div style={{fontSize: 13, color: APP.mutedFg, marginTop: 4}}>Work top to bottom — your catalog and plans are what everything else builds on.</div>
          </>
        )}
        <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{height: 8, flex: 1, borderRadius: 999, background: APP.muted, overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${pct}%`, borderRadius: 999, background: complete ? APP.emerald : APP.primary}}/>
          </div>
          <span style={{fontSize: 12.5, fontWeight: 600, color: APP.mutedFg, fontVariantNumeric: 'tabular-nums'}}>{Math.round(settled)}/{total}</span>
        </div>
      </div>
      <div style={{height: 40, padding: '0 16px', borderRadius: 12, background: APP.primary, color: '#fff', fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0}}>
        {complete ? <>New Proposal <Ic n="ArrowRight" size={14}/></> : <><Ic n="CalendarDays" size={14}/>Book an Onboarding Call</>}
      </div>
    </div>
  );
}

/** Settled count that ticks up at the given moments. */
const settledAt = (t, base, ticks) => base + ticks.filter((at) => t >= at).length;

function OnboardingBeat({beat, t}) {
  const W = 500, S = 1.42;
  if (beat === 0) {
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="right" t={t}/>
        <AudiencePill label="Owners" side="left"/>
        <div style={{position: 'absolute', left: 40, top: 92}}>
          <Scaled s={S} width={W}>
            <div style={rise(t, 80)}>
              <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color: APP.primary, display: 'flex', alignItems: 'center', gap: 8}}>
                <Ic n="Rocket" size={24}/>Launchpad
              </div>
              <div style={{fontSize: 14, color: APP.mutedFg, marginTop: 2}}>Six steps to a proposal wizard your reps can close deals with.</div>
            </div>
            <div style={{...rise(t, 300), marginTop: 22}}><LpHero settled={0}/></div>
            <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12}}>
              {[0, 1].map((i) => <div key={i} style={rise(t, 700 + i * 260)}><LpStepCard i={i} state="todo"/></div>)}
            </div>
          </Scaled>
        </div>
      </>
    );
  }
  if (beat === 1) {
    // Catalog + maintenance plan. The four photos are furniture on the canvas, counting the
    // catalog up to "4 active products" the way the meta line does.
    const photos = [WI_P.wwhs, WI_P.evolve, WI_P.vortex, WI_P.croPro];
    const catDone = t >= 2000, planDone = t >= 2900;
    return (
      <>
        <ProductBleed p={WI_P.croPro} side="left" t={t} height={520} inset={-60}/>
        <AudiencePill label="Owners" side="right"/>
        <div style={{position: 'absolute', right: 40, top: 96, display: 'flex', gap: 14}}>
          {photos.map((p, i) => {
            const s = pop(t, 350 + i * 300);
            return (
              <div key={p.name} style={{width: 92, height: 112, borderRadius: 14, background: '#fff', boxShadow: APP.md,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, opacity: Math.min(1, s)}}>
                <img loading="lazy" src={p.img} alt="" style={{maxHeight: 96, maxWidth: 80}}/>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', right: 40, top: 236}}>
          <Scaled s={S} origin="top right" width={W}>
            <LpHero settled={settledAt(t, 0, [2000, 2900])}/>
            <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12}}>
              <LpStepCard i={0} state={catDone ? 'complete' : 'todo'} markerPop={pop(t, 2000)}/>
              <LpStepCard i={1} state={planDone ? 'complete' : 'todo'} markerPop={pop(t, 2900)}/>
            </div>
          </Scaled>
        </div>
      </>
    );
  }
  if (beat === 2) {
    const deckDone = t >= 1300, agreementDone = t >= 2300;
    return (
      <>
        <ProductBleed p={WI_P.vortex} side="right" t={t}/>
        <AudiencePill label="Owners" side="left"/>
        <div style={{position: 'absolute', left: 40, top: 150}}>
          <Scaled s={S} width={W}>
            <LpHero settled={settledAt(t, 2, [1300, 2300])}/>
            <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12}}>
              <LpStepCard i={2} state={deckDone ? 'complete' : 'todo'} markerPop={pop(t, 1300)}/>
              <LpStepCard i={3} state={agreementDone ? 'complete' : 'todo'} markerPop={pop(t, 2300)}/>
            </div>
          </Scaled>
        </div>
      </>
    );
  }
  const stripe = t >= 1300, fin = t >= 2300;
  return (
    <>
      <ProductBleed p={WI_P.evolve} side="left" t={t} height={560} inset={-80}/>
      <AudiencePill label="Owners" side="right"/>
      <div style={{position: 'absolute', right: 40, top: 96}}>
        <Scaled s={S} origin="top right" width={W}>
          <div style={{transform: `scale(${t >= 2300 ? lerp(0.97, 1, pop(t, 2300)) : 1})`, transformOrigin: 'center'}}>
            <LpHero settled={settledAt(t, 4, [1300, 2300])}/>
          </div>
          <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12}}>
            <LpStepCard i={3} state="complete"/>
            <LpStepCard i={4} state={stripe ? 'complete' : 'todo'} markerPop={pop(t, 1300)}/>
            <LpStepCard i={5} state={fin ? 'complete' : 'todo'} markerPop={pop(t, 2300)}/>
          </div>
        </Scaled>
      </div>
    </>
  );
}

/* ═════════════════════ 2 · PRICING CONTROL ═════════════════════
 * RedLineEditorCard ← src/components/settings/ProductCatalogCard.tsx (Red Line card)
 * RepPriceCard / locked row ← src/components/settings/RepProductPricingCard.tsx
 * Error string ← src/lib/repPricing.ts → repPriceError()
 */
const RL_ERROR = `Can't be below the ${usd0(WI_RED_LINE)} red line.`;
const RL_NOTE = `Red line ${usd2(WI_RED_LINE)}. You can't price below this.`;

function Caret({h = 22, w = 2, on = true}) {
  return on ? <span style={{display: 'inline-block', width: w, height: h, background: APP.primary, marginLeft: 2}}/> : null;
}
const blink = (t) => Math.floor(t / 420) % 2 === 0;

function RedLineEditorCard({value, caret}) {
  return (
    <div style={{...cardBase, padding: 22, width: 470}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
        <Ic n="ArrowDownToLine" size={20} color={APP.primary} sw={2.2}/>
        <span style={{fontSize: 18, fontWeight: 600, color: APP.fg}}>Red Line</span>
        <span style={{fontSize: 13, color: APP.mutedFg}}>(optional)</span>
        <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: APP.mutedFg}}>
          <Ic n="EyeOff" size={13} color={APP.mutedFg}/>Admins &amp; managers only
        </span>
      </div>
      <div style={{fontSize: 13.5, color: APP.mutedFg, marginTop: 8, lineHeight: 1.4}}>
        The lowest retail price a rep can set for this product. Leave blank to keep a fixed price reps can't change.
      </div>
      <div style={{marginTop: 18, width: 250}}>
        <div style={{fontSize: 13, fontWeight: 500, color: APP.fg, marginBottom: 7}}>Red Line (USD)</div>
        <div style={{height: 42, borderRadius: 10, border: `1px solid ${caret ? APP.primary : APP.border}`, boxShadow: caret ? `0 0 0 3px ${APP.primary10}` : 'none',
          display: 'flex', alignItems: 'center', paddingLeft: 12, gap: 3}}>
          <span style={{fontSize: 16, color: APP.mutedFg}}>$</span>
          <span style={{fontSize: 16, fontWeight: 500, color: value ? APP.fg : APP.mutedFg, fontVariantNumeric: 'tabular-nums'}}>{value || 'None'}</span>
          <Caret h={18} on={caret}/>
        </div>
      </div>
    </div>
  );
}

function RepPriceCard({value, note, error, showSave, savePressed, badge = 0, caret, dx = 0}) {
  return (
    <div style={{width: 560, background: APP.card, borderRadius: 22, boxShadow: APP.lg, padding: '28px 30px 26px', position: 'relative', transform: `translateX(${dx}px)`}}>
      {badge > 0 && (
        <div style={{position: 'absolute', top: 24, right: 30, padding: '6px 16px', borderRadius: 999, background: APP.primary10, color: APP.primary,
          fontSize: 17, fontWeight: 600, transform: `scale(${badge})`}}>Your price</div>
      )}
      <div style={{fontSize: 21, color: APP.fg, fontWeight: 500, marginBottom: 12}}>Your retail price</div>
      <div style={{display: 'flex', gap: 12}}>
        <div style={{flex: 1, height: 66, borderRadius: 14, border: `${error ? 3 : 1}px solid ${error ? APP.destructive : APP.border}`,
          boxShadow: error ? '0 0 0 5px hsla(0, 75%, 55%, 0.14)' : 'none', display: 'flex', alignItems: 'center', paddingLeft: 20, gap: 6}}>
          <span style={{fontSize: 27, color: APP.mutedFg}}>$</span>
          <span style={{fontSize: 32, fontWeight: 600, color: APP.fg, fontVariantNumeric: 'tabular-nums'}}>{value}</span>
          <Caret h={34} w={3} on={caret}/>
        </div>
        {showSave && (
          <div style={{height: 66, padding: '0 28px', borderRadius: 14, background: APP.primary, color: '#fff', display: 'flex', alignItems: 'center',
            fontSize: 22, fontWeight: 600, transform: `scale(${savePressed ? 0.96 : 1})`}}>Save</div>
        )}
      </div>
      <div style={{marginTop: 14, fontSize: 19, lineHeight: 1.3, color: error ? APP.destructive : APP.mutedFg, fontWeight: error ? 700 : 400}}>{note}</div>
    </div>
  );
}

function LockedRow({p, wiggle = 0}) {
  return (
    <div style={{...cardBase, width: 560, padding: '20px 24px', display: 'flex', gap: 24, alignItems: 'flex-start'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0}}>
        <div style={{width: 64, height: 64, borderRadius: 10, border: `1px solid ${APP.border60}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <img loading="lazy" src={p.img} alt="" style={{maxHeight: 56, maxWidth: 56}}/>
        </div>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 17, fontWeight: 600, color: APP.fg}}>{p.name}</div>
          <div style={{fontSize: 14, color: APP.mutedFg, marginTop: 3}}>{p.category}</div>
        </div>
      </div>
      <div style={{width: 236, flexShrink: 0}}>
        <div style={{fontSize: 14, fontWeight: 500, color: APP.fg, marginBottom: 4}}>Retail price</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 7, height: 30, fontSize: 18, fontWeight: 600, color: APP.fg, fontVariantNumeric: 'tabular-nums'}}>
          {usd2(p.retail)}
          <span style={{display: 'inline-flex', transform: `rotate(${wiggle}deg)`}}><Ic n="Lock" size={15} color={APP.mutedFg}/></span>
        </div>
        <div style={{fontSize: 13.5, lineHeight: 1.3, color: APP.mutedFg, marginTop: 2}}>Fixed price. Your admin hasn't set a red line on this product.</div>
      </div>
    </div>
  );
}

function PricingBeat({beat, t}) {
  if (beat === 0) {
    const v = typed('4600', t, 1100, 170);
    const shown = v.length === 4 ? '4,600' : v;
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="right" t={t}/>
        <AudiencePill label="Owners & Managers" side="left"/>
        <div style={{position: 'absolute', left: 50, top: 108, width: 520, ...rise(t, 80)}}>
          <div style={{fontSize: 13, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: APP.mutedFg}}>{WI_P.wwhs.name}</div>
          <div style={{fontSize: 30, fontWeight: 700, color: APP.fg, letterSpacing: '-0.02em', marginTop: 4, fontVariantNumeric: 'tabular-nums'}}>{usd2(WI_P.wwhs.retail)} <span style={{fontSize: 16, fontWeight: 500, color: APP.mutedFg}}>retail</span></div>
        </div>
        <div style={{position: 'absolute', left: 36, top: 210, ...rise(t, 350)}}>
          <Scaled s={1.42} width={470}><RedLineEditorCard value={shown} caret={t > 700 && t < 3200 && blink(t)}/></Scaled>
        </div>
      </>
    );
  }
  if (beat === 1) {
    const v = typed('4200', t, 600, 170);
    const shown = v.length === 4 ? '4,200' : v;
    const rejected = t >= 1900;
    const pt = pointer(t, [560, 640], [760, 452], 1100, 600, 1760);
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="left" t={t} height={560} inset={-110}/>
        <AudiencePill label="Sales Reps" side="right"/>
        <div style={{position: 'absolute', right: 44, top: 108, width: 560, textAlign: 'right', ...rise(t, 60)}}>
          <div style={{fontSize: 13, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: APP.mutedFg}}>{WI_P.wwhs.name}</div>
        </div>
        <div style={{position: 'absolute', right: 44, top: 330, ...rise(t, 150)}}>
          <RepPriceCard value={shown} caret={!rejected && blink(t)} showSave={t >= 600} savePressed={pt.down}
            error={rejected} note={rejected ? RL_ERROR : RL_NOTE} dx={shake(t, 1900)}/>
        </div>
        {t < 2600 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
      </>
    );
  }
  if (beat === 2) {
    const v = typed('5299', t, 500, 170);
    const shown = v.length === 4 ? '5,299' : v;
    const saved = t >= 1900;
    const pt = pointer(t, [520, 640], [690, 350], 1000, 600, 1760);
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="right" t={t}/>
        <AudiencePill label="Sales Reps" side="left"/>
        <div style={{position: 'absolute', left: 44, top: 108, width: 560, ...rise(t, 60)}}>
          <div style={{fontSize: 13, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: APP.mutedFg}}>{WI_P.wwhs.name}</div>
        </div>
        <div style={{position: 'absolute', left: 44, top: 250, ...rise(t, 150)}}>
          <RepPriceCard value={shown} caret={!saved && blink(t)} showSave={!saved} savePressed={pt.down}
            note={RL_NOTE} badge={saved ? pop(t, 1900) : 0}/>
        </div>
        {t < 2500 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
      </>
    );
  }
  const pt = pointer(t, [300, 660], [800, 330], 700, 700, 1500);
  const wig = t >= 1500 && t < 2100 ? Math.sin(prog(t, 1500, 600) * Math.PI * 5) * 14 * (1 - prog(t, 1500, 600)) : 0;
  return (
    <>
      <ProductBleed p={WI_P.croPro} side="left" t={t} height={520} inset={-90}/>
      <AudiencePill label="Sales Reps" side="right"/>
      <div style={{position: 'absolute', right: 36, top: 220, ...rise(t, 100)}}>
        <Scaled s={1.26} origin="top right" width={560}><LockedRow p={WI_P.croPro} wiggle={wig}/></Scaled>
      </div>
      {t < 2800 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
    </>
  );
}

/* ═════════════════════ 3 · IN-HOME PRESENTATION ═════════════════════
 * Water Test ← src/components/proposal/wizard/WaterTestStep.tsx (Exact Values mode)
 * Buildout ← ProductSelectionStep.tsx (horizontal card, Selected chips, summary)
 * Maintenance ← MaintenanceStep.tsx (Covered by this plan / Plan total)
 * Value ← ValueProjectionChart.tsx + src/lib/valueProjection.ts (linear model)
 */
/** NewProposal.tsx → the wizard card's CardTitle + CardDescription (BASE_STEP_META). */
function StepHeader({title, description}) {
  return (
    <div style={{marginBottom: 20}}>
      <div style={{fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', color: APP.fg, lineHeight: 1}}>{title}</div>
      <div style={{fontSize: 13.5, color: APP.mutedFg, marginTop: 7}}>{description}</div>
    </div>
  );
}
const wizardCard = {background: APP.card, borderRadius: 12, boxShadow: APP.soft, padding: 24};

/* The public report the app's own tap-water-report edge function returns for ZIP 55449
 * (Blaine, MN — Commers Water's home market), fetched 2026-09-24. EPA SDWIS + UCMR 5,
 * USGS/EPA Water Quality Portal. */
const AREA = {
  zip: '55449', utilityName: 'Blaine', utilityCity: 'Blaine', populationServed: 70220, source: 'groundwater',
  hardness: {gpg: 16, mgL: 274, band: 'very hard', county: 'Anoka County', samples: 38},
  detected: [
    {label: 'PFBA', value: '25.2 ppt', benchmark: null},
    {label: 'Lead', value: '0 ppb', benchmark: 'EPA action level 15 ppb', zeroGoal: true},
  ],
};

/* WaterTestStep.tsx today: the ZIP's public report (AreaWaterPreview → AreaWaterStep) always
 * shows; "+ Log water test" opens a sheet, and the saved readings sit above the report as
 * tiles, with the tap hardness set against the area's on the hardness card. Like the app,
 * no "not detected" tallies. Colours are AreaWaterStep's own hexes. */
const WS = {ink: '#0f1c2e', body: '#4b5b72', faint: '#8592a6', navy: '#05418a', line: '#e6e8ec', red: '#b42318', redBg: '#fdecec', green: '#157f3d', greenBg: '#e9f8ef'};
const WS_CARD = {background: '#fff', border: `1px solid ${WS.line}`, borderRadius: 14, boxShadow: '0 1px 3px rgba(15,26,46,.06)'};
const WS_EYEBROW = {fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase'};
const WT_READINGS = [
  {label: 'Hardness', value: '18', unit: 'gpg', needs: true},
  {label: 'Iron', value: '0.4', unit: 'ppm', needs: true},
  {label: 'TDS', value: '350', unit: 'ppm', needs: false},
];
const HARD_BANDS = [['soft', '#cde9d6'], ['moderately hard', '#dce6f2'], ['hard', '#f6d9a8'], ['very hard', '#e9a3a3']];
const WT_PRESS = 1450;              // "+ Log water test" tapped
const WT_TILES = 1750;              // in-home tiles start landing

function Shimmer({w, h = 12, r = 6, style}) {
  return <div style={{width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #eef0f3 0%, #f7f8fa 50%, #eef0f3 100%)', ...style}}/>;
}

function WaterStepCard({t}) {
  const loaded = t >= 520;
  const logged = t >= WT_PRESS + 120;
  const open = easeInOut(prog(t, WT_PRESS + 120, 420));     // in-home block grows in
  const pt = pointer(t, [400, 210], [436, 52], 650, 650, WT_PRESS);
  const r = AREA.hardness;
  return (
    <div style={{...cardBase, padding: '18px 20px', width: 520, position: 'relative', fontFamily: APP.font}}>
      <div style={{...WS_EYEBROW, display: 'flex', alignItems: 'center', gap: 6, color: WS.navy}}>
        <Ic n="MapPin" size={12} sw={1.75}/>Water test · ZIP {AREA.zip}
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 6}}>
        <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: WS.ink}}>
          {logged ? 'Sarah’s water test results' : 'What’s in your area’s water'}
        </div>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 13px', borderRadius: 10, flexShrink: 0,
          border: `1.5px solid ${WS.navy}`, color: WS.navy, background: t >= WT_PRESS && t < WT_PRESS + 180 ? '#eef4fc' : '#fff',
          fontSize: 13, fontWeight: 600, transform: `scale(${t >= WT_PRESS && t < WT_PRESS + 160 ? 0.96 : 1})`}}>
          <Ic n={logged ? 'PenLine' : 'Plus'} size={14} sw={logged ? 1.75 : 2}/>{logged ? 'Edit readings' : 'Log water test'}
        </div>
      </div>

      {/* Your in-home test — the readings the rep just logged. */}
      <div style={{height: open * 104, overflow: 'hidden'}}>
        <div style={{paddingTop: 12}}>
          <div style={{...WS_EYEBROW, display: 'flex', alignItems: 'center', gap: 6, color: WS.navy}}>
            <Ic n="FlaskConical" size={13} sw={1.75}/>Your in-home test
            <span style={{textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: WS.body, fontSize: 12, opacity: prog(t, WT_TILES + 900, 300)}}>· 2 need treatment · 1 within range</span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8}}>
            {WT_READINGS.map((x, i) => {
              const at = WT_TILES + i * 260;
              return (
                <div key={x.label} style={{...WS_CARD, position: 'relative', overflow: 'hidden', padding: '8px 10px 9px 13px',
                  transform: `scale(${lerp(0.9, 1, Math.min(1, pop(t, at, 380)))})`, opacity: prog(t, at, 160)}}>
                  <span style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: x.needs ? '#dc2626' : '#16a34a'}}/>
                  <div style={{fontSize: 12, fontWeight: 500, color: WS.body}}>{x.label}</div>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2}}>
                    <span style={{fontSize: 19, fontWeight: 700, color: WS.ink, fontVariantNumeric: 'tabular-nums'}}>{x.value}</span>
                    <span style={{fontSize: 11.5, fontWeight: 600, color: WS.body}}>{x.unit}</span>
                  </div>
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, padding: '2px 7px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
                    background: x.needs ? WS.redBg : WS.greenBg, color: x.needs ? WS.red : WS.green, transform: `scale(${pop(t, at + 220, 360)})`, transformOrigin: 'left center'}}>
                    <Ic n={x.needs ? 'AlertTriangle' : 'Check'} size={11} sw={1.75}/>{x.needs ? 'Needs treatment' : 'Within range'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{...WS_EYEBROW, color: WS.faint, marginTop: lerp(12, 12, open), height: open * 14, overflow: 'hidden', opacity: open}}>{logged ? 'Your area’s water' : ''}</div>

      {/* The ZIP's public report: ready before any test is run. */}
      {!loaded ? (
        <div style={{marginTop: 4}}>
          <div style={{...WS_CARD, padding: 14, display: 'flex', gap: 12, alignItems: 'center'}}>
            <Shimmer w={36} h={36} r={10}/><div style={{flex: 1}}><Shimmer w="40%" h={9}/><Shimmer w="70%" style={{marginTop: 8}}/></div>
          </div>
          <div style={{...WS_CARD, padding: 14, marginTop: 10}}><Shimmer w="30%"/><Shimmer w="55%" h={26} style={{marginTop: 10}}/><Shimmer w="100%" h={8} style={{marginTop: 12}}/></div>
        </div>
      ) : (
        <div style={{marginTop: 4}}>
          <div style={{...WS_CARD, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, ...rise(t, 520, 10, 360)}}>
            <span style={{width: 36, height: 36, borderRadius: 10, background: '#ebf2fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Ic n="Building2" size={18} color={WS.navy} sw={1.75}/>
            </span>
            <div style={{minWidth: 0}}>
              <div style={{...WS_EYEBROW, color: WS.faint}}>Your water utility</div>
              <div style={{fontSize: 14, color: WS.body, marginTop: 2}}><span style={{fontWeight: 600, color: WS.ink}}>{AREA.utilityName}</span> · serving {AREA.populationServed.toLocaleString()} people · {AREA.source}</div>
              <div style={{fontSize: 12, color: WS.body, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'}}>
                Detected:{AREA.detected.map((c) => (
                  <span key={c.label} style={{display: 'inline-flex', gap: 4, padding: '1px 8px', borderRadius: 999, background: '#eef0f3'}}>
                    <span style={{fontWeight: 600, color: WS.ink}}>{c.label}</span>{c.value}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{...WS_CARD, padding: '14px 16px', marginTop: 10, display: 'flex', gap: 18, alignItems: 'center', ...rise(t, 640, 10, 360)}}>
            <div style={{flexShrink: 0}}>
              <div style={{fontSize: 12, fontWeight: 500, color: WS.body}}>Water hardness</div>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 4}}>
                <span style={{fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: WS.ink}}>{r.gpg}</span>
                <span style={{fontSize: 13, fontWeight: 600, color: WS.body}}>gpg</span>
              </div>
              <span style={{display: 'inline-block', marginTop: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: WS.redBg, color: WS.red}}>Typically {r.band}</span>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 12.5, lineHeight: 1.45, color: WS.body}}>Typically {r.band} ({r.mgL} mg/L) across {r.county}.</div>
              <div style={{display: 'flex', gap: 3, marginTop: 9, alignItems: 'center'}}>
                {HARD_BANDS.map(([b, c]) => <span key={b} style={{flex: 1, height: b === r.band ? 9 : 6, borderRadius: 999, background: c}}/>)}
              </div>
              <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 9, padding: '4px 9px', borderRadius: 8, background: '#f4f5f7', fontSize: 11.5, color: WS.body,
                transform: `scale(${pop(t, WT_TILES + 950, 400)})`, transformOrigin: 'left center'}}>
                <Ic n="FlaskConical" size={12} sw={1.75}/>Your tap, from the in-home test: <span style={{fontWeight: 600, color: WS.ink}}>18 gpg</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {t < WT_PRESS + 350 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
    </div>
  );
}

const CAT_PILL = {
  'Softeners': {bg: '#dbeafe', fg: '#1d4ed8'},
  'Reverse Osmosis': {bg: '#cffafe', fg: '#0e7490'},
  'Filters': {bg: '#dcfce7', fg: '#15803d'},
};

function BuildoutCard({t}) {
  const p = WI_P.croPro;
  const added = t >= 1700;
  const count = added ? 2 : 1;
  const total = WI_P.wwhs.retail + (added ? p.retail : 0);
  const cat = CAT_PILL[p.category];
  return (
    <div style={{...wizardCard, width: 540}}>
      <StepHeader title="Choose Products" description="Select products/services for this customer"/>
      <div style={{fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: APP.mutedFg}}>Selected</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8}}>
        {[WI_P.wwhs, ...(added ? [p] : [])].map((x, i) => (
          <div key={x.name} style={{display: 'flex', alignItems: 'center', gap: 6, background: APP.primary10, border: `1px solid ${APP.primary20}`, borderRadius: 999,
            padding: '6px 6px 6px 12px', transform: `scale(${i === 1 ? pop(t, 1700) : 1})`}}>
            <span style={{fontSize: 14, fontWeight: 500, color: APP.primary}}>{x.name}</span>
            <Ic n="X" size={14} color={APP.primary}/>
          </div>
        ))}
      </div>
      <div style={{marginTop: 16, display: 'flex', gap: 20, borderRadius: 12, border: `1px solid ${APP.border}`, background: APP.card, overflow: 'hidden'}}>
        <div style={{width: 150, minHeight: 190, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <img loading="lazy" src={p.img} alt="" style={{maxHeight: 170, maxWidth: 130}}/>
        </div>
        <div style={{flex: 1, padding: '20px 20px 20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          <div>
            <span style={{display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: cat.bg, color: cat.fg, marginBottom: 6}}>{p.category}</span>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
              <div style={{fontSize: 18, fontWeight: 600, color: APP.fg, lineHeight: 1.25}}>{p.name}</div>
              <div style={{textAlign: 'right', flexShrink: 0}}>
                <div style={{fontSize: 24, fontWeight: 700, color: APP.primary, lineHeight: 1}}>{usd0(monthly(p.retail))}<span style={{fontSize: 14, fontWeight: 500, opacity: .7}}>/mo</span></div>
                <div style={{fontSize: 12, color: APP.mutedFg, marginTop: 2}}>{usd0(p.retail)} retail</div>
              </div>
            </div>
          </div>
          <div style={{marginTop: 18}}>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
              background: added ? APP.primary : APP.card, color: added ? '#fff' : APP.fg, border: `1px solid ${added ? APP.primary : APP.border}`,
              transform: `scale(${t >= 1600 && t < 1760 ? 0.96 : 1})`}}>
              {added ? <><Ic n="Check" size={16}/> Added</> : 'Add to System'}
            </div>
          </div>
        </div>
      </div>
      <div style={{marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${APP.border}`, paddingTop: 12}}>
        <span style={{fontSize: 14, color: APP.mutedFg}}>{count} product{count > 1 ? 's' : ''} selected</span>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: 21, fontWeight: 700, color: APP.primary, lineHeight: 1}}>{usd0(monthly(total))}<span style={{fontSize: 14, fontWeight: 500, opacity: .7}}>/mo</span></div>
          <div style={{fontSize: 12, color: APP.mutedFg, marginTop: 2}}>{usd0(total)} retail</div>
        </div>
      </div>
    </div>
  );
}

function MaintenancePlanCard({t}) {
  const rows = [WI_P.wwhs, WI_P.croPro];
  const shownRows = rows.filter((_, i) => t >= 900 + i * 450);
  const total = shownRows.reduce((s, r) => s + r.care, 0);
  return (
    <div style={{...wizardCard, width: 560}}>
    <StepHeader title="Maintenance Package" description="Offer a recurring maintenance plan for the equipment"/>
    <div style={{borderRadius: 12, padding: 20, border: `2px solid ${APP.primary}`}}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
        <span style={{fontSize: 22, lineHeight: 1}}>🔧</span>
        <div style={{flex: 1}}>
          <div style={{fontSize: 16, fontWeight: 600, color: APP.fg}}>Commers Customer Care Plan</div>
          <div style={{fontSize: 12, color: APP.mutedFg, marginTop: 2, lineHeight: 1.5}}>Commers provides professional repair and replacement services for residential and commercial water treatment systems.</div>
        </div>
        <div style={{display: 'inline-flex', padding: 4, borderRadius: 12, background: APP.muted}}>
          <span style={{fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, background: APP.card, boxShadow: APP.soft, color: APP.fg}}>Monthly</span>
        </div>
      </div>
      <div style={{marginTop: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${APP.green200}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: APP.green50, borderBottom: `1px solid ${APP.green200}`}}>
          <Ic n="ShieldCheck" size={14} color={APP.green600}/>
          <span style={{fontSize: 12, fontWeight: 600, color: APP.green700, textTransform: 'uppercase', letterSpacing: '.03em'}}>Covered by this plan</span>
        </div>
        {rows.map((r, i) => {
          const on = t >= 900 + i * 450;
          return (
            <div key={r.name} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(240,253,244,.3)',
              borderTop: i ? `1px solid ${APP.green100}` : 'none', ...rise(t, 900 + i * 450, 10, 360), opacity: on ? rise(t, 900 + i * 450, 10, 360).opacity : 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <Ic n="Check" size={14} color={APP.green500}/>
                <span style={{fontSize: 14, fontWeight: 500, color: APP.fg}}>{r.name}</span>
              </div>
              <div><span style={{fontSize: 14, fontWeight: 700, color: APP.fg}}>{usd2(r.care)}</span><span style={{fontSize: 12, color: APP.mutedFg}}>/mo</span></div>
            </div>
          );
        })}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(220,252,231,.6)', borderTop: `1px solid ${APP.green200}`}}>
          <span style={{fontSize: 12, fontWeight: 600, color: APP.green700, textTransform: 'uppercase', letterSpacing: '.03em'}}>Plan total</span>
          <div><span style={{fontSize: 20, fontWeight: 700, color: APP.fg, fontVariantNumeric: 'tabular-nums'}}>{usd2(total)}</span><span style={{fontSize: 12, color: APP.mutedFg}}>/mo</span></div>
        </div>
      </div>
    </div>
    </div>
  );
}

/* The homeowner's spending today is the example customer's own input (Step 6 "Current
 * Spending", rep-editable); the system side is Commers' real price + care plan + term. */
const VP_CURRENT = 150;
const VP_SYSTEM = WI_P.wwhs.retail + WI_P.croPro.retail;
const VP_MAINT = WI_P.wwhs.care + WI_P.croPro.care;
const VP_EQUIP_MO = monthly(VP_SYSTEM);
const vpCost = {
  current: (m) => VP_CURRENT * m,
  purchase: (m) => VP_SYSTEM + VP_MAINT * m,
  finance: (m) => VP_EQUIP_MO * Math.min(m, WI_FIN.months) + VP_MAINT * m,
};
const VP_SAVINGS = Math.max(vpCost.current(240) - vpCost.purchase(240), vpCost.current(240) - vpCost.finance(240));
const VP_COLORS = {current: '#eb6834', purchase: '#eda100', finance: '#2a78d6'};

function ValueCard({t}) {
  const W = 480, H = 150, years = 15, maxY = 30000;
  const x = (m) => 40 + (m / (years * 12)) * (W - 52);
  const y = (v) => 10 + (1 - v / maxY) * (H - 34);
  const draw = easeInOut(prog(t, 1000, 2000));
  const path = (fn) => {
    const pts = [];
    const last = Math.round(years * 12 * draw);
    for (let m = 0; m <= last; m += 3) pts.push(`${pts.length ? 'L' : 'M'}${x(m).toFixed(1)},${y(fn(m)).toFixed(1)}`);
    return pts.join(' ');
  };
  const savings = VP_SAVINGS * easeOut(prog(t, 300, 1400));
  return (
    <div style={{...wizardCard, width: 560}}>
      <StepHeader title="Value Comparison" description="Compare current spending vs. financing and rental options"/>
      <div style={{...cardBase, borderRadius: 16, border: `1px solid ${APP.border}`, boxShadow: 'none', padding: 16, textAlign: 'center'}}>
        <div style={{fontSize: 12, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase', color: APP.mutedFg}}>Best net savings over 20 years</div>
        <div style={{fontSize: 36, fontWeight: 700, color: APP.fg, marginTop: 4, fontVariantNumeric: 'tabular-nums'}}>{usd0(savings)}</div>
        <div style={{fontSize: 12, color: APP.mutedFg, marginTop: 2}}>vs. {usd0(vpCost.current(240))} spent doing nothing</div>
      </div>
      <div style={{...cardBase, borderRadius: 16, border: `1px solid ${APP.border}`, boxShadow: 'none', padding: 16, marginTop: 14}}>
        <div style={{fontSize: 14, fontWeight: 600, color: APP.fg}}>Cumulative cost, first 15 years</div>
        <div style={{fontSize: 12, color: APP.mutedFg, marginBottom: 6}}>Each dot marks the break-even point — where the system has paid for itself.</div>
        <svg width={W} height={H} style={{display: 'block'}}>
          {[0, 10000, 20000, 30000].map((v) => (
            <g key={v}>
              <line x1={40} x2={W - 12} y1={y(v)} y2={y(v)} stroke={APP.border} strokeDasharray="3 3"/>
              <text x={34} y={y(v) + 4} fontSize="11" textAnchor="end" fill={APP.mutedFg}>{v ? `$${v / 1000}k` : '$0'}</text>
            </g>
          ))}
          {[0, 5, 10, 15].map((yr) => (
            <text key={yr} x={x(yr * 12)} y={H - 4} fontSize="11" textAnchor="middle" fill={APP.mutedFg}>{yr ? `Yr ${yr}` : 'Today'}</text>
          ))}
          {['current', 'purchase', 'finance'].map((k) => (
            <path key={k} d={path(vpCost[k])} fill="none" stroke={VP_COLORS[k]} strokeWidth="2.5" strokeLinejoin="round"/>
          ))}
          {['purchase', 'finance'].map((k) => {
            let be = null;
            for (let m = 1; m <= years * 12; m++) if (vpCost.current(m) >= vpCost[k](m)) { be = m; break; }
            if (!be || be > years * 12 * draw) return null;
            return <circle key={k} cx={x(be)} cy={y(vpCost[k](be))} r={5 * pop(t, 1000 + (be / (years * 12)) * 2000)} fill={VP_COLORS[k]} stroke="#fff" strokeWidth="2"/>;
          })}
        </svg>
        <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6}}>
          {[['current', 'Current Spending'], ['purchase', 'Pay In Full'], ['finance', 'Finance Plan']].map(([k, l]) => (
            <span key={k} style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: APP.fg}}>
              <span style={{width: 10, height: 10, borderRadius: 2, background: VP_COLORS[k]}}/>{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PresentationBeat({beat, t}) {
  if (beat === 0) return (
    <>
      <ProductBleed p={WI_P.wwhs} side="right" t={t}/>
      <AudiencePill label="Sales Reps" side="left"/>
      <div style={{position: 'absolute', left: 36, top: 104, ...rise(t, 80)}}><Scaled s={1.36} width={520}><WaterStepCard t={t}/></Scaled></div>
    </>
  );
  if (beat === 1) return (
    <>
      <ProductBleed p={WI_P.wwhs} side="left" t={t} height={540} inset={-120}/>
      <AudiencePill label="Sales Reps" side="right"/>
      <div style={{position: 'absolute', right: 30, top: 84, ...rise(t, 80)}}><Scaled s={1.26} origin="top right" width={540}><BuildoutCard t={t}/></Scaled></div>
      {t < 2400 && (() => { const pt = pointer(t, [520, 690], [398, 540], 700, 700, 1600); return <Cursor x={pt.x} y={pt.y} down={pt.down}/>; })()}
    </>
  );
  if (beat === 2) return (
    <>
      <ProductBleed p={WI_P.croPro} side="right" t={t} height={520} inset={-70}/>
      <AudiencePill label="Sales Reps" side="left"/>
      <div style={{position: 'absolute', left: 36, top: 110, ...rise(t, 80)}}><Scaled s={1.3} width={560}><MaintenancePlanCard t={t}/></Scaled></div>
    </>
  );
  return (
    <>
      <ProductBleed p={WI_P.wwhs} side="left" t={t} height={520} inset={-150}/>
      <AudiencePill label="Sales Reps & Homeowners" side="right"/>
      <div style={{position: 'absolute', right: 30, top: 88, ...rise(t, 80)}}><Scaled s={1.16} origin="top right" width={560}><ValueCard t={t}/></Scaled></div>
    </>
  );
}

/* ═════════════════════ 4 · VIRTUAL SALES ═════════════════════
 * Share menu + toast ← src/pages/ProposalProfile.tsx (handleEmailJourney strings)
 * Water ← src/components/journey/WaterStep.tsx
 * Option card ← src/components/journey/OptionsStep.tsx
 * Updates ← src/components/dashboard/UpdatesCard.tsx; messages from
 *   guided-proposal-checkout and _shared/dealClosed.ts
 */
function ShareMenu({focused, t0}) {
  const items = [['copy', 'Copy', 'Copy customer link'], ['email', 'Mail', 'Email to customer'], ['preview', 'ExternalLink', 'Preview as customer']];
  const s = lerp(0.95, 1, easeOut(prog(t0, 0, 200)));
  return (
    <div style={{width: 288, display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
      <div style={{height: 32, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 12, border: `2px solid ${APP.primary}`,
        color: APP.primary, background: 'hsla(213, 93%, 28%, 0.06)', fontSize: 13, fontWeight: 500}}>
        <Ic n="Share2" size={14}/>Share<Ic n="ChevronDown" size={14} style={{opacity: .6}}/>
      </div>
      <div style={{marginTop: 4, width: 288, padding: 4, borderRadius: 12, border: `1px solid ${APP.border}`, background: APP.card, boxShadow: APP.md,
        transform: `scale(${s})`, transformOrigin: 'top right', opacity: prog(t0, 0, 150)}}>
        <div style={{padding: '6px 8px', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', color: APP.mutedFg}}>Customer journey</div>
        {items.map(([id, icon, label]) => (
          <div key={id} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 4, fontSize: 14,
            background: focused === id ? APP.primary : 'transparent', color: focused === id ? '#fff' : APP.fg}}>
            <Ic n={icon} size={16}/>{label}
          </div>
        ))}
        <p style={{margin: 0, padding: '4px 8px 6px', fontSize: 11, lineHeight: 1.6, color: APP.mutedFg}}>
          One page with their details, system, plan and agreement to sign. Sections with no data are skipped.
        </p>
      </div>
    </div>
  );
}

function SentToast() {
  return (
    <div style={{width: 356, padding: '22px 30px 22px 22px', borderRadius: 10, border: `1px solid ${APP.border}`, background: APP.bg, color: APP.fg, boxShadow: APP.lg}}>
      <div style={{fontSize: 14, fontWeight: 600}}>Customer link sent</div>
      <div style={{fontSize: 14, opacity: .9, marginTop: 2}}>Emailed to sarah@example.com.</div>
    </div>
  );
}

function JourneyHeader({icon, eyebrow, title, intro}) {
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, color: APP.primary}}>
        <Ic n={icon} size={14}/><span style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em'}}>{eyebrow}</span>
      </div>
      <div style={{fontSize: 23, fontWeight: 700, letterSpacing: '-0.025em', color: APP.fg, marginTop: 8, lineHeight: 1.2}}>{title}</div>
      {intro && <div style={{fontSize: 13.5, lineHeight: 1.55, color: APP.mutedFg, marginTop: 8}}>{intro}</div>}
    </div>
  );
}

const WATER_READINGS = [
  {label: 'Hardness', value: '18 Grains', fail: true},
  {label: 'Iron', value: '0.4 ppm', fail: true},
  {label: 'TDS', value: '350 ppm', fail: false},
  {label: 'Chlorine', value: '1.5 ppm', fail: false},
];

function AreaWaterJourney() {
  const card = {background: APP.card, borderRadius: 12, border: `1px solid ${APP.border60}`, boxShadow: APP.soft, padding: 16, marginTop: 14};
  return (
    <>
      <JourneyHeader icon="Droplets" eyebrow="Step two" title="What's in your water"
        intro="We looked up the public testing records for your water utility, along with typical water hardness where you live."/>
      <div style={card}>
        <div style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: APP.primary}}>Your water utility</div>
        <div style={{fontSize: 17, fontWeight: 600, color: APP.fg, marginTop: 6}}>{AREA.utilityName}</div>
        <div style={{fontSize: 13, color: APP.mutedFg, marginTop: 2}}>{AREA.utilityCity} · serving {AREA.populationServed.toLocaleString()} people · {AREA.source}</div>
      </div>
      <div style={card}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
          <div style={{fontSize: 14.5, fontWeight: 500, color: APP.fg}}>Water hardness</div>
          <div style={{fontSize: 23, fontWeight: 700, color: APP.destructive, fontVariantNumeric: 'tabular-nums'}}>{AREA.hardness.gpg} <span style={{fontSize: 13, fontWeight: 600}}>gpg</span></div>
        </div>
        <div style={{fontSize: 13, color: APP.mutedFg, marginTop: 4, lineHeight: 1.5}}>
          Typically <span style={{fontWeight: 500, color: APP.fg}}>{AREA.hardness.band}</span> ({AREA.hardness.mgL} mg/L) across {AREA.hardness.county}, from {AREA.hardness.samples} measurements.
        </div>
        <div style={{fontSize: 13.5, color: APP.mutedFg, marginTop: 10, lineHeight: 1.55}}>
          Hard water is what leaves scale in your water heater, spots on glassware and stiffness in laundry. It is also the easiest thing on this page to fix.
        </div>
      </div>
      <div style={card}>
        <div style={{fontSize: 14.5, fontWeight: 500, color: APP.fg}}>Detected in your utility’s testing</div>
        {AREA.detected.map((c, i) => (
          <div key={c.label} style={{padding: '12px 0', borderTop: i ? `1px solid ${APP.border60}` : 'none'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
              <div>
                <div style={{fontSize: 14, fontWeight: 500, color: APP.fg}}>{c.label}</div>
                <div style={{fontSize: 12.5, color: APP.mutedFg}}>{c.value}{c.benchmark ? ` · ${c.benchmark}` : ''}</div>
              </div>
              <span style={{alignSelf: 'flex-start', fontSize: 12, fontWeight: 600, padding: '4px 9px', borderRadius: 8, background: APP.muted, color: APP.mutedFg}}>Detected</span>
            </div>
            {c.zeroGoal && <div style={{fontSize: 12.5, color: APP.mutedFg, marginTop: 4, lineHeight: 1.5}}>EPA’s health goal for lead is zero — there is no amount it considers safe to drink.</div>}
          </div>
        ))}
      </div>
    </>
  );
}

function JourneyWater({t}) {
  return (
    <>
      <div style={rise(t, 200)}>
        <JourneyHeader icon="FlaskConical" eyebrow="Step two" title="What's in your water"
          intro="We tested your water and found 2 results that need attention. Here's exactly what we measured."/>
      </div>
      <div style={{...cardBase, border: `1px solid ${APP.border60}`, padding: '4px 16px', marginTop: 16}}>
        {WATER_READINGS.map((r, i) => (
          <div key={r.label} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0',
            borderTop: i ? `1px solid ${APP.border60}` : 'none', ...rise(t, 700 + i * 320, 10, 380)}}>
            <div>
              <div style={{fontSize: 14, fontWeight: 500, color: APP.fg}}>{r.label}</div>
              <div style={{fontSize: 12.5, color: APP.mutedFg}}>{r.value}</div>
            </div>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 8, padding: '4px 9px', fontSize: 12, fontWeight: 600,
              background: r.fail ? 'hsla(0, 75%, 55%, 0.1)' : 'rgba(16,185,129,.1)', color: r.fail ? APP.destructive : APP.emerald700,
              transform: `scale(${pop(t, 900 + i * 320)})`}}>
              <Ic n={r.fail ? 'AlertTriangle' : 'CheckCircle2'} size={13}/>{r.fail ? 'Needs treatment' : 'Within range'}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function JourneyOptionCard({selected, pressed, badge}) {
  const p = WI_P.wwhs;
  return (
    <div style={{background: APP.card, borderRadius: 12, overflow: 'hidden', border: `1px solid ${selected ? APP.primary : APP.border60}`,
      boxShadow: selected ? `0 0 0 2px hsla(213, 93%, 28%, 0.2), ${APP.soft}` : APP.soft}}>
      <div style={{padding: 18}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div style={{fontSize: 17, fontWeight: 600, color: APP.fg}}>Option B</div>
          {selected && (
            <div style={{display: 'flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 999, background: APP.primary, color: '#fff',
              fontSize: 12, fontWeight: 600, transform: `scale(${badge})`}}><Ic n="Check" size={12} sw={3}/>Your choice</div>
          )}
        </div>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', color: APP.fg, marginTop: 14, fontVariantNumeric: 'tabular-nums'}}>{usd0(p.retail)}</div>
        <div style={{fontSize: 13.5, color: APP.mutedFg, marginTop: 2}}>or {usd0(monthly(p.retail))}/mo with financing</div>
      </div>
      <div style={{borderTop: `1px solid ${APP.border60}`}}>
        <div style={{background: 'hsla(220, 15%, 94%, 0.4)', padding: 12, display: 'flex', justifyContent: 'center'}}>
          <img loading="lazy" src={p.img} alt="" style={{height: 96, width: 'auto'}}/>
        </div>
        <div style={{padding: '12px 18px', fontSize: 14.5, fontWeight: 500, color: APP.fg, textDecoration: 'underline', textDecorationColor: APP.border, textUnderlineOffset: 4}}>{p.name}</div>
      </div>
      <div style={{padding: 18, borderTop: `1px solid ${APP.border60}`}}>
        <div style={{minHeight: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 500,
          background: selected ? APP.secondary : APP.waterButton, color: selected ? APP.fg : '#fff', boxShadow: selected ? 'none' : APP.lg,
          transform: `scale(${pressed ? 0.97 : 1})`}}>
          {selected && <Ic n="Check" size={16} sw={2.5}/>}{selected ? 'Selected' : 'Choose Option B'}
        </div>
      </div>
    </div>
  );
}

const FEED_STYLE = {
  option_selected: {icon: 'ListChecks', bg: 'hsla(213, 93%, 28%, 0.15)', fg: APP.primary},
  guided_agreement: {icon: 'PenLine', bg: APP.amber100, fg: APP.amber700},
  deal_closed: {icon: 'Trophy', bg: APP.emerald100, fg: APP.emerald700},
};
const feedMessage = (type) => ({
  option_selected: `${WI_CUSTOMER} chose "Option B" on their guided proposal.`,
  guided_agreement: `${WI_CUSTOMER} generated their agreement from the guided proposal and can sign it now.`,
  deal_closed: `${WI_CUSTOMER}'s deal has been closed.`,
}[type]);

function UpdatesFeed({rows}) {
  return (
    <div style={{width: 380, borderRadius: 16, border: `1px solid ${APP.border60}`, background: APP.card, overflow: 'hidden', boxShadow: APP.lg}}>
      <div style={{padding: '20px 20px 16px', borderBottom: `1px solid hsla(220, 15%, 88%, 0.4)`, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{width: 44, height: 44, borderRadius: 999, background: APP.primary, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Ic n="Bell" size={20} color="#fff"/></div>
        <div>
          <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '-0.025em', color: APP.fg}}>Updates</div>
          <div style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: APP.mutedFg}}>From your team</div>
        </div>
      </div>
      {rows.map((r, i) => {
        const st = FEED_STYLE[r.type];
        const e = r.enter == null ? 1 : r.enter;
        return (
          <div key={r.type} style={{maxHeight: 120 * e, opacity: e, overflow: 'hidden', borderTop: i ? `1px solid hsla(220, 15%, 88%, 0.3)` : 'none',
            background: r.unread ? APP.primary5 : APP.card}}>
            <div style={{padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 10}}>
              <div style={{marginTop: 2, flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: st.bg, color: st.fg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Ic n={st.icon} size={12}/>
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 13, lineHeight: 1.4, color: APP.fg}}>{feedMessage(r.type)}</div>
                <div style={{fontSize: 11, color: 'hsla(216, 15%, 50%, 0.6)', marginTop: 4}}>
                  {r.when}<span style={{marginLeft: 6, color: APP.primary, fontWeight: 500}}>· View proposal →</span>
                </div>
              </div>
              {r.unread && <span style={{marginTop: 6, flexShrink: 0, width: 8, height: 8, borderRadius: 999, background: APP.primary}}/>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const enterAt = (t, at) => easeOut(prog(t, at, 500));

function VirtualBeat({beat, t}) {
  if (beat === 0) {
    const menuAt = 900, emailAt = 1700, sentAt = 2300;
    const pt = pointer(t, [300, 640], t < menuAt ? [800, 175] : [640, 290], t < menuAt ? 200 : 1100, t < menuAt ? 650 : 500, t < menuAt ? 760 : 2150);
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="left" t={t} height={560} inset={-130}/>
        <AudiencePill label="Sales Reps" side="right"/>
        <div style={{position: 'absolute', right: 56, top: 150}}>
          <Scaled s={1.85} origin="top right" width={288}>
            {t < sentAt
              ? (t >= menuAt
                  ? <ShareMenu focused={t >= emailAt ? 'email' : undefined} t0={t - menuAt}/>
                  : <div style={{display: 'flex', justifyContent: 'flex-end', ...rise(t, 100)}}><div style={{height: 32, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 12,
                      border: `2px solid ${APP.primary}`, color: APP.primary, fontSize: 13, fontWeight: 500}}><Ic n="Share2" size={14}/>Share<Ic n="ChevronDown" size={14} style={{opacity: .6}}/></div></div>)
              : null}
          </Scaled>
        </div>
        {t >= sentAt && <div style={{position: 'absolute', right: 56, top: 280, ...rise(t, sentAt, 20)}}><Scaled s={1.7} origin="top right" width={356}><SentToast/></Scaled></div>}
        {t < sentAt + 300 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
      </>
    );
  }
  if (beat === 1) return (
    <>
      <ProductBleed p={WI_P.wwhs} side="right" t={t} height={560} inset={-60}/>
      <AudiencePill label="Homeowners" side="left"/>
      <div style={{position: 'absolute', left: 190, top: 64, ...rise(t, 0, 40, 700)}}>
        <Phone scroll={lerp(0, 400, easeInOut(prog(t, 1200, 2400)))}><AreaWaterJourney/></Phone>
      </div>
    </>
  );
  if (beat === 2) {
    const pressAt = 1700, selected = t >= pressAt + 120;
    const pt = pointer(t, [820, 700], [520, 640], 800, 700, pressAt);
    return (
      <>
        <AudiencePill label="Homeowners" side="right"/>
        <div style={{position: 'absolute', left: 262, top: 40, ...rise(t, 0, 40, 700)}}>
          <Phone s={1.3}>
            <JourneyHeader icon="Columns3" eyebrow="Your options" title={selected ? 'You chose Option B' : 'Compare your options'}/>
            <div style={{marginTop: 14}}><JourneyOptionCard selected={selected} pressed={pt.down} badge={pop(t, pressAt + 120)}/></div>
          </Phone>
        </div>
        {t < 2600 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
      </>
    );
  }
  return (
    <>
      <ProductBleed p={WI_P.wwhs} side="left" t={t} height={560} inset={-110}/>
      <AudiencePill label="Sales Reps" side="right"/>
      <div style={{position: 'absolute', right: 44, top: 130}}>
        <Scaled s={1.62} origin="top right" width={380}>
          <UpdatesFeed rows={[
            ...(t >= 1700 ? [{type: 'guided_agreement', when: 'less than a minute ago', unread: true, enter: enterAt(t, 1700)}] : []),
            {type: 'option_selected', when: t >= 1700 ? '1 minute ago' : 'less than a minute ago', unread: true, enter: enterAt(t, 400)},
          ]}/>
        </Scaled>
      </div>
    </>
  );
}

/* ═════════════════════ 5 · PAYMENTS & AGREEMENTS ═════════════════════
 * Method chooser ← src/components/journey/CheckoutStep.tsx (MethodChooser / MethodCard)
 * Invoice ← src/components/journey/InvoiceCard.tsx
 * Signing ← src/components/signature/ContractSigner.tsx
 * Deal closed ← UpdatesCard.tsx + _shared/dealClosed.ts
 */
/** Brand marks on the canvas — furniture beside the app, never inside it. */
function PartnerBadge({src, alt, h, style}) {
  return (
    <div style={{position: 'absolute', background: '#fff', borderRadius: 16, boxShadow: APP.md, padding: '14px 20px', display: 'flex', alignItems: 'center', ...style}}>
      <img loading="lazy" src={src} alt={alt} style={{height: h, width: 'auto', display: 'block'}}/>
    </div>
  );
}

function MethodCard({icon, title, detail, note, hot, logo}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, border: `1px solid ${hot ? 'hsla(213, 93%, 28%, 0.4)' : APP.border60}`,
      background: hot ? 'hsla(213, 93%, 28%, 0.03)' : APP.card, padding: 16, boxShadow: APP.soft}}>
      {logo
        ? <img loading="lazy" src={logo} alt="" style={{width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: `1px solid ${APP.border}`, background: '#fff', objectFit: 'contain', padding: 2}}/>
        : <div style={{width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: APP.primary10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ic n={icon} size={19} color={APP.primary}/>
          </div>}
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 15, fontWeight: 600, color: APP.fg, lineHeight: 1.3}}>{title}</div>
        <div style={{fontSize: 13.5, color: APP.mutedFg}}>{detail}</div>
        {note && <div style={{fontSize: 10.5, lineHeight: 1.45, color: APP.mutedFg, marginTop: 4}}>{note}</div>}
      </div>
      <Ic n="ChevronRight" size={18} color={APP.mutedFg}/>
    </div>
  );
}

function InvoiceCard({paid, pressed}) {
  const today = new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
  return (
    <div style={{borderRadius: 12, padding: 18, boxShadow: APP.soft, border: `1px solid ${paid ? 'rgba(16,185,129,.3)' : 'hsla(213, 93%, 28%, 0.25)'}`,
      background: paid ? 'rgba(16,185,129,.06)' : 'hsla(213, 93%, 28%, 0.04)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
        <div>
          <div style={{fontSize: 15, fontWeight: 600, color: APP.fg}}>Deposit</div>
          {paid
            ? <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 500, color: APP.emerald700, marginTop: 2}}><Ic n="CheckCircle2" size={14}/>Paid on {today}</div>
            : <div style={{fontSize: 13.5, color: APP.mutedFg, marginTop: 2}}>Due today</div>}
        </div>
        <div style={{fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: APP.fg, fontVariantNumeric: 'tabular-nums'}}>{usd2(500)}</div>
      </div>
      {!paid && (
        <div style={{marginTop: 14, height: 44, borderRadius: 10, background: APP.waterButton, color: '#fff', fontSize: 14.5, fontWeight: 500, boxShadow: APP.lg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transform: `scale(${pressed ? 0.97 : 1})`}}>
          <Ic n="CreditCard" size={16}/>Pay Now
        </div>
      )}
    </div>
  );
}

/** A handwritten "Sarah Mitchell", drawn in with stroke-dashoffset. */
const SIG_PATH = 'M14 58c10-22 26-40 34-36 8 4-24 34-16 40 10 8 30-26 38-22 6 3-8 24-2 26 8 2 16-22 22-20 5 2-4 18 2 18 7 0 12-18 18-16 5 2-2 14 4 14 8 0 18-30 26-28 6 2-10 30-4 30 6 0 16-16 22-14 5 2-2 12 4 12 10 0 26-20 40-24';

function SignCard({t}) {
  const name = typed(WI_CUSTOMER, t, 400, 55);
  const draw = easeInOut(prog(t, 1300, 1300));
  const pressAt = 3000;
  return (
    <div style={{...cardBase, boxShadow: APP.lg, padding: 20, width: 440}}>
      <div style={{fontSize: 17, fontWeight: 600, color: APP.fg, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14}}>
        <Ic n="PenLine" size={19} color={APP.primary}/>Sign This Agreement
      </div>
      <div style={{fontSize: 13.5, fontWeight: 500, color: APP.fg, marginBottom: 6}}>Your Full Name</div>
      <div style={{height: 46, borderRadius: 10, border: `1px solid ${t > 300 && t < 1300 ? APP.primary : APP.border}`, display: 'flex', alignItems: 'center',
        padding: '0 12px', fontSize: 17, color: name ? APP.fg : APP.mutedFg}}>
        {name || 'Enter your full legal name'}<Caret h={20} on={t > 300 && t < 1300 && blink(t)}/>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 4, borderRadius: 8, background: APP.muted, marginTop: 14}}>
        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 500, padding: '6px 0', borderRadius: 6, background: APP.card, color: APP.fg, boxShadow: '0 1px 2px rgba(0,0,0,.06)'}}><Ic n="PenLine" size={15}/>Draw Signature</span>
        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 500, padding: '6px 0', color: APP.mutedFg}}><Ic n="Type" size={15}/>Type to Sign</span>
      </div>
      <div style={{marginTop: 12, height: 110, borderRadius: 8, border: `2px dashed hsla(216, 15%, 50%, 0.3)`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="330" height="90" viewBox="0 0 330 90">
          <path d={SIG_PATH} fill="none" stroke={APP.fg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw}/>
        </svg>
      </div>
      <div style={{fontSize: 11.5, color: APP.mutedFg, marginTop: 6}}>Use your finger or stylus to draw your signature above.</div>
      <div style={{fontSize: 11.5, color: APP.mutedFg, marginTop: 12}}>By clicking "Sign Agreement", you agree to the terms outlined in the document above.</div>
      <div style={{marginTop: 12, height: 46, borderRadius: 10, background: APP.waterButton, color: '#fff', fontSize: 15, fontWeight: 500, boxShadow: APP.lg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transform: `scale(${t >= pressAt && t < pressAt + 180 ? 0.97 : 1})`}}>
        <Ic n="PenLine" size={16}/>Sign Agreement
      </div>
    </div>
  );
}

function PaymentsBeat({beat, t}) {
  if (beat === 0) {
    const pt = pointer(t, [780, 720], [470, 628], 1500, 800, 2600);
    const total = WI_P.wwhs.retail;
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="right" t={t} height={560} inset={-60}/>
        <AudiencePill label="Homeowners" side="left"/>
        <div style={{position: 'absolute', left: 190, top: 44, ...rise(t, 0, 40, 700)}}>
          <Phone s={1.3}>
            <JourneyHeader icon="Handshake" eyebrow="Last step" title="How would you like to move forward?"
              intro="Choose how you'd like to pay, then generate your agreement and sign it right here."/>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16}}>
              <div style={rise(t, 700, 12)}>
                <MethodCard icon="Landmark" logo="uploads/whats-inside/us-bank-avvance.png" title={`Apply for financing with ${WI_FIN.partner}`}
                  detail={`About ${usd0(monthly(total))}/mo for ${WI_FIN.months} months`}
                  note="For illustration only — not an offer of credit. Subject to credit approval."/>
              </div>
              <div style={rise(t, 950, 12)}>
                <MethodCard icon="CreditCard" title="Pay by card or bank transfer" detail={`${usd2(total)} in full, securely online`} hot={pt.pressed}/>
              </div>
            </div>
          </Phone>
        </div>
        <PartnerBadge src="uploads/whats-inside/usbank-logo.png" alt="U.S. Bank" h={34} style={{right: 40, top: 100, transform: `scale(${pop(t, 500)})`}}/>
        <PartnerBadge src="uploads/whats-inside/stripe-wordmark.svg" alt="Stripe" h={38} style={{right: 40, top: 180, padding: '10px 20px', transform: `scale(${pop(t, 750)})`}}/>
        {t < 3300 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
      </>
    );
  }
  if (beat === 1) {
    const pressAt = 1500, paid = t >= 2100;
    const pt = pointer(t, [300, 700], [360, 440], 500, 800, pressAt);
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="right" t={t} height={560} inset={-40}/>
        <AudiencePill label="Homeowners" side="left"/>
        <div style={{position: 'absolute', left: 40, top: 170, ...rise(t, 80)}}>
          <Scaled s={1.45} width={440}>
            <InvoiceCard paid={paid} pressed={pt.down}/>
            <div style={{marginTop: 10, borderRadius: 12, padding: 18, border: `1px solid hsla(213, 93%, 28%, 0.25)`, background: 'hsla(213, 93%, 28%, 0.04)', boxShadow: APP.soft}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
                <div>
                  <div style={{fontSize: 15, fontWeight: 600, color: APP.fg}}>One-Time Purchase</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: APP.mutedFg, marginTop: 2}}><Ic n="CalendarClock" size={14}/>Due at installation — or pay now if you'd prefer</div>
                </div>
                <div style={{fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: APP.fg, fontVariantNumeric: 'tabular-nums'}}>{usd2(WI_P.wwhs.retail - 500)}</div>
              </div>
            </div>
          </Scaled>
        </div>
        <div style={{position: 'absolute', left: 44, top: 540, display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 600, color: APP.mutedFg, ...rise(t, 400)}}>
          Payments by <img loading="lazy" src="uploads/whats-inside/stripe-wordmark.svg" alt="Stripe" style={{height: 34}}/>
        </div>
        {t < 2300 && <Cursor x={pt.x} y={pt.y} down={pt.down}/>}
      </>
    );
  }
  if (beat === 2) return (
    <>
      <ProductBleed p={WI_P.wwhs} side="left" t={t} height={540} inset={-130}/>
      <AudiencePill label="Homeowners" side="right"/>
      <div style={{position: 'absolute', right: 40, top: 76, ...rise(t, 80)}}><Scaled s={1.44} origin="top right" width={440}><SignCard t={t}/></Scaled></div>
    </>
  );
  return (
    <>
      <ProductBleed p={WI_P.wwhs} side="right" t={t} height={560} inset={-60}/>
      <AudiencePill label="Owners & Managers" side="left"/>
      <div style={{position: 'absolute', left: 40, top: 110}}>
        <Scaled s={1.62} width={380}>
          <UpdatesFeed rows={[
            ...(t >= 1000 ? [{type: 'deal_closed', when: 'less than a minute ago', unread: true, enter: enterAt(t, 1000)}] : []),
            {type: 'guided_agreement', when: '4 minutes ago', unread: false, enter: enterAt(t, 150)},
          ]}/>
        </Scaled>
      </div>
      {t >= 1400 && (
        <div style={{position: 'absolute', left: 60, top: 560, transform: `scale(${pop(t, 1400, 520)})`, transformOrigin: 'left center',
          display: 'flex', alignItems: 'center', gap: 10, background: APP.emerald100, color: APP.emerald700, padding: '12px 20px', borderRadius: 999,
          fontSize: 20, fontWeight: 700, boxShadow: APP.md}}>
          <Ic n="Trophy" size={20}/>{usd0(WI_P.wwhs.retail)} closed
        </div>
      )}
    </>
  );
}


/* ═════════════════════ 6 · UPSELLS & AI COACHING ═════════════════════
 * Add-ons ← ProductSelectionStep.tsx (upsell chips, offered once the system is added;
 *   productPriceCents folds selected upsells into the card and summary prices)
 * Discounts ← ContractsTab.tsx promosSlide + promoLabel
 * Pitch Analysis ← src/components/proposal/PitchAnalysisSheet.tsx
 * Upsells and promotions are Commers Water's own (product_upsells / promotions).
 */
const UPSELLS = [
  {name: 'Recycling of Old Systems', price: 150},
  {name: 'Connect Ice Machine', price: 100},
  {name: 'Basement mounting board', price: 100},
  {name: 'Drill Counter', price: 100},
];
const PICKS = [{i: 0, at: 1500}, {i: 1, at: 2300}];
const PROMOS = [
  {name: 'Trade In Discount', label: '$400 off', off: 400, at: 1300},
  {name: 'Free Recycling of Old System', label: '$150 off', off: 150, at: 2100},
  {name: 'Free Basic Installation', label: 'Free Installation', off: 0, at: null},
];

function UpsellCard({t}) {
  const p = WI_P.wwhs;
  const on = PICKS.filter((k) => t >= k.at).map((k) => k.i);
  const price = p.retail + on.reduce((s, i) => s + UPSELLS[i].price, 0);
  return (
    <div style={{...wizardCard, width: 560}}>
      <StepHeader title="Choose Products" description="Select products/services for this customer"/>
      <div style={{display: 'flex', gap: 18, borderRadius: 12, border: `1px solid ${APP.border}`, overflow: 'hidden'}}>
        <div style={{width: 140, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <img loading="lazy" src={p.img} alt="" style={{maxHeight: 190, maxWidth: 120}}/>
        </div>
        <div style={{flex: 1, padding: '18px 18px 18px 0'}}>
          <span style={{display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: CAT_PILL.Softeners.bg, color: CAT_PILL.Softeners.fg, marginBottom: 6}}>{p.category}</span>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
            <div style={{fontSize: 18, fontWeight: 600, color: APP.fg, lineHeight: 1.25}}>{p.name}</div>
            <div style={{textAlign: 'right', flexShrink: 0}}>
              <div style={{fontSize: 24, fontWeight: 700, color: APP.primary, lineHeight: 1}}>{usd0(monthly(price))}<span style={{fontSize: 14, fontWeight: 500, opacity: .7}}>/mo</span></div>
              <div style={{fontSize: 12, color: APP.mutedFg, marginTop: 2, fontVariantNumeric: 'tabular-nums'}}>{usd0(price)} retail</div>
            </div>
          </div>
          <div style={{marginTop: 14, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: APP.mutedFg}}>Add-ons</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6}}>
            {UPSELLS.map((u, i) => {
              const active = on.includes(i);
              const pk = PICKS.find((k) => k.i === i);
              const press = pk && t >= pk.at - 160 && t < pk.at;
              return (
                <span key={u.name} style={{display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 999,
                  border: `1px solid ${active ? APP.primary : APP.border}`, background: active ? APP.primary10 : 'hsla(220, 15%, 94%, 0.4)',
                  color: active ? APP.primary : APP.mutedFg, transform: `scale(${press ? 0.95 : 1})`}}>
                  <Ic n={active ? 'Check' : 'Plus'} size={12}/>{u.name}<span style={{fontSize: 11, opacity: .8}}>+{usd0(u.price)}</span>
                </span>
              );
            })}
          </div>
          <div style={{marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 10, fontSize: 14, fontWeight: 500, background: APP.primary, color: '#fff'}}>
            <Ic n="Check" size={16}/> Added
          </div>
        </div>
      </div>
    </div>
  );
}

function PromosCard({t}) {
  const active = PROMOS.filter((p) => p.at != null && t >= p.at);
  return (
    <div style={{...wizardCard, width: 520}}>
      <div style={{fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: APP.primary}}>Discounts</div>
      <div style={{fontSize: 20, fontWeight: 600, color: APP.fg, marginTop: 6}}>Add promotions or discounts?</div>
      <div style={{fontSize: 13.5, color: APP.mutedFg, marginTop: 4}}>Optional — stack as many as you like.</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16}}>
        {PROMOS.map((p) => {
          const on = active.includes(p);
          const press = p.at != null && t >= p.at - 160 && t < p.at;
          return (
            <span key={p.name} style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
              border: `1px solid ${on ? APP.primary : 'transparent'}`, background: on ? APP.primary5 : 'hsla(220, 15%, 94%, 0.4)', color: on ? APP.primary : APP.mutedFg,
              transform: `scale(${press ? 0.95 : 1})`}}>
              <Ic n="Tag" size={12}/>{p.name}<span style={{opacity: .7}}>· {p.label}</span>{on && <Ic n="X" size={12}/>}
            </span>
          );
        })}
      </div>
      {active.length > 0 && (
        <div style={{fontSize: 11.5, color: APP.mutedFg, marginTop: 12}}>
          {active.length === 1 ? 'This discount applies' : `These ${active.length} discounts apply`} to the agreement and any Stripe invoice you generate.
        </div>
      )}
    </div>
  );
}

/** Illustrative analysis output — the sheet, its sections and score bands are the real component's. */
const PITCH = {
  rep: 'Jordan Ellis', score: 8,
  summary: 'Strong discovery that tied the 16 grain hardness to the softener before any price came up. The close came a few minutes late.',
  strengths: ['Opened with their own water report instead of a product pitch.', 'Anchored the monthly payment right after the total.'],
  improvements: ['Ask for the decision straight after the savings comparison.'],
  next: ['Send the customer link tonight so their spouse can see it.'],
};

function PitchSheet({t}) {
  const done = t >= 1500;
  const date = new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  const section = (icon, title, items, color, bg, at) => (
    <div style={{...rise(t, at, 10, 400), paddingTop: 14, marginTop: 14, borderTop: `1px solid hsla(220, 15%, 88%, 0.3)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{width: 24, height: 24, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Ic n={icon} size={14} color={color}/></span>
        <span style={{fontSize: 13, fontWeight: 600, color: APP.fg}}>{title}</span>
      </div>
      {items.map((it) => (
        <div key={it} style={{display: 'flex', gap: 10, marginTop: 8, paddingLeft: 4}}>
          <span style={{marginTop: 6, width: 6, height: 6, borderRadius: 999, background: color, flexShrink: 0}}/>
          <span style={{fontSize: 13, lineHeight: 1.55, color: 'hsla(216, 50%, 12%, 0.8)'}}>{it}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{width: 470, background: APP.card, borderRadius: 16, boxShadow: APP.lg, overflow: 'hidden'}}>
      <div style={{padding: '20px 22px 14px', borderBottom: `1px solid hsla(220, 15%, 88%, 0.4)`, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, hsl(213, 93%, 28%) 0%, hsl(213, 80%, 40%) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Ic n="Mic" size={18} color="#fff"/>
        </div>
        <div>
          <div style={{fontSize: 15, fontWeight: 600, color: APP.fg}}>Pitch Analysis</div>
          <div style={{fontSize: 12, color: APP.mutedFg, marginTop: 2}}>{PITCH.rep} · {date} · 6:42 PM</div>
        </div>
      </div>
      <div style={{padding: '18px 22px 22px'}}>
        {!done ? (
          <div style={{padding: '34px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center'}}>
            <div style={{width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, hsl(213, 93%, 28%) 0%, hsl(213, 80%, 40%) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Ic n="RefreshCw" size={20} color="#fff" style={{transform: `rotate(${t * 0.36}deg)`}}/>
            </div>
            <div style={{fontSize: 14, fontWeight: 600, color: APP.fg}}>Analyzing your pitch…</div>
            <div style={{fontSize: 12, color: APP.mutedFg, maxWidth: 220}}>Transcribing audio and generating feedback. This takes about 30 seconds.</div>
          </div>
        ) : (
          <>
            <div style={{display: 'flex', gap: 16, alignItems: 'flex-start', padding: 16, borderRadius: 16, background: 'hsla(220, 15%, 94%, 0.4)', border: `1px solid hsla(220, 15%, 88%, 0.4)`, ...rise(t, 1500, 10, 400)}}>
              <div style={{width: 80, height: 80, borderRadius: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(16,185,129,.15)', color: APP.emerald700, boxShadow: 'inset 0 0 0 1px rgba(16,185,129,.3)', transform: `scale(${pop(t, 1600)})`}}>
                <span style={{fontSize: 30, fontWeight: 700, lineHeight: 1}}>{PITCH.score}</span>
                <span style={{fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 4}}>Excellent</span>
              </div>
              <div>
                <div style={{fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'hsla(216, 15%, 50%, 0.7)', marginBottom: 4}}>Overall Score</div>
                <div style={{fontSize: 13, lineHeight: 1.55, color: 'hsla(216, 50%, 12%, 0.8)'}}>{PITCH.summary}</div>
              </div>
            </div>
            {section('ThumbsUp', 'What You Did Well', PITCH.strengths, '#059669', 'rgba(16,185,129,.1)', 1900)}
            {section('TrendingUp', 'Areas to Improve', PITCH.improvements, '#d97706', 'rgba(245,158,11,.1)', 2200)}
            {section('Target', 'Next Steps to Close', PITCH.next, APP.primary, APP.primary10, 2500)}
          </>
        )}
      </div>
    </div>
  );
}

function GrowBeat({beat, t}) {
  if (beat === 0) {
    const pt = pointer(t, [300, 700], [700, 470], 500, 800, 1500);
    const pt2 = pointer(t, [700, 470], [520, 500], 1600, 500, 2300);
    const cur = t < 1600 ? pt : pt2;
    return (
      <>
        <AudiencePill label="Sales Reps" side="left"/>
        <div style={{position: 'absolute', right: 30, top: 96, ...rise(t, 80)}}><Scaled s={1.32} origin="top right" width={560}><UpsellCard t={t}/></Scaled></div>
        {t < 2900 && <Cursor x={cur.x} y={cur.y} down={cur.down}/>}
      </>
    );
  }
  if (beat === 1) {
    const base = WI_P.wwhs.retail + 250;
    const off = PROMOS.filter((p) => p.at != null && t >= p.at).reduce((s, p) => s + p.off, 0);
    return (
      <>
        <ProductBleed p={WI_P.wwhs} side="right" t={t} height={560} inset={-50}/>
        <AudiencePill label="Sales Reps" side="left"/>
        <div style={{position: 'absolute', left: 36, top: 110, ...rise(t, 80)}}><Scaled s={1.3} width={520}><PromosCard t={t}/></Scaled></div>
        <div style={{position: 'absolute', left: 60, top: 470, ...rise(t, 600)}}>
          <div style={{fontSize: 15, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: APP.mutedFg}}>Today’s total</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6}}>
            {off > 0 && <span style={{fontSize: 34, fontWeight: 600, color: APP.mutedFg, textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums'}}>{usd0(base)}</span>}
            <span style={{fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', color: off > 0 ? APP.emerald700 : APP.fg, fontVariantNumeric: 'tabular-nums'}}>{usd0(base - off)}</span>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <ProductBleed p={WI_P.wwhs} side="left" t={t} height={540} inset={-130}/>
      <AudiencePill label={beat === 2 ? 'Sales Reps' : 'Owners & Managers'} side="right"/>
      <div style={{position: 'absolute', right: 40, top: 76, ...rise(t, 80)}}>
        <Scaled s={1.24} origin="top right" width={470}><PitchSheet t={beat === 2 ? Math.min(t, 1400) : 1500 + t}/></Scaled>
      </div>
    </>
  );
}

/* ═════════════════════ copy + section ═════════════════════ */
const WI_PROPS = [
  {
    key: 'onboarding', color: {solid: '#2563eb', tint: '#eff6ff', ink: '#1d4ed8'}, focus: ['left', 'right', 'left', 'right'], label: 'Quick onboarding', icon: 'Rocket', Beat: OnboardingBeat,
    title: 'Set up your account in minutes to start sending and closing proposals.',
    summary: 'A six-step Launchpad walks you from an empty workspace to a proposal wizard your reps can close with, and most of it is done for you.',
    bullets: [
      'One checklist, top to bottom: six steps and you’re ready to sell.',
      'Import your systems with photos and descriptions filled in. You just set the prices.',
      'Pick our agreement and presentation templates to go live instantly, or send us yours to customize.',
      'Connect Stripe and your financing partners, then start your first proposal.',
    ],
  },
  {
    key: 'pricing', color: {solid: '#e11d48', tint: '#fff1f2', ink: '#be123c'}, focus: ['left', 'right', 'left', 'right'], label: 'Pricing control', icon: 'SlidersHorizontal', Beat: PricingBeat,
    title: 'Protect your margin on every water system your reps sell.',
    summary: 'You set the floor and reps set their price above it, so no deal gets discounted into a loss.',
    bullets: [
      'Set a red line on any product. Only admins and managers see it.',
      'Reps can’t quote below the line. The field won’t let them.',
      'Above the line, each rep sets their own retail price, and their proposals use it.',
      'Products with no red line keep a fixed price reps can’t change.',
    ],
  },
  {
    key: 'presentation', color: {solid: '#b45309', tint: '#fffbeb', ink: '#b45309'}, focus: ['left', 'right', 'left', 'right'], label: 'In-home presentation', icon: 'Presentation', Beat: PresentationBeat,
    title: 'Give every homeowner the same winning water presentation.',
    summary: 'A guided wizard keeps every rep on your best pitch — their water, the right system, and the savings — on a tablet at the kitchen table.',
    bullets: [
      'Their ZIP’s public water report is waiting before you test. Log your own results and they take over.',
      'Build the system in front of them. The monthly payment updates at your financing rate.',
      'Show exactly what your maintenance plan covers, and what it costs each month.',
      'Close on a 20-year savings comparison against what they spend today.',
    ],
  },
  {
    key: 'virtual', color: {solid: '#7c3aed', tint: '#f5f3ff', ink: '#6d28d9'}, focus: ['right', 'left', 'right', 'right'], label: 'Virtual sales', icon: 'Send', Beat: VirtualBeat,
    title: 'Send water proposals customers sign from home.',
    summary: 'One link carries the whole pitch, so the homeowner who opens it Thursday night gets the presentation, not just a price.',
    bullets: [
      'Email the customer link straight from the proposal.',
      'No water test? They see their utility’s public EPA report, looked up from their ZIP.',
      'They compare your options and pick one from their phone.',
      'You get notified the moment they choose, and when they’re ready to sign.',
    ],
  },
  {
    key: 'grow', color: {solid: '#0e7490', tint: '#ecfeff', ink: '#0e7490'}, focus: ['right', 'left', 'right', 'right'], label: 'Upsells & coaching', icon: 'Sparkles', Beat: GrowBeat,
    title: 'Grow every ticket, and coach every rep.',
    summary: 'Add-ons and promotions are one tap away during the pitch, and every recorded appointment comes back scored with the next step to close.',
    bullets: [
      'Offer add-ons the moment a system is added. The price updates as you tap.',
      'Stack your promotions to close the gap. The agreement and invoice follow.',
      'Record the appointment, and AI transcribes and scores it in about 30 seconds.',
      'Managers see what went well, what to fix and the exact next step to close.',
    ],
  },
  {
    key: 'payments', color: {solid: '#047857', tint: '#ecfdf5', ink: '#047857'}, focus: ['left', 'left', 'right', 'left'], label: 'Payments & agreements', icon: 'FileSignature', Beat: PaymentsBeat,
    title: 'Get paid and signed before the deal goes cold.',
    summary: 'Financing, Stripe payments and a signed agreement in the same flow as the sale. Taking a check or cash? Record it and move on.',
    bullets: [
      'Customers apply with your lender, like U.S. Bank, or pay by card or bank through Stripe.',
      'Take a deposit now and collect the balance at install. Stripe confirms payment in seconds.',
      'They sign on any device. Draw it or type it, and the agreement is done.',
      'Every admin and manager hears the moment the deal closes.',
    ],
  },
];


/* ── Phone layout ──────────────────────────────────────────────────────
 * A 600×760 portrait canvas. The top half shows the beat's control (the desktop scene,
 * cropped to `box` = [x, y, width] in desktop canvas px and scaled to fit); the bottom
 * half is the equipment, fully in frame, with the beat's bullet as a caption beside it.
 */
const M = (box, product, side, pill) => ({box, product, side, pill});
const WI_MOBILE = {
  onboarding: [M([40, 92, 710], 'wwhs', 'right', 'Owners'), M([210, 96, 710], 'croPro', 'left', 'Owners'),
               M([40, 150, 710], 'vortex', 'right', 'Owners'), M([210, 96, 710], 'evolve', 'left', 'Owners')],
  pricing: [M([36, 108, 667], 'wwhs', 'right', 'Owners & Managers'), M([356, 300, 560], 'wwhs', 'left', 'Sales Reps'),
            M([44, 222, 560], 'wwhs', 'right', 'Sales Reps'), M([218, 200, 706], 'croPro', 'left', 'Sales Reps')],
  presentation: [M([36, 104, 707], 'wwhs', 'right', 'Sales Reps'), M([250, 84, 680], 'croPro', 'left', 'Sales Reps'),
                 M([36, 110, 728], 'croPro', 'right', 'Sales Reps'), M([280, 88, 650], 'wwhs', 'left', 'Sales Reps & Homeowners')],
  virtual: [M([299, 140, 605], 'wwhs', 'left', 'Sales Reps'), M([190, 64, 487], 'wwhs', 'right', 'Homeowners'),
            M([262, 40, 437], 'vortex', 'right', 'Homeowners'), M([300, 130, 616], 'wwhs', 'left', 'Sales Reps')],
  grow: [M([191, 96, 739], 'vortex', 'right', 'Sales Reps'), M([36, 110, 676], 'wwhs', 'right', 'Sales Reps'),
         M([337, 76, 583], 'wwhs', 'left', 'Sales Reps'), M([337, 76, 583], 'wwhs', 'left', 'Owners & Managers')],
  payments: [M([190, 44, 730], 'wwhs', 'right', 'Homeowners'), M([40, 170, 638], 'wwhs', 'right', 'Homeowners'),
             M([286, 76, 634], 'wwhs', 'left', 'Homeowners'), M([40, 110, 616], 'wwhs', 'right', 'Owners & Managers')],
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener('change', h) : mq.addListener(h);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', h) : mq.removeListener(h));
  }, []);
  return reduced;
}




function useWidth(ref, fallback) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setW(el.clientWidth);
    fit();
    if (!('ResizeObserver' in window)) { window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return w;
}

const wiVars = (p) => ({'--wi-solid': p.color.solid, '--wi-tint': p.color.tint, '--wi-ink': p.color.ink});

/* ── Feature grid ──────────────────────────────────────────────────────
 * Nine cards, one function each. A card plays ONE beat of an existing value-prop scene,
 * cropped to that beat's control (WI_MOBILE boxes). Cards rest on the beat's finished
 * frame and only animate while hovered (mouse) or while centred on screen (touch), so
 * at most one plays at a time.
 */
const FEATURES = [
  {prop: 'presentation', beat: 0, icon: 'Droplets',    label: 'Water test',      dy: 58,      title: 'Show them their water.',              sub: 'Their ZIP’s local water report loads on its own. Log your test and it sits right on top.'},
  {prop: 'presentation', beat: 1, icon: 'Package',     label: 'System buildout', title: 'Build the system in front of them.',  sub: 'The monthly payment updates at your financing rate as you go.'},
  {prop: 'presentation', beat: 3, icon: 'TrendingUp',  label: 'Savings',         title: 'Close on the savings.',               sub: 'A 20-year comparison against what they spend today.'},
  {prop: 'pricing',      beat: 1, icon: 'ShieldCheck', label: 'Red-line pricing', dy: -56, title: 'Nobody sells below your floor.',     sub: 'Set a red line on any product. Reps can’t quote under it.'},
  {prop: 'grow',         beat: 0, icon: 'PlusCircle',  label: 'Add-ons',         title: 'Add-ons in one tap.',                 sub: 'Offer upgrades the moment a system is added. The price updates live.'},
  {prop: 'grow',         beat: 3, icon: 'Mic',         label: 'AI coaching',     title: 'Every pitch, scored by AI.',          sub: 'Record the appointment and get a score and next steps in about 30 seconds.'},
  {prop: 'virtual',      beat: 2, icon: 'Smartphone',  label: 'Remote sales',    title: 'They choose from their couch.',       sub: 'Send one link. They compare your options and pick one from their phone.'},
  {prop: 'payments',     beat: 0, icon: 'Landmark',    label: 'Financing',       title: 'Financing right in the proposal.',    sub: 'Apply with your lender, or pay by card or bank through Stripe.'},
  {prop: 'payments',     beat: 2, icon: 'PenLine',     label: 'E-signature',     title: 'Signed on any device.',               sub: 'Draw it or type it, and the agreement is done.'},
];
const REST_T = BEAT * 0.9;          // finished state shown while a card is idle
const HOLD = 900;                   // linger on the finished state before replaying

function useCanHover() {
  const q = '(hover: hover) and (pointer: fine)';
  return !!(window.matchMedia && window.matchMedia(q).matches);
}

// Touch screens: a card plays while it sits in the middle band of the viewport.
function useCentered(ref, enabled) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), {rootMargin: '-38% 0px -38% 0px'});
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);
  return on;
}

// Loops one beat while `playing`; snaps back to the finished frame when it stops.
function useBeatLoop(playing) {
  const [t, setT] = useState(null);
  useEffect(() => {
    if (!playing) { setT(null); return; }
    let raf, start = performance.now(), last = 0;
    const tick = (now) => {
      const e = (now - start) % (BEAT + HOLD);
      if (now - last >= 33) { last = now; setT(Math.min(e, BEAT * 0.97)); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  return t;
}

function WiCard({f}) {
  const {useRef} = React;
  const prop = WI_PROPS.find(p => p.key === f.prop);
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const canHover = useCanHover();
  const [hover, setHover] = useState(false);
  const centered = useCentered(cardRef, !canHover);
  const playing = !reduced && (canHover ? hover : centered);
  const t = useBeatLoop(playing);
  const lt = t === null ? REST_T : t;
  const w = useWidth(mediaRef, 380);
  // Crop boxes were framed for the phone layout's 568×364 band; this frame is 4:3, so pad
  // the box a little and centre the control vertically.
  const [bx, by, bw] = WI_MOBILE[prop.key][f.beat].box;
  const cw = bw * 1.08;
  const x = bx - (cw - bw) / 2;
  const y = Math.max(0, Math.min(720 - cw * 0.75, by - (cw * 0.75 - bw * 364 / 568) / 2 + (f.dy || 0)));
  const k = w / cw;
  const Beat = prop.Beat;
  return (
    // `reveal` lives on a wrapper: useReveal adds `visible` to it imperatively, and a
    // className React re-renders (is-playing) would wipe that and hide the card.
    <div className="reveal wig-cell">
    <article className={`wig-card${playing ? ' is-playing' : ''}`} ref={cardRef} style={wiVars(prop)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="wig-media" ref={mediaRef} aria-hidden="true">
        <div className="wi-canvas" style={{transform: `scale(${k}) translate(${-x}px, ${-y}px)`}}>
          <WiMobile.Provider value={true}><Beat beat={f.beat} t={lt}/></WiMobile.Provider>
        </div>
        {canHover && !reduced && <span className="wig-play" title="Hover to play"><Ic n="Play" size={12}/></span>}
      </div>
      <div className="wig-body">
        <span className="wig-label"><Ic n={f.icon} size={14}/>{f.label}</span>
        <h3 className="wig-title">{f.title}</h3>
        <p className="wig-sub">{f.sub}</p>
      </div>
    </article>
    </div>
  );
}

function WhatsInside() {
  return (
    <section className="features-section v2-features" id="features">
      <div className="section-inner">
        <div className="features-header reveal">
          <div>
            <div className="eyebrow">What's inside</div>
            <h2 className="section-title">Everything your rep needs.<br/><em style={{fontStyle: 'italic', color: 'var(--navy)'}}>Even when they aren't there.</em></h2>
          </div>
          <div>
            <p className="section-sub">Every tool works in both directions — a rep driving the tablet, or a homeowner scrolling the link alone on a Tuesday night.</p>
          </div>
        </div>

        <div className="wig">
          {FEATURES.map((f) => <WiCard key={f.prop + f.beat} f={f}/>)}
        </div>

        <p className="wi-also">
          <strong>Also inside:</strong> maintenance plans, rentals, offline mode, team updates, and CRM integrations with ServiceTitan, GoHighLevel, Housecall Pro, Jobber and more
        </p>

      </div>
    </section>
  );
}

// Plan pricing mirrors /sales/checkout-v2, /sales/start and the Treat Engine,
// Inc prices in lib/stripe.js — keep them in sync when any changes.
const PRICING_PLANS = {
  starter: {month:97,  year:997},
  pro:     {month:299, year:2999},
};

function PrIco({kind}) {
  return (
    <span className={`pr-ico ${kind}`}>
      {kind === 'plus'
        ? <svg viewBox="0 0 9 9"><path d="M4.5 1.5v6M1.5 4.5h6"/></svg>
        : <svg viewBox="0 0 9 9"><polyline points="1.5,4.5 3.5,6.5 7.5,2"/></svg>}
    </span>
  );
}

function Pricing() {
  const [billing, setBilling] = useState('month');
  const [pending, setPending] = useState(null);

  const isYear = billing === 'year';
  const money = n => '$' + n.toLocaleString('en-US');
  const amountFor = key => isYear ? PRICING_PLANS[key].year : PRICING_PLANS[key].month;

  // The field tablet offer used to open a modal here first; it now runs after
  // checkout, on /sales/welcome, so an upsell can never cost us the card.
  //
  // Straight to Stripe — no opt-in step. /api/checkout picks the real price and
  // attaches the 30-day trial; the page's UTMs and click IDs ride along into the
  // Stripe session metadata, and Stripe's back link returns here.
  const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'fbclid', 'gclid'];
  const startCheckout = async key => {
    if (pending) return;
    setPending(key);
    // Clicks are told apart by this event, not by the button text — so both
    // buttons can read naturally. Filter Clarity on cta_pricing_<plan>_<interval>.
    try { if (window.clarity) window.clarity('event', `cta_pricing_${key}_${billing}`); } catch (e) {}
    const q = new URLSearchParams(window.location.search);
    const attribution = {};
    ATTRIBUTION_KEYS.forEach(k => { if (q.get(k)) attribution[k] = q.get(k); });
    const value = amountFor(key);
    // The ad signals /sales/start used to send, now fired on the buy click (before
    // the checkout request, so Stripe being slow or erroring can't drop them).
    // Google Ads "CD | Opt-in" is the YouTube campaign's primary conversion — no
    // email exists yet, so it goes out without enhanced-conversions user data.
    try {
      if (window.fbq) fbq('track', 'AddToCart', {
        content_name: 'ClearDeals ' + key, content_ids: ['cleardeals-' + key + '-' + billing],
        content_type: 'product', value, currency: 'USD',
      });
    } catch (e) {}
    try {
      if (window.gtag) gtag('event', 'conversion', {send_to: 'AW-16631843401/zwjCCIOq9YkdEMmU1_o9', value, currency: 'USD'});
    } catch (e) {}
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({service: 'sales', plan: key, interval: billing, attribution, return_path: '/sales'}),
      });
      const {url, error} = await res.json();
      if (error || !url) throw new Error(error || 'No checkout URL returned');
      try { if (window.fbq) fbq('track', 'InitiateCheckout', {content_name: 'ClearDeals ' + key}); } catch (e) {}
      window.location.href = url;
    } catch (err) {
      alert('Something went wrong starting checkout. Please try again, or contact us at Info@TreatEngine.com');
      setPending(null);
    }
  };

  // Back from Stripe restores this page from the back-forward cache with the
  // buttons still disabled — re-enable them.
  useEffect(() => {
    const reset = e => { if (e.persisted) setPending(null); };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  // Trial language is monthly-only — annual bills up front, so the button and
  // the line under it must never promise a free trial while isYear.
  const ctaFor = name => isYear ? ('Get ' + name + ' →') : ('Try ' + name + ' free →');
  // One short line under each buy button. The trial itself is said once in the
  // banner and once on the button; annual has no trial and renews up front.
  const billedFor = () => isYear ? 'Renews yearly' : 'Cancel anytime';

  const noteFor = key => {
    // The 30-day trial is monthly-only, matching /sales/checkout-v2 — annual
    // bills up front, so nothing here may promise a trial while isYear.
    if(!isYear) return <span className="pr-note-save">First 30 days free</span>;
    const perMonth = Math.round(PRICING_PLANS[key].year / 12);
    const saved = PRICING_PLANS[key].month * 12 - PRICING_PLANS[key].year;
    return (
      <>{money(perMonth)}/mo billed annually · <span className="pr-note-save">save {money(saved)}</span></>
    );
  };

  const starterFeatures = [
    {kind:'head', text:"What's included"},
    {kind:'yes',  text:<><span className="pr-lead">10 credits</span> included every month</>},
    {kind:'yes',  text:<><span className="pr-lead">Residential</span> sales flow</>},
    {kind:'lim',  text:<><span className="pr-lead">1</span> office</>},
    {kind:'lim',  text:<>Up to <span className="pr-lead">5</span> users</>},
    {kind:'yes',  text:'Unlimited products'},
    {kind:'yes',  text:'Financing & Stripe integrations'},
    {kind:'yes',  text:'Unlimited pitch recordings & AI coaching'},
    {kind:'yes',  text:'Dedicated account manager'},
  ];
  const proFeatures = [
    {kind:'head', text:'Everything in Starter, plus'},
    {kind:'yes',  text:<><span className="pr-lead">10 credits</span> included every month</>},
    {kind:'plus', text:<><span className="pr-lead">Unlimited</span> users</>},
    {kind:'plus', text:<><span className="pr-lead">Unlimited</span> offices</>},
    {kind:'plus', text:<><span className="pr-lead">Commercial</span> sales flow</>},
    {kind:'plus', text:<><span className="pr-lead">Rentals</span> catalog</>},
  ];

  const renderFeatures = feats => (
    <ul className="pr-features">
      {feats.map((f,i) => {
        if(f.kind === 'head' || f.kind === 'head-divided') {
          return <li className={`pr-feat-head${f.kind === 'head-divided' ? ' divided' : ''}`} key={i}>{f.text}</li>;
        }
        return <li key={i}><PrIco kind={f.kind}/><span>{f.text}</span></li>;
      })}
    </ul>
  );

  const plans = [
    {
      key:'starter',
      name:'Starter',
      blurb:'For residential dealers running a single office with a small team.',
      featured:false,
      features:starterFeatures,
    },
    {
      key:'pro',
      name:'Pro',
      blurb:'For dealers running multiple offices, or selling commercial and rentals.',
      featured:true,
      features:proFeatures,
    },
  ];

  return (
    <section className="pricing-section v2-pricing" id="pricing">
      <div className="pricing-inner">
        <div className="pricing-head reveal">
          <div className="eyebrow">Pricing</div>
          <h2 className="section-title">Pick a plan.<br/><em style={{fontStyle:'italic',color:'var(--navy)'}}>Quick setup.</em></h2>
          <p className="pricing-sub">Customize your account in minutes, then run your first presentation and send your first proposal.</p>
        </div>

        <div className="pr-toggle-wrap reveal">
          <div className="pr-toggle" role="group" aria-label="Billing interval">
            <button type="button" className="pr-opt" aria-pressed={!isYear} onClick={() => setBilling('month')}>Monthly</button>
            <button type="button" className="pr-opt" aria-pressed={isYear} onClick={() => setBilling('year')}>Annual</button>
          </div>
        </div>

        <div className="pr-grid reveal">
          {plans.map(p => (
            <div className={`pr-card${p.featured ? ' featured' : ''}`} key={p.key} id={`plan-${p.key}`}>
              {p.featured && <span className="pr-ribbon">Most popular</span>}
              <div className="pr-name">{p.name}</div>
              <div className="pr-for">{p.blurb}</div>

              <div className="pr-price">
                <span className="pr-amt">{money(amountFor(p.key))}</span>
                <span className="pr-per">{isYear ? '/ year' : '/ month'}</span>
              </div>
              <div className="pr-note">{noteFor(p.key)}</div>

              <button
                type="button"
                className={`pr-btn solid${pending === p.key ? ' loading' : ''}`}
                disabled={pending !== null}
                onClick={() => startCheckout(p.key)}
              >
                <span className="pr-btn-text">{ctaFor(p.name)}</span>
                <span className="pr-btn-spinner" aria-hidden="true"></span>
              </button>
              <div className="pr-btn-note">{billedFor(p.key)}</div>

              <div className="pr-divider"></div>
              {renderFeatures(p.features)}
            </div>
          ))}
        </div>

        <div className="pr-alt reveal">
          Want to see it run first? <a href="/sales/demo" target="_blank" rel="noopener">Request a 30-minute demo</a> — we'll build a proposal with your catalog and your pricing, then send you the link so you can read it the way your customers will.
        </div>

        <div className="pr-trust reveal">
          <div className="pr-trust-item">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="6"/><polyline points="5,7 7,9 10,5"/></svg>
            No setup fee
          </div>
          <div className="pr-trust-item">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="6"/><polyline points="5,7 7,9 10,5"/></svg>
            No contracts
          </div>
        </div>

        <div className="pr-foot reveal">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5"><circle cx="7" cy="7" r="6"/><path d="M7 5v3"/><circle cx="7" cy="9.5" r=".5" fill="var(--ink-muted)"/></svg>
          <span>Every plan includes 10 credits a month: 1 credit per custom presentation, agreement or install document. Need more? 10 more for $35, and credits never expire. Upgrade, downgrade or cancel any time.</span>
        </div>
      </div>
    </section>
  );
}




function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <img loading="lazy" src="treat-engine-logo-white.png" alt="Treat Engine" />
            <p>Sales & marketing growth engine for residential water treatment dealers.</p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <a href="/ads">Water Leads</a>
            <a href="/sales">Water Sales</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="/blog">Blog</a>
            <a href="/roi-calculator">Lead Gen ROI Calculator</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:Info@TreatLeads.com">Info@TreatLeads.com</a>
            <a href="tel:+16173156471">+1 (617) 315-6471</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Treat Engine. All rights reserved.</span>
          <span className="footer-copy"><a href="/privacypolicy">Privacy</a> · <a href="/termsofservice">Terms</a></span>
        </div>
        <p className="footer-disclaimer">
          Results vary based on individual sales team experience, market conditions, and implementation. Historical results or customer testimonials do not guarantee future performance.
        </p>
      </div>
    </footer>
  );
}


const FAQS = [
    {q:'How is our product catalog loaded?', a:'In a few clicks. ClearDeals comes with a growing catalog of water treatment equipment from the major brands — pick the brands you sell, import the lineup, and edit the pricing to match yours. Anything that isn\'t in the catalog yet, from your own systems to add-ons and services, you can add yourself in minutes. The same catalog drives the in-home flow and the proposals you send remotely, so there is only ever one version to keep current.'},
    {q:'How long does setup take?', a:'Minutes, not weeks. Import your equipment from our product catalog or upload your own, add your company details and logo, and ClearDeals brands your presentation and agreement for you — you can send your first proposal the same day you sign up.'},
    {q:'Does ClearDeals integrate with my CRM?', a:'Yes. ClearDeals connects with the CRMs water treatment dealers use most — ServiceTitan, GoHighLevel, Housecall Pro and Jobber — and can be integrated with just about any other CRM you run. You don\'t have to set it up yourself, either: we offer done-for-you CRM integrations, so our team connects ClearDeals to your system and your leads, proposals and signed deals land where your office already works.'},
    {q:'Can I customize my presentation and agreement?', a:'Yes — our high-converting presentation and agreement templates are automatically branded with your company details, so you can run your first appointment on day one. Want to take it a step further? Add permitting forms, your warranties and your terms — just contact support and they\'ll take care of it.'},
    {q:'Does it pull public water quality data?', a:'Yes. ClearDeals can pull local results from the EPA Water Quality Portal, so homeowners see what\'s actually in their area\'s water before you recommend a system. Already tested the home? Upload your own water test results instead, and they go straight into the proposal — the homeowner\'s own numbers, right next to the system that fixes them.'},
    {q:'What financing options does ClearDeals support?', a:'ClearDeals integrates with major home service financing providers. Monthly payment estimates calculate in real time — inside the appointment and inside the link you send — with no separate application or redirect.'},
    {q:'Can I control what my techs can discount?', a:'Absolutely. You set minimum prices per product. Techs can move within your defined range but cannot go below the floor — and the same floor applies to proposals sent from the office, so nobody discounts their way out of your margin from a desk either.'},
  ];

/* ═══════════════ /sales sections (Figma: "/sales — V2 Redesign") ═══════════════ */

const Ck = ({children}) => <li className="v2-check"><i>✓</i><span>{children}</span></li>;

function V2Head({eyebrow, l1, l2, sub, center, dark}) {
  return (
    <div className={`v2-head${center ? ' center' : ''}${dark ? ' dark' : ''}`}>
      <div className="eyebrow">{eyebrow}</div>
      <h2>{l1}{l2 && <><br/><em>{l2}</em></>}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function V2Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav className={`nav v2-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="/home"><img src="uploads/Treat Engine Logo .png" alt="Treat Engine" style={{height:30}}/></a>
        <div className="nav-links">
          <a href="/home">Home</a>
          <a href="/ads">Water Leads</a>
          <a href="/sales" className="active">Water Sales</a>
          <a href="/blog">Blog</a>
        </div>
        <div className="nav-actions">
          <a href="https://cleardeals.treatengine.com" className="nav-cta-ghost">{CTA.navLogin}</a>
          <a href="#plan-starter" className="nav-cta">{CTA.nav} →</a>
        </div>
      </div>
    </nav>
  );
}

function V2Hero() {
  return (
    <header className="v2-hero">
      <span className="v2-badge">#1 proposal &amp; sales tool for water treatment dealers</span>
      <h1>Guided water proposals that<br/><em>close up to 30% more sales</em></h1>
      <p className="v2-hero-sub">In a few clicks, pull the water quality report, lay out system and service options, visualize the savings, and handle financing, invoicing and signatures — whether you're closing at the kitchen table or remotely.</p>
      <div className="v2-hero-ctas">
        <a href="#plan-starter" className="v2-btn primary">{CTA.hero} →</a>
        <a href="#demo" className="v2-btn ghost">▶&nbsp; {CTA.heroWatch}</a>
      </div>
      <div className="v2-hero-meta">No setup fee · Cancel anytime · Live in minutes</div>
      <div className="v2-show" id="demo">
        <div className="v2-video">
          <wistia-player media-id="9aa3hagnby" aspect="1.5434083601286173"></wistia-player>
        </div>
        <div className="v2-chip signed"><i>✓</i><div><b>Agreement signed</b><span>Deposit collected · Stripe</span></div></div>
        <div className="v2-chip opened"><i>↗</i><div><b>Proposal opened</b><span>Customer journey link · 2 views</span></div></div>
      </div>
    </header>
  );
}

function V2Proof() {
  const logos = [
    ['Kinetico of SW Idaho', 'uploads/kinetico-sw-idaho.png'], ['Watersurgeon', 'uploads/watersurgeon.webp'],
    ['Miami Alkaline Water', 'uploads/miami-alkaline.webp'], ['Lux Pure Alkaline', 'uploads/lux.webp', 1],
    ['Culligan', 'uploads/culligan.webp'], ['Alka Magnum', 'uploads/alka-magnum.webp'],
    ['One Green Filter', 'uploads/one-green-filter.webp'], ['Select Source Water', 'uploads/select-source.webp', 1],
    ['Tarheel Pure Water', 'uploads/tarheel.webp', 1], ['Kevin’s Soft Water', 'uploads/kevins-soft-water.webp'],
  ];
  return (
    <section className="v2-proof">
      <div className="v2-proof-label">Trusted by water treatment dealers across the U.S.</div>
      <div className="v2-logos">
        {logos.map(([n, src, tall]) => <img loading="lazy" key={n} src={src} alt={n} title={n} className={tall ? 'tall' : ''}/>)}
      </div>
      <div className="v2-stats">
        <div className="v2-stat"><b>30%+</b><span>average lift in first-visit close rate</span></div>
        <div className="v2-stat"><b>$800+</b><span>increase in average deal value</span></div>
        <div className="v2-stat"><b>5 min</b><span>to build a full proposal</span></div>
      </div>
    </section>
  );
}

function V2Ways() {
  return (
    <section className="v2-sec white" id="ways">
      <div className="v2-in">
        <div className="v2-split">
          <V2Head eyebrow="Two ways to sell" l1="One proposal engine." l2="Two ways to close."/>
          <p>67% of water treatment sales that don't close on the first visit never close at all. ClearDeals runs the same guided proposal whether your rep is at the kitchen table or three counties away.</p>
        </div>
        <div className="v2-ways">
          <div className="v2-way">
            <div className="v2-way-media"><img loading="lazy" src="uploads/cleardeals-in-use.webp" alt="Water technician walking a homeowner through a ClearDeals proposal on a tablet"/></div>
            <div className="v2-way-body">
              <span className="v2-pill" style={{alignSelf:'flex-start',textTransform:'uppercase',letterSpacing:'.06em',fontSize:11}}>In the home</span>
              <h3>Close at the kitchen table</h3>
              <p>Your rep builds the proposal live on a tablet — water test, recommended system, savings math, financing — and asks for the sale while they're still sitting there.</p>
              <ul className="v2-checks">
                <Ck>Test results, system and price assembled in front of the homeowner</Ck>
                <Ck>Signature and deposit captured before the truck leaves</Ck>
                <Ck>Runs fully offline — basements, well houses, dead zones</Ck>
              </ul>
              <span className="v2-way-tag">At the kitchen table →</span>
            </div>
          </div>
          <div className="v2-way dark">
            <div className="v2-way-media"><img loading="lazy" src="uploads/cleardeals-remote-proposal.webp" alt="A ClearDeals proposal open on a laptop and a phone"/></div>
            <div className="v2-way-body">
              <span className="v2-pill" style={{alignSelf:'flex-start',textTransform:'uppercase',letterSpacing:'.06em',fontSize:11}}>Remote</span>
              <h3>Close from three counties away</h3>
              <p>Build it from the office and send the link. Pull the local water quality report for the address and let published utility data make the case — they walk the same sequence and sign at the bottom.</p>
              <ul className="v2-checks">
                <Ck>Public water-quality report for their address, not a sales claim</Ck>
                <Ck>Quote referrals and out-of-area homes without the drive</Ck>
                <Ck>"Let me think about it" gets the full walkthrough again</Ck>
              </ul>
              <span className="v2-way-tag">Sent, opened, signed →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function V2Audiences() {
  const A = [
    {who: 'Owners & Managers', bar: 'var(--navy)', bg: '#e8ecf5', fg: 'var(--navy)', title: 'Control the price.\nSee every deal.',
     items: ['Set a red line so no deal loses money', 'Get a heads-up the moment a deal closes', 'Coach reps with scored pitch recordings']},
    {who: 'Sales Reps', bar: 'var(--blue)', bg: 'var(--blue-light)', fg: 'var(--blue-dark)', title: 'Pitch it right.\nGet it signed.',
     items: ['Your best pitch, step by step — in person or by link', 'Prices, financing and add-ons in a few taps', 'Works offline in basements and well houses']},
    {who: 'Homeowners', bar: '#16a34a', bg: '#ecfdf3', fg: '#16a34a', title: 'A proposal that\nfinally makes sense.',
     items: ['Their own water report, not a sales claim', 'A clear monthly payment and 20-year savings', 'Sign on any device — at the table or at home']},
  ];
  return (
    <section className="v2-sec cream">
      <div className="v2-in">
        <V2Head center eyebrow="Who it's for" l1="One tool. Three people" l2="it has to win over."/>
        <div className="v2-aud">
          {A.map(a => (
            <div className="v2-aud-card" key={a.who}>
              <span className="bar" style={{background: a.bar}}/>
              <span className="v2-pill" style={{alignSelf:'flex-start', background: a.bg, color: a.fg}}>{a.who}</span>
              <h3>{a.title}</h3>
              <ul className="v2-checks">
                {a.items.map(t => <li className="v2-check" key={t}><i style={{background: a.bg, color: a.fg}}>✓</i><span>{t}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function V2Compare() {
  const rows = [
    ['A paper quote or a PDF attachment', 'One guided proposal they actually walk through'],
    ['Price changes from rep to rep', 'Your pricing, with a red line nobody can go under'],
    ['"Let me think about it"', 'Signed with a deposit — at the table or from their couch'],
    ['Financing is a phone call next week', 'Financing offered right inside the proposal'],
    ['Every rep pitches it their own way', 'Every rep runs your best pitch, step by step'],
    ['Follow-up calls nobody returns', 'They get a link, and you see when they open it'],
  ];
  return (
    <section className="v2-sec cream">
      <div className="v2-in">
        <V2Head center eyebrow="Why dealers switch" l1="Stop losing deals" l2="you should have closed."
          sub={'Most deals aren’t lost on price. They’re lost on a messy quote and a "let me think about it." Here’s what changes.'}/>
        <div className="v2-cmp">
          <div className="v2-cmp-col">
            <h3>The old way</h3>
            {rows.map(([o]) => <div className="v2-cmp-row" key={o}><i>✕</i>{o}</div>)}
          </div>
          <div className="v2-cmp-col new">
            <h3>With ClearDeals</h3>
            {rows.map(([, n]) => <div className="v2-cmp-row" key={n}><i>✓</i>{n}</div>)}
          </div>
        </div>
        <div className="v2-center-cta"><a href="#plan-starter" className="v2-btn primary">{CTA.comparison} →</a></div>
      </div>
    </section>
  );
}

/* ── Live in minutes ──────────────────────────────────────────────────────
 * The four setup steps play in order, like a quick run through sign-up: the active
 * card animates and lights up, the others rest on their finished state, and the
 * progress bar under them fills as the run goes. Hover (or tap) a card to jump to it.
 * Step 1 mirrors the brand-catalog import on /sales/start; step 2 uses the real
 * presentation-style covers (treatprezi public/presentation-styles).
 */
const STEP_DUR = [5600, 5600, 4800, 4800];
const CAT_BRANDS = [['Aerus', 'ae-wc200.webp'], ['Canopus', 'cn-200.webp'], ['Culligan', 'cul-smart-he.webp'], ['EcoWater', 'eco-ecr3700.webp']];
const CAT_PRODUCTS = [['Smart HE Softener', 'Softeners', 'cul-smart-he.webp'], ['Smart HE Twin', 'Softeners', 'cul-smart-he-twin.webp'], ['Salt-Free Conditioner', 'Conditioners', 'cul-salt-free.webp'],
  ['Smart HE Filter', 'Filters', 'cul-smart-he-filter.webp'], ['Smart RO', 'Drinking water', 'cul-smart-ro.webp'], ['Iron-Cleer', 'Filters', 'cul-iron-cleer.webp']];
const CAT_TOTAL = 25;
const STYLES = [['classic', 'Classic'], ['editorial', 'Fresh Pour'], ['bold', 'Clear & Bold'], ['marble', 'Marble'], ['ironclad', 'Ironclad']];
const LENDERS = ['foundation-finance-mark.png', 'aqua-finance-mark.png', 'goodleap-logo.jpg', 'usbank-logo.png', 'greensky-mark.png', 'synchrony-mark.png', 'service-finance-mark.png', 'wisetack-mark.png'];
const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const span = (t, a, d) => ease((t - a) / d);          // 0→1 over [a, a+d]

function StepCatalog({t}) {
  const open = t > 900 && t < 2100;
  const hl = t < 1500 ? 0 : 2;                          // highlight walks down to Culligan
  const picked = t >= 2100;
  const prep = span(t, 2300, 2500);
  const done = t >= 4900;
  const ready = Math.round(prep * CAT_TOTAL);
  return (
    <div className="sc">
      <div className={`sc-picker${picked ? ' picked' : ''}`}>
        {picked ? <img loading="lazy" src="images/catalog/cul-smart-he.webp" alt=""/> : null}
        <span className="sc-pick-txt"><b>{picked ? 'Culligan' : 'Select your brand'}</b><small>{picked ? `${CAT_TOTAL} products` : '11 major brands + independent'}</small></span>
        <span className={`sc-chev${open ? ' up' : ''}`}>⌄</span>
      </div>
      <div className="sc-list" style={{opacity: open ? 1 : 0, transform: `translateY(${open ? 0 : -6}px)`}}>
        {CAT_BRANDS.map(([n, img], i) => (
          <div className={`sc-opt${i === hl ? ' hl' : ''}`} key={n}><img loading="lazy" src={`images/catalog/${img}`} alt=""/>{n}</div>
        ))}
      </div>
      <div className="sc-preview" style={{opacity: picked ? 1 : 0.35}}>
        <div className={`sc-status${done ? ' done' : ''}`}>
          <span>{done ? `✓ ${CAT_TOTAL} products ready` : picked ? 'Preparing your catalog…' : '186 products, ready to load'}</span>
          {picked && !done && <span className="n">{ready} / {CAT_TOTAL}</span>}
        </div>
        <div className="sc-meter"><i style={{width: `${picked ? prep * 100 : 0}%`, background: done ? '#16a34a' : undefined}}/></div>
        <div className="sc-grid">
          {CAT_PRODUCTS.map(([n, c, img], i) => {
            const on = picked && prep >= (i + 1) / CAT_PRODUCTS.length - 0.02;   // tiles light up in step with the counter
            return (
              <div className={`sc-prod${on ? ' on' : ''}`} key={n}>
                <span className="ok"/>
                <div className="ph"><img loading="lazy" src={`images/catalog/${img}`} alt=""/></div>
                <b>{n}</b>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepTemplates({t}) {
  // Walk through every style, then settle back on Classic.
  const sel = t >= STEP_DUR[1] - 600 ? 0 : Math.min(STYLES.length - 1, Math.floor(t / 1000));
  return (
    <div className="stp">
      <div className="stp-main">
        {STYLES.map(([id, name], i) => (
          <img loading="lazy" key={id} src={`uploads/presentation-styles/${id}/cover-sm.jpg`} alt={`${name} presentation template`} style={{opacity: i === sel ? 1 : 0, transform: `scale(${i === sel ? 1 : 1.03})`}}/>
        ))}
        <span className="stp-name">{STYLES[sel][1]}</span>
      </div>
      <div className="stp-thumbs">
        {STYLES.map(([id], i) => <img loading="lazy" key={id} className={i === sel ? 'on' : ''} src={`uploads/presentation-styles/${id}/cover-sm.jpg`} alt=""/>)}
      </div>
      <span className="v2-ui-note">✓ Your logo &amp; brand colors applied</span>
    </div>
  );
}

function StepAgreement({t}) {
  const drop = span(t, 700, 600);
  const up = span(t, 1300, 1100);
  const fields = ['Customer name', 'Address', 'System & price', 'Signature', 'Date'];
  const ready = t >= 4000;
  return (
    <div className="sa">
      <div className={`sa-drop${t < 700 ? ' pulse' : ''}`}><span className="ic">⤒</span><b>Drop PDF or DOCX</b></div>
      <div className="v2-file" style={{opacity: drop, transform: `translateY(${(1 - drop) * -14}px)`}}>
        <span className="pdf">PDF</span>
        <div style={{flex: 1, minWidth: 0}}><b>Purchase-Agreement.pdf</b>
          <div className="sa-bar"><i style={{width: `${up * 100}%`}}/></div>
        </div>
        <span className="ok" style={{opacity: up >= 1 ? 1 : 0}}>✓</span>
      </div>
      <div className="sa-fields">
        {fields.map((f, i) => <span key={f} className={t > 2500 + i * 280 ? 'on' : ''}>✓ {f}</span>)}
      </div>
      <div className={`sa-ready${ready ? ' on' : ''}`}>{ready ? '✓ Ready for e-signature' : 'Mapping fields…'}</div>
    </div>
  );
}

function StepPayments({t}) {
  const state = t < 900 ? 0 : t < 1500 ? 1 : 2;           // connect → connecting → connected
  return (
    <div className="sp">
      <div className="v2-stripe">
        <img loading="lazy" src="uploads/whats-inside/stripe-wordmark.svg" alt="Stripe"/>
        {state === 0 && <span className="sp-btn">Connect</span>}
        {state === 1 && <span className="sp-btn busy"><i className="spin"/>Connecting</span>}
        {state === 2 && <span className="v2-conn">● Connected</span>}
      </div>
      <div className="v2-ui-label">FINANCING PARTNERS</div>
      <div className="v2-lenders">
        {LENDERS.map((l, i) => {
          const k = span(t, 1700 + i * 200, 350);
          return <span key={l} style={{opacity: k, transform: `scale(${0.7 + k * 0.3})`}}><img loading="lazy" src={`uploads/lenders/${l}`} alt=""/></span>;
        })}
      </div>
      <div className="sp-foot" style={{opacity: span(t, 3500, 400)}}>Offers show up in every proposal</div>
    </div>
  );
}

const STEP_UI = [StepCatalog, StepTemplates, StepAgreement, StepPayments];
const STEP_COPY = [
  ['Import your product catalog', 'Pick your brand and we load every system with photos and descriptions. You just set prices.'],
  ['Choose a presentation template', 'Pick a ready-made, branded presentation — your logo and colors applied automatically — or send us yours.'],
  ['Upload your agreement', 'Drop in your purchase agreement and we map the fields — or go live instantly on the ClearDeals Standard agreement.'],
  ['Connect Stripe & financing', 'Link Stripe for deposits and invoices, then add the lenders you already work with.'],
];

function V2Steps() {
  const {useRef} = React;
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);
  const [t, setT] = useState(0);
  const tRef = useRef(0), aRef = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {threshold: 0.3});
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!inView || reduced) return;
    let raf, last = performance.now(), acc = 0;
    const tick = (now) => {
      const dt = Math.min(64, now - last); last = now;
      tRef.current += dt;
      if (tRef.current >= STEP_DUR[aRef.current] + 700) { tRef.current = 0; aRef.current = (aRef.current + 1) % 4; setActive(aRef.current); }
      acc += dt; if (acc >= 33) { acc = 0; setT(tRef.current); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);
  const go = (i) => { aRef.current = i; tRef.current = 0; setActive(i); setT(0); };
  const fill = reduced ? 1 : (active + Math.min(1, t / STEP_DUR[active])) / 4;
  return (
    <section className="v2-sec white" id="get-started" ref={ref}>
      <div className="v2-in">
        <div className="v2-split">
          <V2Head eyebrow="Getting started" l1="Live in minutes." l2="First proposal same day."/>
          <p>No implementation project, no waiting on us. Sign up, follow four quick steps, and start building, sending and closing proposals within minutes.</p>
        </div>
        <div className="v2-steps">
          {STEP_UI.map((UI, i) => {
            const on = !reduced && i === active;
            const st = on ? t : STEP_DUR[i];          // idle cards rest on their finished state
            return (
              <div className={`v2-step${on ? ' on' : ''}`} key={i} onMouseEnter={() => !reduced && i !== active && go(i)} onClick={() => !reduced && go(i)}>
                <div className="v2-step-ui"><UI t={st}/></div>
                <div className="v2-step-body"><span className="v2-step-num">{i + 1}</span><h3>{STEP_COPY[i][0]}</h3><p>{STEP_COPY[i][1]}</p></div>
              </div>
            );
          })}
        </div>
        <div className="v2-strip">
          <span>Sign up</span><span className="track"><span style={{width: `${fill * 100}%`}}/></span><span>First proposal sent — same day</span>
          <a href="#plan-starter" className="v2-btn light" style={{padding:'11px 18px',fontSize:14}}>{CTA.steps} →</a>
        </div>
      </div>
    </section>
  );
}

function V2Integrations() {
  // Logos of the software ClearDeals connects to. Real connection paths only: a built-in
  // CRM webhook, a public API and webhooks (with GoHighLevel / Zapier / n8n guides);
  // the rest connect through Zapier or the API, set up for the dealer. Add a logo here
  // only once there is a working way to connect it.
  const tools = [
    ['servicetitan.svg', 'ServiceTitan'],
    ['housecall-pro.webp', 'Housecall Pro', 'dim'],
    ['jobber.svg', 'Jobber'],
    ['highlevel.svg', 'HighLevel'],
    ['zapier.svg', 'Zapier'],
    ['hubspot.svg', 'HubSpot'],
  ];
  return (
    <section className="v2-sec cream" id="integrations">
      <div className="v2-in">
        <V2Head center eyebrow="Integrations" l1="Works with the software" l2="you already run."
          sub="Leads come in from your CRM. Signed deals go back to it."/>
        <div className="v2-integ-grid">
          {tools.map(([f, name, cls]) => (
            <div className="v2-integ" key={name}><img loading="lazy" src={`uploads/integrations/${f}`} alt={name} className={cls || ''}/></div>
          ))}
        </div>
        <div className="v2-integ-foot">Running something else? We'll connect it through our API or webhooks. <a href="/sales/demo" target="_blank" rel="noopener" className="v2-btn ghost" style={{padding:'10px 16px',fontSize:14}}>{CTA.integrations} →</a></div>
      </div>
    </section>
  );
}

function V2Results() {
  return (
    <section className="v2-sec cream" style={{paddingTop: 110, paddingBottom: 110}}>
      <div className="v2-in">
        <div className="v2-quote">
          <div>
            <div className="mark">“</div>
            <blockquote>It's a game changer. This is what dealers and the industry have been missing.</blockquote>
            <div className="v2-who">
              <span className="logo"><img loading="lazy" src="uploads/select-source.webp" alt="Select Source Water"/></span>
              <div><b>Ryan Neill</b><span>Select Source Water</span></div>
            </div>
          </div>
          <div className="v2-metrics">
            <div className="v2-metric"><b>30%+</b><span>first-visit close rate lift</span></div>
            <div className="v2-metric"><b>$800+</b><span>higher average deal</span></div>
            <div className="v2-metric"><b>5 min</b><span>to a full proposal</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function V2FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="v2-sec cream" id="faq">
      <div className="v2-in v2-faq">
        <div className="v2-faq-left">
          <V2Head eyebrow="Common questions" l1="Questions about" l2="ClearDeals."/>
          <p>Still deciding? See it run with your own catalog and pricing.</p>
          <a href="/sales/demo" target="_blank" rel="noopener" className="v2-btn ghost" style={{padding:'11px 18px',fontSize:14}}>{CTA.faqDemo} →</a>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span className="faq-q-text">{f.q}</span>
                <svg className="faq-icon" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function V2Final() {
  return (
    <section className="v2-final" id="book">
      <div className="v2-final-card">
        <div>
          <img src="uploads/cleardeals-logo-white.png" alt="ClearDeals by Treat Engine" className="v2-final-logo" width="345" height="143"/>
          <h2>Turn every proposal<br/><em>into an install.</em></h2>
          <p>Five minutes at the kitchen table, or one link to an address nobody is driving to.</p>
          <ul className="v2-checks">
            <Ck>Branded proposal — at the table or as a link</Ck>
            <Ck>E-signature, financing &amp; deposits</Ck>
            <Ck>Live on your device in minutes</Ck>
            <Ck>30-day results guarantee</Ck>
          </ul>
        </div>
        <div className="v2-final-go">
          <a href="#plan-starter" className="v2-btn primary">{CTA.final} →</a>
          <span>30 days free · No setup fee · Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}

// ── Social proof: dealers on ClearDeals ──────────────────────────────────────
// Bottom-left on desktop, just above the sticky CTA on phones. Real dealerships from
// ClearDeals' public `signup-feed` edge function, shuffled, with no dates or totals:
// the point is "dealers like you (maybe your competitor) are on this", not our numbers.
const SIGNUP_FEED = 'https://ykplghimbbnakdojrpfm.supabase.co/functions/v1/signup-feed';
const SP_FIRST = 3000;     // first toast 3s after load
const SP_SHOW = 6500;      // on screen
const SP_GAP = 9000;       // quiet time between toasts
const SP_MAX = 6;          // per visit, so it never nags
const SP_DISMISS_KEY = 'te-signup-toast-off';

const SP_JOINED = ['Recently joined ClearDeals', 'Just signed up for ClearDeals', 'Started closing with ClearDeals'];
const SP_UPGRADED = ['Just upgraded their plan', 'Recently upgraded their plan', 'Upgraded to a paid plan'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function buildToasts({dealers = []}) {
  return dealers.map(d => ({...d, line: pick(d.upgraded ? SP_UPGRADED : SP_JOINED)}));
}

function DealerLogo({src, name}) {
  const [broken, setBroken] = React.useState(!src);
  return (
    <span className="sp-logo">
      {broken
        ? <b aria-hidden="true">{(name || '?').trim().charAt(0).toUpperCase()}</b>
        : <img src={src} alt="" onError={() => setBroken(true)}/>}
    </span>
  );
}

function SignupToast() {
  const [items, setItems] = React.useState([]);
  const [index, setIndex] = React.useState(-1);
  const [open, setOpen] = React.useState(false);
  const [off, setOff] = React.useState(() => {
    try { return sessionStorage.getItem(SP_DISMISS_KEY) === '1'; } catch { return false; }
  });
  const hover = React.useRef(false);
  const mounted = React.useRef(performance.now());

  React.useEffect(() => {
    if (off) return;
    const ctl = new AbortController();
    // Tiny cached JSON; fetched once React has painted the hero.
    fetch(SIGNUP_FEED, {signal: ctl.signal})
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setItems(buildToasts(d)); })
      .catch(() => {});   // decoration only: no feed, no toast
    return () => ctl.abort();
  }, [off]);

  React.useEffect(() => {
    if (off || !items.length) return;
    const shown = Math.min(SP_MAX, items.length);
    let i = -1, timer;
    const next = () => {
      i += 1;
      if (i >= shown) return;
      setIndex(i); setOpen(true);
      const hide = () => {
        if (hover.current) { timer = setTimeout(hide, 800); return; }
        setOpen(false);
        timer = setTimeout(next, SP_GAP);
      };
      timer = setTimeout(hide, SP_SHOW);
    };
    timer = setTimeout(next, Math.max(0, SP_FIRST - (performance.now() - mounted.current)));
    return () => clearTimeout(timer);
  }, [items, off]);

  if (off || index < 0) return null;
  const item = items[index];
  const dismiss = () => {
    setOpen(false); setOff(true);
    try { sessionStorage.setItem(SP_DISMISS_KEY, '1'); } catch {}
  };

  return (
    <aside className={'sp-toast' + (open ? ' is-open' : '')} aria-label="Dealers using ClearDeals" aria-hidden={!open}
      onMouseEnter={() => { hover.current = true; }} onMouseLeave={() => { hover.current = false; }}>
      <DealerLogo src={item.logo} name={item.name}/>
      <div className="sp-body">
        <span className="sp-eyebrow">Water dealer{item.state ? ` · ${item.state}` : ''}</span>
        <b className="sp-title">{item.name}</b>
        <span className="sp-meta"><i className="sp-dot" aria-hidden="true"/>{item.line}</span>
      </div>
      <button type="button" className="sp-close" onClick={dismiss} aria-label="Hide signup notifications" tabIndex={open ? 0 : -1}>
        <Ic n="X" size={14}/>
      </button>
    </aside>
  );
}

function App() {
  useReveal();
  return (
    <>
      <V2Nav/>
      <V2Hero/>
      <V2Proof/>
      <V2Ways/>
      <V2Audiences/>
      <WhatsInside/>
      <V2Compare/>
      <V2Steps/>
      <V2Integrations/>
      <V2Results/>
      <Pricing/>
      <V2FAQ/>
      <V2Final/>
      <Footer/>
      <SignupToast/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
// Deep links like /sales#pricing (used by the home page trial button): the
// section only exists once React has rendered, so the browser's own jump on
// load finds nothing. Scroll to it after the first paint.
if (location.hash.length > 1) {
  const jump = (tries) => {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) el.scrollIntoView();
    else if (tries > 0) setTimeout(() => jump(tries - 1), 100);
  };
  requestAnimationFrame(() => jump(30));
}
