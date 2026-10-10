const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Loads the full vehicle catalogue exactly as services/all-keys-lost.html does:
// car-database.js must come first, then each tranche self-merges into carDatabase.
const FILES = [
    'services/car-database.js',
    'services/trucks-agri-db.js',
    'services/bikes-atv-db.js',
    'services/current-gen-db.js',
    'services/newer-vehicles-db.js',
];

const context = {};
vm.createContext(context);

let failures = 0;
const check = (name, pass, detail) => {
    console.log((pass ? '  PASS  ' : '  FAIL  ') + name + (detail ? ' — ' + detail : ''));
    if (!pass) failures++;
};
const head = (label) => console.log('\n' + label);

for (const f of FILES) {
    const abs = path.join(__dirname, '..', f);
    if (!fs.existsSync(abs)) {
        check('missing ' + f, false);
        process.exit(1);
    }
    const src = fs.readFileSync(abs, 'utf8');
    if (src.includes('\u0000')) check(f + ' null bytes', false);
    vm.runInContext(src, context, { filename: f });
}

const probe = vm.runInContext(`
(function () {
    const makes = Object.keys(carDatabase);
    const recordCount = function (make) {
        let n = 0;
        const models = carDatabase[make] || {};
        for (const m of Object.keys(models)) {
            for (const y of Object.keys(models[m])) n++;
        }
        return n;
    };
    const totalRecords = makes.reduce((s, m) => s + recordCount(m), 0);
    return { makes, recordCount, totalRecords };
})()
`, context);

const { makes, recordCount, totalRecords } = probe;

head('catalogue integrity');
check('carDatabase defined', Array.isArray(makes) && makes.length > 0, makes.length + ' makes');
check(
    'car makes present (Cars tranche)',
    ['Citroen', 'Ford', 'BMW', 'Mercedes-Benz', 'Toyota', 'Vauxhall / Opel'].every((m) => makes.includes(m))
);
check('total vehicles covered', totalRecords >= 800, totalRecords + ' model/year records');

head('tranche merges');
const hasAgriOrTruck = makes.filter((m) =>
    /MAN|Scania|DAF|Renault Trucks|Iveco|Case|New Holland|John Deere|Massey|CLAAS|CNH|Fendt|McCormick|Steyr|Kubota|JCB/.test(m)
);
check('HGV / trucks + agri merged', hasAgriOrTruck.length >= 3, hasAgriOrTruck.slice(0, 8).join(', '));
const bikeMakes = makes.filter((m) =>
    /Yamaha|Kawasaki|KTM|Aprilia|Triumph|Moto Guzzi|Harley|Guzzi|Ducati|Indian|Royal Enfield/i.test(m)
);
check('bikes / ATV merged', bikeMakes.length >= 2, bikeMakes.slice(0, 6).join(', '));
check(
    'newer vehicles merged (BYD / Omoda / Jaecoo)',
    ['BYD', 'Omoda', 'Jaecoo', 'MG', 'Smart'].some((m) => makes.includes(m))
);

head('record shape');
const shape = vm.runInContext(`
(function () {
    const flat = [];
    for (const make of Object.keys(carDatabase)) {
        for (const model of Object.keys(carDatabase[make] || {})) {
            for (const year of Object.keys(carDatabase[make][model] || {})) {
                flat.push({ make, model, year, r: carDatabase[make][model][year] });
            }
        }
    }
    const withLishi = flat.find((e) => e.r && typeof e.r.lishi === 'string' && e.r.lishi.length > 0);
    const bikeRec = flat.find((e) => /Yamaha|Kawasaki|KTM/.test(e.make));
    const agriRec = flat.find((e) => /Case|John Deere|Massey|New Holland/.test(e.make));
    return {
        withLishi: !!withLishi,
        bike: bikeRec ? { make: bikeRec.make, model: bikeRec.model, keys: Object.keys(bikeRec.r).length } : null,
        agri: agriRec ? { make: agriRec.make, keys: Object.keys(agriRec.r).length } : null,
    };
})()
`, context);

check('sample record has lishi', shape.withLishi);
check('bike record resolvable', !!shape.bike, shape.bike ? shape.bike.make + ' / ' + shape.bike.model + ' (' + shape.bike.keys + ' fields)' : 'none');
check('agri record resolvable', !!shape.agri, shape.agri ? shape.agri.make + ' (' + shape.agri.keys + ' fields)' : 'none');

console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'ALL DATABASE CHECKS PASSED'));
process.exit(failures ? 1 : 0);