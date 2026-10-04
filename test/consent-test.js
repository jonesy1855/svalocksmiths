// Executes each page's real inline consent script against a stubbed DOM to see
// whether "Enable Map" ends up with a working click handler.
const fs = require('fs');

const PAGES = [
    'preview.html',
    'locksmith-telford.html',
    'locksmith-oswestry.html',
    'locksmith-whitchurch.html',
];

function extractConsentScript(html) {
    // The consent block is the inline script containing sva_cookie_consent.
    const blocks = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
        .map((m) => m[1])
        .filter((s) => s.includes('sva_cookie_consent'));
    return blocks[blocks.length - 1] || '';
}

function run(page, storedConsent, { hasBanner }) {
    const html = fs.readFileSync(page, 'utf8');
    const code = extractConsentScript(html);
    if (!code) return { page, storedConsent, hasBanner, error: 'NO SCRIPT FOUND' };

    const listeners = {};
    const listenersOn = {};
    const shown = {};

    const mk = (id) =>
        id ? {
            style: {},
            setAttribute() {},
            getAttribute() { return 'https://maps.google.com/?q=x'; },
            addEventListener(ev, fn) { (listenersOn[id] = listenersOn[id] || []).push(ev); listeners[id + ':' + ev] = fn; },
            click() { if (listeners[id + ':click']) listeners[id + ':click'](); },
        } : null;

    const ids = ['cookie-banner', 'accept-cookies', 'decline-cookies', 'map-placeholder', 'placeholder-accept', 'google-map-iframe'];
    const els = {};
    for (const id of ids) {
        // Town pages ship no banner and no accept/decline buttons at all -
        // only the map placeholder. Model that faithfully.
        const bannerOnly = ['cookie-banner', 'accept-cookies', 'decline-cookies'];
        if (!hasBanner && bannerOnly.includes(id)) { els[id] = null; continue; }
        els[id] = mk(id);
    }

    const store = {};
    if (storedConsent !== null) store.sva_cookie_consent = storedConsent;

    const document = {
        getElementById: (id) => (id in els ? els[id] : null),
        addEventListener(ev, fn) { listeners[ev] = fn; },
        querySelectorAll: () => [],
        querySelector: () => null,
        querySelectorAllSafe: () => [],
    };

    let error = null;
    try {
        new Function('document', 'window', 'localStorage', code)(
            document,
            { addEventListener() {} },
            { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } }
        );
        if (listeners['DOMContentLoaded']) listeners['DOMContentLoaded']();
    } catch (e) {
        error = e.message;
    }

    return {
        page,
        storedConsent: storedConsent === null ? '(none - first visit)' : storedConsent,
        hasBanner: hasBanner ? 'yes' : 'NO',
        error,
        enableMapHandler: !!listeners['placeholder-accept:click'],
        acceptHandler: !!listeners['accept-cookies:click'],
    };
}

const rows = [];
for (const p of PAGES) {
    rows.push(run(p, null, { hasBanner: p === 'preview.html' }));
    rows.push(run(p, 'declined', { hasBanner: p === 'preview.html' }));
    rows.push(run(p, 'accepted', { hasBanner: p === 'preview.html' }));
}

for (const r of rows) {
    console.log(
        `${r.page.padEnd(26)} consent=${String(r.storedConsent).padEnd(20)} banner=${r.hasBanner.padEnd(3)} ` +
        `EnableMapBtn=${r.enableMapHandler ? 'WORKS' : 'DEAD '} ` +
        `error=${r.error ? r.error : 'none'}`
    );
}