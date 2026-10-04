const fs = require('fs');
const path = require('path');

const files = [];
(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (['node_modules', '.git', 'test'].includes(e.name)) continue;
        const fp = path.join(d, e.name);
        e.isDirectory() ? walk(fp) : e.name.endsWith('.html') && files.push(fp);
    }
})('.');

let bad = 0;
const note = (m) => { console.log(m); bad++; };

for (const f of files) {
    const h = fs.readFileSync(f, 'utf8');

    if (h.includes('\u0000')) note('NULL BYTES: ' + f);

    const so = (h.match(/<script\b/gi) || []).length;
    const sc = (h.match(/<\/script>/gi) || []).length;
    if (so !== sc) note('SCRIPT TAG MISMATCH: ' + f + ' (' + so + '/' + sc + ')');

    // Any href/src that is local must resolve on disk.
    const refs = [...h.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
    for (const raw of refs) {
        if (/^(https?:|mailto:|tel:|#|data:|javascript:|\/\/)/.test(raw)) continue;
        if (raw.includes('${')) continue;
        const clean = raw.split('#')[0].split('?')[0];
        if (!clean) continue;
        const target = clean.startsWith('/') ? clean.slice(1) : path.join(path.dirname(f), clean);
        if (!fs.existsSync(target)) note('BROKEN REF: ' + f + ' -> ' + raw);
    }

    // Inline JS must parse; JSON-LD must be valid JSON.
    for (const m of h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
        const attrs = m[1];
        const body = m[2];
        if (/\ssrc=/.test(attrs)) continue;
        if (/application\/ld\+json/.test(attrs)) {
            try { JSON.parse(body); } catch (e) { note('BAD JSON-LD: ' + f + ' ' + e.message); }
            continue;
        }
        if (!body.trim()) continue;
        try { new Function(body); } catch (e) { note('JS SYNTAX: ' + f + ' ' + e.message); }
    }
}

if (bad) {
    console.log('\n' + bad + ' problem(s)');
    process.exit(1);
}
console.log('All ' + files.length + ' pages clean: no null bytes, balanced script tags, '
    + 'no broken links/assets, all inline JS parses, all JSON-LD valid.');