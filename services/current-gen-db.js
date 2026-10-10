// ============================================================
// CURRENT-GENERATION HGV & AGRI — a second tranche on top of
// trucksAgriDb.js, covering the newest cab platforms and the
// higher-horsepower agri machines that came after that file was
// researched.
//
// Separate file on purpose. trucksAgriDb.js carries per-record
// lock research (lockType, lockCode, blank, pickable, conf) keyed
// by make, and it also runs a normalisation pass that rewrites
// every "N/A" Lishi value to "No Lishi tool". Injecting records
// into its literal risks breaking that research block, so these
// live here and merge in afterwards instead.
//
// SHAPE: identical to carDatabase.js and trucksAgriDb.js —
// make -> model -> yearRange -> record. The live search, the
// make/model/year dropdowns, the result card and the Quote price
// guide all walk three levels, so a record must carry its own
// year-range key or it silently never matches.
//
// MUST load AFTER both carDatabase.js and trucksAgriDb.js — this
// file merges last so its newer models win over the older records
// of the same make while leaving trucksAgriDb's researched lock
// profile fields intact (per-field values already set on a record
// are never overwritten by the shared base).
//
// HONESTY RULE (identical to trucksAgriDb.js): where an exact
// chip/tool is not certain the entry stays advisory. New-generation
// cabs have no published Lishi chart, so every record here says
// "No Lishi tool" and routes the locksmith to read the keyway off
// the existing key — exactly as the existing file does. The
// mechanical side is genuinely in scope: euro-profile cab
// cylinders pick and override without a dedicated tool.
//
// PRICING follows the HGV/Agri bands already in the catalogue
// (cab key £80-£160, lost-all/AKL £180-£480). Newer and
// multiplexed cabs sit at the top of that band because the coding
// route is more often dealer-only and the labour is longer.
// Advisory — confirm before pricing a job.
// ============================================================

const CURRENT_GEN_BASE = {
    segment: "HGV",
    lishi: "No Lishi tool",
    silca: "N/A",
    ic: "N/A",
    xhorse: "N/A",
    module: "Multiplexed cab body electronics",
    location: "Cab interior — behind dash trim, driver footwell or B-pillar",
    access: "Cab trim removal. On a high-roof or aerodynamic cab, move the seat fully forward and work low — never lever the A-pillar.",
    entry: "Euro-profile pin-tumbler cab cylinder. Standard automotive picks under light tension, or an override, open the mechanical lock — the mechanical entry is yours. Coded key programming is the part that needs maker access.",
    battery: "Under-cab tray, often dual batteries. Isolate the chassis earth before touching terminals.",
    battType: "Typically 2x 12V HGV-grade AGM",
    fobBatt: "CR2032",
    fobNote: "A flat fob battery mimics a lock fault on multiplexed cabs — replace the cell before deeper diagnosis.",
    blankNote: "Maker-specific blade. Cut from code or a dealer/fleet blank — cheap aftermarket blades fail fast in a heavy handle."
};

const CURRENT_GEN_AGRI_BASE = Object.assign({}, CURRENT_GEN_BASE, {
    segment: "Agri",
    module: "Cab multiplexed controllers (dash / roof console)",
    location: "Inside cab, behind console or under roof trim",
    access: "Cab ladder-up entry; console trim panels",
    battery: "Single heavy-duty 12V AGM under bonnet or side pod. Isolate before service.",
    battType: "12V heavy-duty AGM (100Ah+ class)",
    entry: "Cab door cylinders are small pin-tumbler locks on every modern machine — standard picks under light tension open them in seconds and no dedicated tractor tool exists (Lishi's range is automotive only). Read the stamped code off the key bow for cutting."
});

