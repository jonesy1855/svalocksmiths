// Executes the shared consent module against each page's real markup, with a
// stubbed DOM, to confirm the consolidated logic behaves identically on every
// page. Element presence is derived from the actual HTML so a page missing the
// banner/buttons is modelled honestly.
const fs = require('fs');

const PAGES = [
    'preview.html',
    'locksmith-telford.html',
    'locksmith-shrewsbury.html',
    'locksmith-oswestry.html',
    'locksmith-whitchurch.html',
    'locksmith-market-drayton.html',
    'locksmith-shawbury.html',
];

const CONSENT_JS = 'assets/js/consent.js';

function requestsGoogle(src) {
    return typeof src === 'string' && /google\.com\/maps|maps\.google/.test(src);
}

function hasElement(html, id) {
    return new RegExp(`id="${id}"`).test(html);
}

function makeEl(id, log) {
    return {
        id,
        style: {},
        attrs: {},
        listeners: {},
        _src: '',
        get src() { return this._src; },
        set src(v) { this._src = v; },
        setAttribute(k, v) { this.attrs[k] = v; },
        getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
        removeAttribute(k) { delete this.attrs[k]; },
        addEventListener(ev, fn) { this.listeners[ev] = fn; },
        click() { if (this.listeners.click) this.listeners.click({ preventDefault() {} }); },
        scrollIntoView() {},
    };
}

function build(html, stored) {
    const log = [];
    const domReady = [];
    const store = {};
    if (stored) store.sva_cookie_consent = stored;

    const IDS = ['cookie-banner', 'accept-cookies', 'decline-cookies',
        'map-placeholder', 'placeholder-accept', 'google-map-iframe', 'cookie-settings'];

    const els = {};
    for (const id of IDS) els[id] = hasElement(html, id) ? makeEl(id, log) : null;

    // Seed the real data-src so loadMap has something to promote.
    const dm = html.match(/id="google-map-iframe"[\s\S]{0,200}?data-src="([^"]+)"/);
    if (dm && els['google-map-iframe']) els['google-map-iframe'].attrs['data-src'] = dm[1];

    const document = {
        readyState: 'loading',
        getElementById: (id) => (id in els ? els[id] : null),
        addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') domReady.push(fn); },
    };

    const localStorage = {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = v; },
        removeItem: (k) => { delete store[k]; },
    };

    const code = fs.readFileSync(CONSENT_JS, 'utf8');
    let error = null;
    try {
        new Function('document', 'window', 'localStorage', 'navigator', code)(
            document, { location: { replace() {} } }, localStorage, {}
        );
        domReady.forEach((fn) => fn());
    } catch (e) {
        error = e.message;
    }

    return { els, store, log, error, document, domReady };
}

let failures = 0;
function check(name, pass, detail) {
    if (!pass) failures++;
    console.log(`   ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
}

for (const file of PAGES) {
    const html = fs.readFileSync(file, 'utf8');
    const hasMap = hasElement(html, 'google-map-iframe');
    console.log(`\n=== ${file}${hasMap ? '' : '  (no map on this page)'}`);

    // --- 1. Fresh visitor: nothing stored, nothing should be requested.
    {
        const t = build(html, null);
        check('no script error on load', !t.error, t.error || '');
        if (hasMap) {
            check('no Google request before consent', !requestsGoogle(t.els['google-map-iframe'].src));
            check('placeholder visible', t.els['map-placeholder'].style.display !== 'none');
        }
        // --- 2. Clicking Enable Map must work even with no banner on the page.
        if (t.els['placeholder-accept']) {
            t.els['placeholder-accept'].click();
            check('Enable Map stores consent', t.store.sva_cookie_consent === 'accepted');
            if (hasMap) {
                check('map loads after Enable Map', requestsGoogle(t.els['google-map-iframe'].src));
                check('placeholder hidden after load', t.els['map-placeholder'].style.display === 'none');
            }
        } else {
            console.log('   --   no Enable Map button on this page');
        }
        // --- 3. Return visit with consent accepted: map should load straight away.
        const t2 = build(html, 'accepted');
        check('no script error on return visit', !t2.error, t2.error || '');
        if (hasMap) check('map auto-loads when already accepted', requestsGoogle(t2.els['google-map-iframe'].src));
    }

    // --- 4. Declined visitor: map must stay blocked.
    {
        const t = build(html, 'declined');
        check('no script error when declined', !t.error, t.error || '');
        if (hasMap) {
            check('no Google request when declined', !requestsGoogle(t.els['google-map-iframe'].src));
            check('placeholder still shown when declined', t.els['map-placeholder'].style.display === 'flex');
        }
    }

    // --- 5. Cookie Settings must withdraw consent and reload nothing.
    if (t0(html)) {
        const t = build(html, 'accepted');
        t.els['cookie-settings'].click();
        check('Cookie Settings clears consent', t.store.sva_cookie_consent === undefined);
        if (hasMap) {
            check('no Google request after withdraw', !requestsGoogle(t.els['google-map-iframe'].src));
            check('prompt returns on withdraw', t.els['map-placeholder'].style.display === 'flex');
        }
    } else {
        console.log('   --   no Cookie Settings link on this page');
    }
}

function t0(html) { return hasElement(html, 'cookie-settings'); }

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures ? 1 : 0);