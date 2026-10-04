// Behavioural check: consent is stored -> Cookie Settings clears it, re-shows the
// prompt, and unloads the map. Then "Enable Map" must load it again.
const fs = require('fs');

function extract(html, marker) {
    const blocks = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
        .map((m) => m[1])
        .filter((s) => s.includes(marker));
    return blocks[blocks.length - 1] || '';
}

function makeEl(id, log) {
    return {
        id,
        style: {},
        attrs: {},
        listeners: {},
        _src: '',
        get src() { return this._src; },
        set src(v) { this._src = v; log.push(`set-src:${id}=${v ? String(v).slice(0, 40) : '(empty)'}`); },
        setAttribute(k, v) { this.attrs[k] = v; },
        getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
        removeAttribute(k) { delete this.attrs[k]; },
        addEventListener(ev, fn) { this.listeners[ev] = fn; },
        click() { if (this.listeners.click) this.listeners.click({ preventDefault() {} }); log.push(`click:${id}`); },
        scrollIntoView() {},
    };
}

function scenario(page, hasBanner) {
    const html = fs.readFileSync(page, 'utf8');
    const log = [];
    const domReady = [];

    const store = {};
    const els = {};
    const bannerOnly = ['cookie-banner', 'accept-cookies', 'decline-cookies'];
    for (const id of ['cookie-banner', 'accept-cookies', 'decline-cookies', 'map-placeholder', 'placeholder-accept', 'google-map-iframe', 'cookie-settings']) {
        if (!hasBanner && bannerOnly.includes(id)) { els[id] = null; continue; }
        els[id] = makeEl(id, log);
    }

    // Seed the real data-src from the markup so loadMap() has something to move.
    const dm = html.match(/id="google-map-iframe"[\s\S]{0,200}?data-src="([^"]+)"/);
    if (dm && els['google-map-iframe']) els['google-map-iframe'].attrs['data-src'] = dm[1];

    const document = {
        readyState: 'loading',
        getElementById: (id) => (id in els ? els[id] : null),
        addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') domReady.push(fn); },
        querySelectorAll: () => [],
        querySelector: () => null,
    };

    const localStorage = {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = v; log.push(`set:${k}=${v}`); },
        removeItem: (k) => { delete store[k]; log.push(`remove:${k}`); },
    };

    const run = (code, tag) => {
        try {
            new Function('document', 'window', 'localStorage', code)(document, { location: { replace() {} } }, localStorage);
        } catch (e) {
            log.push(`ERROR(${tag}): ${e.message}`);
        }
    };

    // Page's own inline consent script.
    run(extract(html, 'sva_cookie_consent'), 'inline');
    // Shared withdrawal control.
    run(fs.readFileSync('assets/js/consent-settings.js', 'utf8'), 'consent-settings');
    domReady.forEach((fn) => { try { fn(); } catch (e) { log.push(`ERROR(domready): ${e.message}`); } });

    // --- Visitor arrives with consent already accepted, map loaded.
    store.sva_cookie_consent = 'accepted';
    const results = {};

    // Re-run inline so loadMap() reflects the accepted state.
    store.sva_cookie_consent = 'accepted';
    run(extract(html, 'sva_cookie_consent'), 'inline-accepted');
    domReady.slice().forEach((fn) => { try { fn(); } catch (e) { log.push(`ERROR: ${e.message}`); } });

    const iframe = els['google-map-iframe'];
    results.mapLoadedAfterAccept = iframe && iframe.src ? 'YES' : 'NO (expected on pages with no map)';

    // --- Now click "Cookie Settings".
    if (els['cookie-settings']) els['cookie-settings'].click();
    results.consentCleared = store.sva_cookie_consent === undefined ? 'YES' : 'NO (' + store.sva_cookie_consent + ')';
    results.mapSrcAfterReset = iframe && iframe.src ? 'STILL LOADED' : 'REMOVED';
    results.promptVisible = (els['map-placeholder'] && els['map-placeholder'].style.display === 'flex') ||
        (els['cookie-banner'] && els['cookie-banner'].style.display === 'flex') ? 'YES' : 'NO';

    // --- Click Enable Map again: should work and restore consent.
    if (els['placeholder-accept']) els['placeholder-accept'].click();
    results.remapWorks = store.sva_cookie_consent === 'accepted' && iframe.src ? 'YES' : 'NO';

    return { page, ...results, log };
}

for (const p of ['preview.html', 'locksmith-telford.html', 'locksmith-shawbury.html']) {
    const r = scenario(p, p === 'preview.html');
    console.log(`\n--- ${p}`);
    for (const k of ['mapLoadedAfterAccept', 'consentCleared', 'mapSrcAfterReset', 'promptVisible', 'remapWorks']) {
        console.log(`   ${k.padEnd(22)} ${r[k]}`);
    }
    const errs = r.log.filter((l) => l.startsWith('ERROR'));
    if (errs.length) console.log('   ERRORS:', errs.join(' | '));
}