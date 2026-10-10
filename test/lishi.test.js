const fs = require('fs');
const path = require('path');
const vm = require('vm');

// End-to-end for lishi-finder.html (the search-first tool). After the fix it
// must load the full 5-tranche catalogue and resolve records from every
// segment (cars, HGV/agri, bikes, newer) through the dropdown stepper.

const ROOT = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'lishi-finder.html'), 'utf8');
const main = page.match(/<script>\n([\s\S]*?)(?:\n\s*)<\/script>/);
if (!main) throw new Error('main inline script not found on lishi-finder.html');

const DB_FILES = [
    'services/car-database.js',
    'services/trucks-agri-db.js',
    'services/bikes-atv-db.js',
    'services/current-gen-db.js',
    'services/newer-vehicles-db.js',
];

function stubElement() {
    const el = {
        options: [],
        disabled: false,
        value: '',
        textContent: '',
        dataset: {},
        style: {},
        className: '',
        children: [],
        classList: {
            toggle() {},
            add() {},
            remove() {},
        },
        add(o) { el.options.push(o.value); },
        addEventListener(t, f) { el._listeners[t] = f; },
        dispatch(t) { if (el._listeners[t]) el._listeners[t].call(el); },
        appendChild(c) { el.children.push(c); },
        _listeners: {},
    };
    Object.defineProperty(el, 'innerHTML', {
        get() { return el._html || ''; },
        set(v) { el._html = v; el.options = []; },
    });
    return el;
}

let queue = [];
const sandbox = {
    document: {
        getElementById(id) {
            if (!sandbox._els) sandbox._els = {};
            if (!sandbox._els[id]) sandbox._els[id] = stubElement();
            return sandbox._els[id];
        },
        createElement() { return stubElement(); },
    },
    Option: function (text, value) { return { text, value }; },
    console,
    setTimeout(f) { queue.push(f); },
};
vm.createContext(sandbox);

for (const f of DB_FILES) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
vm.runInContext(main[1], sandbox, { filename: 'lishi-finder.html (inline)' });

// run any deferred/polled work queued by the init guard
while (queue.length) {
    const run = queue;
    queue = [];
    run.forEach((f) => f());
}
if (queue.length) throw new Error('init did not settle');

let failures = 0;
const check = (name, pass, detail) => {
    console.log((pass ? '  PASS  ' : '  FAIL  ') + name + (detail ? ' — ' + detail : ''));
    if (!pass) failures++;
};

const makes = sandbox._els.makeSelect.options;
check('make dropdown populated (95 makes)', makes.length >= 90, makes.length + ' makes');

function simulateDropdown(make) {
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
        resultShown: els.resultBox.style.display === 'block',
        lishi: els.lishiResult.textContent,
        lockProfileShown: els.lockProfile.style.display === 'block',
    };
}

let resolved = 0;
for (const make of ['Citroen', 'MAN', 'Yamaha', 'BYD']) {
    const r = simulateDropdown(make);
    if (!r) { check(make + ' stepper resolves', false, 'unreachable'); continue; }
    check(make + ' stepper resolves full 5-tranche data', r.resultShown && r.lishi.length > 0,
        r.model + ' → ' + r.lishi);
    resolved++;
}

check('all four tranches resolvable in dropdown mode', resolved === 4, resolved + '/4');

// Smart search must match vehicles that only exist in tranches this page
// previously did NOT load (bikes, newer models) as well as the older ones.
const filterInput = sandbox._els.filterInput;
for (const q of ['Yamaha', 'BYD', 'MAN']) {
    sandbox._els.liveResults.children = [];
    filterInput.value = q;
    filterInput.dispatch('input');
    const matched = sandbox._els.liveResults.children.length > 0;
    check('smart search finds "' + q + '"', matched, sandbox._els.liveResults.children.length + ' cards');
}

console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'ALL LISHI-FINDER CHECKS PASSED'));
process.exit(failures ? 1 : 0);