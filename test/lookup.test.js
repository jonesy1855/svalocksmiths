const fs = require('fs');
const path = require('path');
const vm = require('vm');

// End-to-end: proves that visiting services/all-keys-lost.html lets a visitor
// pick make -> model -> year across ALL tranches (cars, HGV/agri, bikes, newer)
// and see the full spec card — with no Stripe paywall and no login gate.

const ROOT = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'services/all-keys-lost.html'), 'utf8');

const main = page.match(/<script>\n([\s\S]*?)\n<\/script>/);
if (!main) throw new Error('main inline script not found on all-keys-lost.html (expects `<script>` block)');

const DB_FILES = [
    'services/car-database.js',
    'services/trucks-agri-db.js',
    'services/bikes-atv-db.js',
    'services/current-gen-db.js',
    'services/newer-vehicles-db.js',
];

function stubSelect() {
    const el = {
        options: [],
        disabled: false,
        value: '',
        style: {},
        add(o) { el.options.push(o.value); },
        addEventListener(t, f) { el._listeners[t] = f; },
        dispatch(t) { if (el._listeners[t]) el._listeners[t].call(el); },
        _listeners: {},
    };
    // mirror real <select>: setting innerHTML replaces the option children
    Object.defineProperty(el, 'innerHTML', {
        get() { return el._html || ''; },
        set(v) {
            el._html = v;
            el.options = []; // empty <select> drops all <option>s
        },
    });
    return el;
}

const sandbox = {
    document: {
        getElementById(id) {
            if (!sandbox._els) sandbox._els = {};
            if (!sandbox._els[id]) sandbox._els[id] = stubSelect();
            return sandbox._els[id];
        },
    },
    Option: function (text, value) { return { text, value }; },
    console,
};
vm.createContext(sandbox);

for (const f of DB_FILES) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
vm.runInContext(main[1], sandbox, { filename: 'all-keys-lost.html (inline)' });

let failures = 0;
const check = (name, pass, detail) => {
    console.log((pass ? '  PASS  ' : '  FAIL  ') + name + (detail ? ' — ' + detail : ''));
    if (!pass) failures++;
};

function simulate(make) {
    const els = sandbox._els;
    if (!els.makeSelect.options.includes(make)) return null;
    els.makeSelect.value = make;
    els.makeSelect.dispatch('change');
    if (!els.modelSelect.options.length) return null;
    const model = els.modelSelect.options[0];
    els.modelSelect.value = model;
    els.modelSelect.dispatch('change');
    if (!els.yearSelect.options.length) return null;
    const year = els.yearSelect.options[0];
    els.yearSelect.value = year;
    els.yearSelect.dispatch('change');
    return {
        model,
        year,
        html: els.lockedDataSection.innerHTML,
        display: els.lockedDataSection.style.display,
    };
}

const TRANSCHES = ['MAN', 'Yamaha', 'BYD', 'Citroen']; // HGV/agri, bikes, newer vehicles, cars

console.log('make dropdown: ' + sandbox._els.makeSelect.options.length + ' makes');
let rendered = 0;
for (const make of TRANSCHES) {
    const st = simulate(make);
    if (!st) { check(make + ' selectable', false, 'make/model/years rebuilt'); continue; }
    const fullCard = /Transponder|Instacode|Module|A\/C/.test(st.html);
    const noPaywall = !/stripe|buy\.|Unlock|£4\.99|£19\.99|Sign in|🔐|🔒|purchas/i.test(st.html);
    const shown = st.display === 'block';
    check(make + ' renders full free card', shown && fullCard && noPaywall,
        (shown ? 'shown' : 'NOT shown') + (fullCard ? '' : ', missing specs') + (noPaywall ? '' : ', paywall remnants'));
    if (st) rendered++;
}

check(
    'all tranches reachable without login',
    rendered === TRANSCHES.length && sandbox._els.makeSelect.options.length >= 90,
    rendered + '/' + TRANSCHES.length + ' lookups rendered; ' + sandbox._els.makeSelect.options.length + ' makes'
);

console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'ALL LOOKUP CHECKS PASSED'));
process.exit(failures ? 1 : 0);