const CURRENT_GEN_DB = {

    // ================================================================
    // HGV — current / next-generation cabs
    // ================================================================

    "Scania": {
        "R/S/G (Next-Gen)": {
            "2017 - Present (Next-Gen Cab)": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £95-£160 | Lost key / AKL from £250-£420",
                chip: "Encrypted transponder cab key — PIN via Scania dealer by VIN",
                warning: "⚠️ Next-gen Scania has no published Lishi chart. Read the keyway off the existing key before quoting. Lost-all keys are a dealer or specialist-rig job.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        }
    },

    "DAF": {
        "XF (New Generation)": {
            "2018 - Present (New-Gen Cab)": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £90-£160 | Lost key / AKL from £230-£380",
                chip: "Encrypted transponder cab key — PIN via PACCAR/DAF dealer by VIN",
                warning: "⚠️ New-gen XF shares the XG cab architecture but is not charted to a Lishi keyway in Lishi's own DAF range. Read the barrel before ordering.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        },
        "XG / XG+": {
            "2021 - Present (New Generation)": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £90-£160 | Lost key / AKL from £230-£380",
                chip: "Encrypted transponder cab key — PIN via PACCAR/DAF dealer by VIN",
                warning: "⚠️ Newest PACCAR platform. No published Lishi tool. Confirm the chassis variant before ordering blanks or chips.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        }
    },

    "Volvo": {
        "FH/FM/FH Aero (Current Gen)": {
            "2019 - Present": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £95-£165 | Lost key / AKL from £280-£450",
                chip: "Encrypted transponder cab key — VIN-coded via Volvo dealer or specialist rig",
                warning: "⚠️ Volvo keys are VIN-coded. Lishi's VOLVO-VNL-2024 covers the VNL, not the FH/FM — read the keyway before quoting. Expect a dealer or rig coding route.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        }
    },

    "MAN": {
        "TGX/TGS (Current Gen)": {
            "2020 - Present": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £90-£150 | Lost key / AKL from £220-£380",
                chip: "Encrypted transponder cab key — PIN via MAN dealer by VIN",
                warning: "⚠️ MAN publishes no dedicated Lishi tool; later trucks are laser-coded via dealer. VAG HU66/HU162 is sometimes listed online for MAN but is not documented well enough to rely on.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        }
    },

    "Iveco": {
        "S-Way / X-Way / T-Way": {
            "2019 - Present": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £90-£150 | Lost key / AKL from £220-£360",
                chip: "Encrypted transponder cab key — PIN via Iveco dealer by VIN",
                warning: "⚠️ S/X/T-Way is a newer generation than the Stralis — the Euro VI move brought a new keyway. Read the code off the existing key.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        }
    },

    "Mercedes-Benz": {
        "Actros/Arocs (Current Gen)": {
            "2019 - Present (MP5 / MP6 Cab)": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £95-£160 | Lost key / AKL from £250-£420",
                chip: "Encrypted transponder cab key — PIN via Mercedes dealer by VIN",
                warning: "⚠️ Current-gen Actros/Arocs cabs are beyond the documented HU64 coverage. Mechanical entry is fine with picks; coding is a dealer or rig job.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        }
    },

    "Renault Trucks": {
        "T / C / K (Current Gen)": {
            "2019 - Present": Object.assign({}, CURRENT_GEN_BASE, {
                "price": "Cab key £85-£150 | Lost key / AKL from £200-£350",
                chip: "Encrypted transponder cab key — PIN via Renault Trucks dealer by VIN",
                warning: "⚠️ No published Lishi tool for current-gen Renault Trucks. Read the keyway off the existing key before quoting.",
                risk: "MODERATE-HIGH — dealer or rig route"
            })
        }
    },

    // ================================================================
    // AGRI — high-horsepower and current-generation machines
    // ================================================================

    "John Deere": {
        "8R / 9R (Gen4 & Gen5)": {
            "2018 - Present (Gen4 / Gen5)": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £95-£160 | Lost key / AKL from £250-£450",
                chip: "Encrypted transponder cab key — PIN via John Deere by machine serial",
                warning: "⚠️ Gen4/Gen5 cabs are multiplexed with an operator-display-locked PIN. Coded keys normally go via dealer by serial number. Mechanical cab entry is standard picks.",
                risk: "MODERATE-HIGH — dealer route"
            })
        }
    },

    "Fendt": {
        "700/800/900/1000 Gen7": {
            "2019 - Present (Gen7)": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £95-£165 | Lost key / AKL from £280-£480",
                chip: "Highly restricted Fendt keyset — coded keys via Fendt dealer",
                warning: "⚠️ Fendt treats its keyset as a security item and will not supply blanks to the trade. Gen7 cabs are multiplexed — expect a dealer route for lost keys.",
                risk: "HIGH — restricted keyset, dealer route"
            })
        }
    },

    "Claas": {
        "Axion / Arion / Lexion (Current Gen)": {
            "2018 - Present": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £90-£150 | Lost key / AKL from £230-£400",
                chip: "Encrypted transponder cab key — PIN via Claas dealer by machine serial",
                warning: "⚠️ Combines (Lexion) route coding through Claas Parts & Service. Read the keyway off the existing key — no dedicated tractor tool exists.",
                risk: "MODERATE-HIGH — dealer route"
            })
        }
    },

    "New Holland": {
        "T7/T8 / CR Combines (Current Gen)": {
            "2018 - Present": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £90-£150 | Lost key / AKL from £220-£380",
                chip: "Encrypted transponder cab key — PIN via New Holland dealer by serial",
                warning: "⚠️ CR combine cabs are multiplexed and the PIN is dealer-held. Mechanical entry is standard picks; coding is a dealer job.",
                risk: "MODERATE-HIGH — dealer route"
            })
        }
    },

    "Case IH": {
        "Puma / Optum / Magnum (Current Gen)": {
            "2018 - Present": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £90-£150 | Lost key / AKL from £220-£380",
                chip: "Encrypted transponder cab key — PIN via Case IH dealer by serial",
                warning: "⚠️ Current-gen cabs are multiplexed. Read the keyway off the existing key before quoting — no dedicated tractor tool exists.",
                risk: "MODERATE-HIGH — dealer route"
            })
        }
    },

    "Valtra": {
        "Q / N Series (5th Gen)": {
            "2019 - Present (5th Gen)": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £85-£150 | Lost key / AKL from £200-£350",
                chip: "Encrypted transponder cab key — PIN via Valtra dealer by serial",
                warning: "⚠️ Shares the AGCO/CNH platform with Case IH New Holland — parts and blanks are often interchangeable, coding is not. Verify the machine before quoting.",
                risk: "MODERATE-HIGH — dealer route"
            })
        }
    },

    "Massey Ferguson": {
        "5S / 6S / 7S / 8S": {
            "2019 - Present": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £85-£150 | Lost key / AKL from £200-£350",
                chip: "Encrypted transponder cab key — PIN via Massey Ferguson dealer by serial",
                warning: "⚠️ AGCO platform, same keyset family as Valtra. Read the keyway off the existing key before quoting.",
                risk: "MODERATE-HIGH — dealer route"
            })
        }
    },

    "JCB": {
        "Fastrac 4000/8000 & Loadall (Current Gen)": {
            "2018 - Present": Object.assign({}, CURRENT_GEN_AGRI_BASE, {
                "price": "Cab key £80-£140 | Lost key / AKL from £180-£320",
                chip: "JCB smart keyset — dealer-coded",
                warning: "⚠️ JCB will not supply the coded keyset to the trade. Mechanical cab and door cylinders are standard picks; the smart key is a dealer job.",
                risk: "MODERATE-HIGH — restricted keyset, dealer route"
            })
        }
    }
};

// Deep-merge into the master catalogue. Per-field values already on
// a record always win over the shared base, so the lock research in
// trucksAgriDb.js survives: these records fill in new models and
// override prices where that is the point, but they never blank out
// a researched field.
function __svaDeepMergeCurrentGen(target, source) {
    Object.keys(source).forEach(function (k) {
        const sv = source[k];
        if (sv && typeof sv === 'object' && !Array.isArray(sv) &&
            target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
            __svaDeepMergeCurrentGen(target[k], sv);
        } else {
            target[k] = sv;
        }
    });
}
if (typeof carDatabase !== 'undefined') {
    Object.keys(CURRENT_GEN_DB).forEach(function (make) {
        if (carDatabase[make]) __svaDeepMergeCurrentGen(carDatabase[make], CURRENT_GEN_DB[make]);
        else carDatabase[make] = CURRENT_GEN_DB[make];
    });
}
