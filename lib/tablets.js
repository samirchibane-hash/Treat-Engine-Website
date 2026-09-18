/**
 * ClearDeals field tablet — the Lenovo Idea Tab 11" + folio keyboard bundle.
 *
 * The offer moved OUT of a pre-checkout modal and INTO /sales/welcome, so this
 * file is all that's left of the old checkout/tablet-upsell.js: the two numbers
 * the offer is made of, in one place, readable from Node.
 *
 *   api/verify-session.js  hands both to the welcome page, so the page never
 *                          hardcodes them and can't drift from the server.
 *   api/tablet-order.js    enforces STOCK as an order ceiling, and refuses to
 *                          charge at all if the live Stripe price disagrees
 *                          with PRICE below.
 */

// Units we can ship next business day. This is a PER-ORDER CEILING and the
// number the page quotes in "Only N left" — it does NOT count down as orders
// come in. Lower it by hand and redeploy as stock sells through, or the page
// will keep promising next-day shipping on tablets that are gone.
const STOCK = 14;

// Display price, in whole dollars. The amount actually charged always comes
// from STRIPE_PRICE_TABLET_BUNDLE; api/tablet-order.js compares the two and
// fails the order rather than charging a number the dealer was never shown.
const PRICE = 299;

module.exports = { STOCK, PRICE };
