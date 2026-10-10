// ============================================================
// MOTORCYCLES, SCOOTERS, ATV & UTV — the two-wheeler /
// powersports side of the catalogue.
//
// Separate file on purpose. carDatabase.js and trucksAgriDb.js
// carry per-record lock research keyed by make, and both run
// normalisation passes over their own literals. Injecting records
// into those files risks breaking that research, so these live
// here and merge in afterwards instead.
//
// SHAPE: identical to carDatabase.js and trucksAgriDb.js —
// make -> model -> yearRange -> record. The live search, the
// make/model/year dropdowns, the result card and the Quote price
// guide all walk three levels, so a record must carry its own
// year-range key or it silently never matches.
//
// MUST load AFTER carDatabase.js and trucksAgriDb.js. This file
// merges last, so it can add bike models to makes that already
// exist for cars (Honda, Yamaha, Suzuki, BMW) or tractors (Kubota,
// John Deere). ONLY genuinely new makes are created (Vespa,
// Piaggio, Kawasaki, Polaris, Can-Am...).
//
// ---------------------------------------------------- ONE MAKE PER BRAND
// Do NOT split a brand across makes. Honda is not "Honda",
// "Honda (Scooters)" and "Honda (Motorcycles)" — that fragments one
// brand across three dropdown entries and makes the customer pick
// "which Honda" before the job is even quoted. Honda's bikes go
// into the existing `Honda` make alongside its cars, exactly as
// Mercedes-Benz already holds both A-Class and Actros, and John
// Deere holds both tractors and Gators.
//
// A duplicate make key in the object literal below would be
// silently DROPPED by JavaScript (last one wins), taking every
// model in the earlier block with it. One key per brand, grouped
// in one place. If you add a new brand that already exists above
// here, ADD TO THE EXISTING BLOCK instead of opening a new one.
//
// Scooter / Motorcycle / ATV is NOT a make-level distinction — it
// lives in each record's `segment` field, which is what the pricing
// bands and the result card actually read. So Kymco's MXU (a
// maxi-scooter, not a quad) sits under `Kymco` with segment
// "Scooter", and CFMOTO can carry both bikes and quads under one
// brand name.
//
// ---------------------------------------------------- THE BIG ONE
// BIKES DO NOT HAVE AN OBD SOCKET. There is no J1962 port under
// the dash. Programming a bike key means going to the maker's
// diagnostic connector — usually a 2-pin or 3-pin plug under the
// seat, behind a side panel or under the tank — and for anything
// immobiliser-related, a harness onto the ECU/immobiliser module
// itself. Every record below says so in `access` rather than
// sending a locksmith looking for a car socket. Expect tank-off
// or seat-off labour, not plug-in labour, so the quote has to
// carry access time.
//
// ---------------------------------------------------- HONESTY RULE
// Same rule as the rest of the catalogue: no invented tooling.
// There is no dedicated Lishi or Silca decoder for motorcycle
// cylinders. What IS true, and is stated on each record:
//   - The steering-head locks are small euro-profile wafer
//     cylinders. Ordinary automotive picks and a wafer decoder
//     open them under light tension, or use the override. The
//     mechanical entry is genuinely the locksmith's.
//   - The key BLANKS are brand-specific and are the real cost
//     driver. Honda, Kawasaki, Suzuki, BMW, Harley, Triumph and
//     Ducati all use their own blanks; aftermarket copies vary.
//   - Lockless / smart bikes (Harley Smart Key, Ducati, Triumph,
//     BMW keyless, KTM keyless) are maker-tool or dealer jobs.
//     Say so instead of implying an on-site cut.
//   - Lost-all-keys on these is a referral job far more often
//     than it is a bench job.
//
// PRICING: two-wheelers are cheap, quick jobs and are priced like
// it. Mechanical bike and scooter keys are £25-£70, nowhere near
// the car's £120-£220 band, and smart/keyless machines are the
// only ones that reach the £150-£300 range. Advisory — confirm
// before pricing a job.
// ============================================================

// Common to all bikes: no A/C data is set, and the card renderer
// guards every A/C field, so two-wheelers simply show none.
const BIKE_BASE = {
    segment: "Motorcycle",
    lishi: "No Lishi tool",
    silca: "N/A",
    ic: "N/A",
    xhorse: "N/A",
    module: "Ignition switch / steering-head lock, seat lock, luggage locks. Immobiliser ECU where fitted",
    location: "Steering head under the top yoke and instrument cluster; immobiliser ECU under the seat or in front of the tank",
    access: "Bikes have NO OBD socket. The maker's diagnostic connector is normally a 2-pin or 3-pin plug under the seat, behind a side panel or under the tank. Immobiliser work needs a harness onto the ECU, so expect seat-off or tank-off time and price the access, not just the key.",
    entry: "Steering lock is a small euro-profile wafer cylinder — standard automotive picks under light tension, or the override, will open it. Seat, tank and topbox locks are usually cheap enough to replace rather than decode.",
    battery: "Under-seat or under-tank 12V battery, often a sealed AGM with a terminal cover",
    battType: "12V AGM (common sizes YTZ6V / YT12B)",
    fobBatt: "CR2032 or coin cell",
    fobNote: "On smart bikes a flat fob cell reads as an immobiliser fault and stops the engine cranking. Fit a fresh cell before any deeper diagnosis.",
    blankNote: "Brand-specific blade. Order the correct blank by reading the existing key — aftermarket copies of bike blanks vary badly in depth and will bind."
};

const SCOOTER_BASE = Object.assign({}, BIKE_BASE, {
    segment: "Scooter",
    module: "Ignition switch / steering-head lock, seat lock and underseat cubby lock. Immobiliser ECU on later models",
    location: "Steering head behind the legshield trim; ECU in the underseat tray on most modern scooters",
    access: "No OBD socket. Underseat diagnostic connector on most modern scooters, reached by lifting the seat. Immobiliser programming needs a harness to the underseat ECU — usually a tidy job once the seat is off, no tank removal.",
    entry: "Small euro-profile wafer steering lock — automotive picks or override open it. Underseat cubby locks are almost always cheaper to replace than decode.",
    battery: "Underseat tray, often under a floor panel",
    battType: "12V AGM (YTX7L / YTZ6V common)",
    fobNote: "Scooters with a remote start or keyless start often use a CR2025/CR2032 in the fob. A weak cell mimics a fault."
});

const ATV_BASE = Object.assign({}, BIKE_BASE, {
    segment: "ATV / UTV",
    module: "Handlebar ignition switch / steering lock, seat lock and cargo-bed lock. Transponder or coded key on newer machines",
    location: "Handlebar console or steering column; ECU under the front rack, under the seat or behind the dash",
    access: "No OBD socket. Diagnostic connector is usually a 2-pin or 3-pin plug under the front rack or behind the dash panel. Coded-key work needs a harness to the ECU. Note the VIN — most manufacturers require it to release a replacement key code.",
    entry: "Small euro-profile or square-key ignition lock — automotive picks, a small decoder or the override will open it. Cargo-bed and glovebox locks are cheap to replace.",
    battery: "Under the front rack, seat or fender panel",
    battType: "12V AGM (common on Polaris/Can-Am is YT14B / 12N7)",
    fobNote: "Coded fob batteries fail and read as an immobiliser fault. Check the cell first.",
    blankNote: "Many ATVs take a generic square or euro-profile blade, but coded machines need the correct transponder blank AND the maker's key code."
});

// Smart / keyless / maker-tool-only machines
const BIKE_SMART = Object.assign({}, BIKE_BASE, {
    risk: "HIGH — maker tool or dealer",
    entry: "Physical steering lock is still a small wafer cylinder and opens to picks or an override. What is not locksmith work is the coded key / fob pairing — that needs the maker's tool."
});

const BIKES_ATV_DB = {

    // =========================================================
    // HONDA — scooters, motorcycles and quads all under the one
    // existing Honda make. Highest-volume two-wheeler brand in
    // the UK, so this block is deliberately the biggest.
    // =========================================================
    "Honda": {
        "PCX125": {
            "1999 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £30-£60 | New lock + keys £90-£140",
                chip: "Mechanical on most; HISS immobiliser on later models",
                warning: "⚠️ Enormous UK volume — a lost PCX key is a bread-and-butter bench job. Honda sells the cut code by VIN at any dealer, so lost-all keys is recoverable without the customer having kept a tag.",
                risk: "LOW — mechanical, dealer code available",
                blankNote: "Honda 4-pin bike blank. The PCX has used more than one profile — always read the existing key."
            })
        },
        "Vision / SH125 (Scoopy)": {
            "1999 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £30-£60 | New lock + keys £90-£140",
                chip: "Mechanical, with HISS on newer variants",
                warning: "⚠️ Honda cut code is available from any dealer by VIN, so this is a recoverable job even with all keys lost. Read the blank off the existing key — the profile changed between generations.",
                risk: "LOW — mechanical, dealer code available"
            })
        },
        "Forza 125 / PCX 160 (Immobiliser era)": {
            "2021 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £55-£95 | Lost all keys £130-£200",
                chip: "HISS immobiliser — transponder key, coded via the underseat connector",
                warning: "⚠️ HISS-equipped Honda scooter. No OBD port — underseat diagnostic connector or a harness to the immobiliser ECU. HISS codes are dealer-issued by VIN. Keyless variants have no spare key at all — it is a fob pairing job.",
                risk: "MODERATE-HIGH — HISS coding needs Honda access"
            })
        },
        "Fireblade / CBR / Forza": {
            "2004 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£70 | New lock + keys £100-£160",
                chip: "Mechanical on the older models; HISS immobiliser on the modern Fireblade, CBR650 and Forza",
                warning: "⚠️ HISS is the thing to check first on a modern Honda. If the bike has HISS, the key must be cut and the HISS unit programmed at the diagnostic connector or via a harness. Honda issues the cut code by VIN at any dealer, so a lost-all job is recoverable.",
                risk: "MODERATE — HISS on 2009+",
                blankNote: "Honda bike blank (4-pin and 5-pin variants both in use)."
            })
        },
        "Monkey / Dax / Cub / CT125 (Small & Classic)": {
            "1970 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£60 | New lock + keys £85-£135",
                chip: "Mechanical — the classic small-capacity Honda range",
                warning: "⚠️ A cult UK classic and still very much in demand. Mechanical and simple, so a spare is a bench cut. For the oldest bikes the original keys are frequently lost and Honda's 3-5 digit code is needed — obtainable from a dealer by frame number. Expect paint and chrome to be fragile on a Monkey/Dax, so lever carefully and protect the surfaces.",
                risk: "LOW — mechanical, dealer code available",
                blankNote: "Honda small-capacity bike blank; older Hondas can need a narrower profile than modern stock."
            })
        },
		"Africa Twin / NC750 / CB500 / Transalp (Adventure & Commuter)": {
            "2012 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £55-£95 | Lost all keys £140-£220",
                chip: "HISS transponder on most (ID46 / ID47); Smart Key fob on 2020+ top-spec Africa Twin / X-ADV / Forza 750",
                warning: "⚠️ Huge UK commuter and adventure volume. Check whether it is a bladed HISS ignition or a keyless Smart knob before quoting. Bladed HISS models use theHON66/HON70 style profile and program via the red 4-pin/6-pin underseat diagnostic connector. Honda dealers will supply the mechanical key code by VIN.",
                risk: "MODERATE — HISS coding or Smart Key pairing",
                blankNote: "Honda HON66 / HON70 profile on modern wave-key ignitions; older CB/NC models use standard edge-cut."
            })
        },
        "Goldwing / NT1100 (Touring & Smart Key)": {
            "2006 - Present": Object.assign({}, BIKE_SMART, {
                price: "Spare key/fob £140-£260 | Lost all keys £220-£360",
                chip: "HISS bladed transponder (2006-2017) | Smart Key proximity fob (2018+)",
                warning: "⚠️ 2018+ Goldwing is full proximity Smart Key — requires a 6-pin diagnostic adapter or bench read of the Smart Control Unit (SCU) if all fobs are lost. Heavy pannier and fairing trim to strip if going to the SCU; factor strip time into any AKL quote.",
                risk: "MODERATE-HIGH — expensive fobs and deep trim on AKL",
                blankNote: "Emergency mechanical blade for panniers/seat release on 2018+."
            })
        },
		"CBF / Hornet / VFR / Varadero / Transalp (Early HISS & Carb Era)": {
            "1996 - 2013": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£75 | Lost all keys £110-£180",
                chip: "Mechanical on 1990s models; early HISS (ID46) from ~1999 onwards",
                warning: "⚠️ Massive UK commuter and courier fleet (Hornet 600, CBF600/1000, VFR800). Check the dash for the HISS light. Very common callout is a key snapped or seized inside the fuel tank cap — NEVER force a Honda tank cap with the key blade, pick and press the cap down firmly to relieve spring pressure on the latch.",
                risk: "LOW on mechanical | MODERATE on early HISS",
                blankNote: "Honda HON58R / HON63FP long-blade profile."
            })
        },
        "CG125 / CBF125 / CB125F / CB125R / MSX125 Grom (Learner 125s)": {
            "1998 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £25-£55 | Lost all keys £85-£140",
                chip: "Mechanical — Honda's learner 125cc geared bikes almost never carry HISS",
                warning: "⚠️️ Bread-and-butter UK CBT and delivery bikes. Almost entirely pure mechanical with no transponder, even on the modern fuel-injected CB125F and Grom. Watch out for the magnetic anti-tamper shutter on newer CB125F ignition barrels.",
                risk: "LOW — pure mechanical, high volume",
                blankNote: "Honda HON70 (wave/laser) on newer Grom/CB125R; standard edge-cut on CG/CBF125."
            })
        },
		"Pan European (ST1100 / ST1300) & Deauville (NT650V / NT700V)": {
            "1998 - 2016": Object.assign({}, BIKE_BASE, {
                price: "Spare key £45-£85 | Lost all keys £130-£210",
                chip: "Mechanical on ST1100; HISS transponder (ID46) on ST1300 and NT700V",
                warning: "⚠️ Classic UK blood-bike and touring fleet. Common pitfall: pannier and top-box locks are often keyed alike to the ignition, but replacement boxes may have separate keys. The pannier barrels use fewer wafers than the ignition. If decoding from a pannier lock on an AKL job, you'll need to impression the remaining wafers for the ignition barrel.",
                risk: "LOW on ST1100 | MODERATE on ST1300/NT700 (HISS)",
                blankNote: "Honda HON58R / HON63FP long blank. Standard car blanks will foul on the deep recess."
            })
        },
        "ATV (Rancher / Foreman / Pioneer / TRX)": {
            "2004 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare key £40-£75 | New lock + keys £110-£175",
                chip: "Mechanical on most; coded key on the newest Rancher and TRX",
                warning: "⚠️ Honda's quad and UTV range, mostly mechanical. The newest machines take a coded key and Honda requires the VIN to release the code. If all keys are lost on a mechanical quad, the ignition lock gets replaced — price it that way.",
                risk: "LOW-MODERATE — mechanical on most",
                blankNote: "Honda quad blank."
            })
        }
    },

    // =========================================================
    // YAMAHA — read the warnings. Bikes and quads are OPPOSITE
    // on key technology, and it is a classic mistake to swap the
    // two when quoting.
    // =========================================================
    "Yamaha": {
        "YZF-R / MT / Tracer / XSR": {
            "2006 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £40-£75 | New lock + keys £110-£175",
                chip: "Tubular wafer key — NOT euro profile and NOT a transponder on the mechanical era",
                warning: "⚠️ YAMAHA BIKE KEYS ARE TUBULAR WAFERS, not euro profile. They cannot be picked, imaged or decoded, and there is no keyway decoder for them. The ONLY routes are: (1) duplicate the customer's existing key by reading the tube depths, or (2) the dealer code card, a letter+digit code only a Yamaha dealer can supply. If all keys are lost and there is no existing key and no card, this is a DEALER ORDER and no amount of on-site work changes that. Quote it as a referral, not a bench job.",
                risk: "HIGH on lost-all — dealer code card only",
                blankNote: "Yamaha tubular blank (Y-series). Do not order a euro-profile blade — it will never work.",
                entry: "The steering lock barrel itself is often still a conventional cylinder that picks or overrides, so mechanical entry is possible. The tubular key is what cannot be produced without the code or an existing key."
            })
        },
		"TMAX / XMAX (Keyless Maxi-Scooters)": {
            "2015 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare fob £95-£160 | Lost all keys £170-£260",
                chip: "Smart Key proximity fob (ID49) with mechanical emergency blade for underseat release",
                warning: "⚠️ Very high UK theft/loss rate. Keyless XMAX and TMAX use a 6-digit emergency PIN on the original tag. With a working fob or the PIN, a new fob programs easily via the diagnostic connector. If all fobs AND the PIN are lost, you must strip the front fairing to remove the Smart Control Unit (SCU) and read the EEPROM on the bench.",
                risk: "MODERATE-HIGH — SCU EEPROM bench job if PIN and fobs are lost",
                blankNote: "Yamaha emergency blade for the underseat manual release lock."
            })
        },
        "R1 / R6 / FZ / Fazer / FJR (Red Key Immobiliser Era)": {
            "2003 - 2016": Object.assign({}, BIKE_BASE, {
                price: "Spare key £55-£90 | Lost all keys £160-£250",
                chip: "Yamaha Immobiliser System (YISS) — Texas Crypto 4D60 / 4D69 (Black service keys + Red master key)",
                warning: "⚠️ Do not confuse this era with the non-transponder tubular models. These bikes use a standard edge-cut blade (YH35R) with a transponder chip. Spare keys can be cloned straight off a working black key. If all keys are lost (no Red master key), the Moric immobiliser ring around the ignition or the ECU must come off for bench EEPROM programming.",
                risk: "LOW on spare (cloneable) | HIGH on AKL (bench EEPROM)",
                blankNote: "Yamaha YH35R standard motorcycle profile."
            })
        },
		"Ténéré 700 (T7) & Tracer 7 / Tracer 9 (Modern Immobiliser Era)": {
            "2019 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £55-£95 | Lost all keys £160-£260",
                chip: "Yamaha Immo (Texas Crypto 4D) — Transponder blade (Red master + Black service keys)",
                warning: "⚠️ Huge UK seller. Ténéré 700 and Tracer 7 retain a standard bladed ignition key (NOT tubular, NOT keyless). Working black keys can be cloned easily. If all keys are lost and the red master key is missing, dealer protocol is a full lockset and ECU replacement, or bench reading the immobiliser ring on the barrel.",
                risk: "LOW on spare (cloning) | HIGH on AKL (EEPROM)",
                blankNote: "Yamaha YH35R / laser profile depending on exact year."
            })
        },
        "YBR125 / YS125 / SR125 (Commuter & Training Fleet)": {
            "2005 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £25-£50 | Lost all keys £75-£130",
                chip: "Mechanical — no transponder on UK 125 commuter models",
                warning: "⚠️ Massive UK riding school and delivery volume. 100% mechanical. The steering lock is integrated into the ignition, but riders frequently bend or snap keys trying to open stiff fuel tank caps. Easily picked and decoded with a basic 2-in-1 or sight-read.",
                risk: "LOW — pure mechanical, fast turnaround",
                blankNote: "Yamaha YH35R or standard 5/6-wafer edge-cut blank."
            })
        },
        "NMAX / Tricity / MT-07 (Scooters & Small)": {
            "2014 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £35-£65 | New lock + keys £100-£160",
                chip: "Tubular wafer key on most — keyless on the newest MT-07/Tricer variants",
                warning: "⚠️ Same Yamaha tubular constraint as above, and it applies to their scooters too. Spare from an existing key is fine. Lost-all with no existing key and no dealer card is a dealer order. The keyless MT-07/Tricer need the maker's tool for a fob.",
                risk: "HIGH on lost-all — dealer code card only",
                blankNote: "Yamaha tubular blank (Y-series), not euro profile."
            })
        },
        "Grizzly / Kodiak / Wolverine": {
            "2008 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare key £40-£80 | New lock + keys £115-£185",
                chip: "Mechanical on the Grizzly and Kodiak; coded on the newest Wolverine",
                warning: "⚠️ Yamaha's farm quads are largely mechanical, so a spare is a cheap cut — note this is the OPPOSITE of Yamaha motorcycles, which use tubular keys. Do not mix the two up. A coded machine needs the VIN-gated code from a dealer.",
                risk: "LOW-MODERATE — mechanical on most",
                blankNote: "Yamaha quad blank — NOT the tubular motorcycle blank."
            })
        }
    },

    "Suzuki": {
        "Hayabusa / GSX-R / SV650 / GSX-S": {
            "2004 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£65 | New lock + keys £95-£150",
                chip: "Mechanical on the older models; immobiliser on later GSX-S and SV650",
                warning: "⚠️ Sport and naked Suzuki is largely mechanical, so spare keys are a quick cut. The newer GSX-S and SV650 carry an immobiliser — read the key and check for a transponder chip before quoting. No OBD socket; use the under-seat connector.",
                risk: "LOW-MODERATE — mechanical on most",
                blankNote: "Suzuki 6-pin bike blank."
            })
        },
		"GSX-8S / GSX-8R / V-Strom 800DE (New 800 Platform)": {
            "2023 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £60-£110 | Lost all keys £150-£240",
                chip: "Suzuki Immobiliser (SAIS) — Transponder wave blade",
                warning: "⚠️ Suzuki's modern parallel-twin range. Bladed key with modern transponder chip. Do not quote as a simple mechanical cut. Diagnostic programming connects via the red 6-pin Euro 5 diagnostic port under the rider's seat.",
                risk: "MODERATE — Euro 5 transponder system",
                blankNote: "Suzuki wave/laser cut profile."
            })
        },
		"Burgman 125 / 200 / 400 / 650 (Scooter Range)": {
            "2002 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £45-£85 | Lost all keys £130-£210",
                chip: "Transponder (ID40 / ID46) + Magnetic security shutter on the ignition barrel",
                warning: "⚠️ Watch out for the magnetic anti-tamper shutter over the keyway. Even if you cut and code the blade, the customer cannot insert it if the shutter is closed unless you configure the 3-magnet pegs in the key bow head. On AKL, the ECU sits behind the front leg shield/nose cone.",
                risk: "MODERATE — magnetic shutter bow + transponder",
                blankNote: "Suzuki SZ14 / SZ17 blank with magnetic shutter head recess."
            })
        },
        "V-Strom / Bandit / DR650": {
            "2004 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£65 | New lock + keys £95-£150",
                chip: "Mechanical — Suzuki's adventure and trail range has largely stayed mechanical",
                warning: "⚠️ A well-liked UK dealer bike and mostly mechanical, so this is fast, cheap bench work. Check for an immobiliser on the latest V-Strom before quoting a cut-only job.",
                risk: "LOW — mechanical on most",
                blankNote: "Suzuki 6-pin bike blank."
            })
        },
		"GSF Bandit / SV650 / GSX-R SRAD / RF / Marauder (Pre-Immobiliser Era)": {
            "1995 - 2006": Object.assign({}, BIKE_BASE, {
                price: "Spare key £25-£55 | Lost all keys £85-£140",
                chip: "Mechanical — no factory transponder prior to ~2005/2006 (watch for dealer Datatool alarms)",
                warning: "⚠️ Enormous UK surviving fleet of carburetted Bandits, early pointy/curvy SV650s, and SRAD GSX-Rs. 100% mechanical keys, making AKL jobs fast and profitable. Just like Kawasaki, the fuel cap and seat lock contain fewer wafers than the ignition barrel.",
                risk: "LOW — simple mechanical decode and cut",
                blankNote: "Suzuki SZ11 / SZ14 7-wafer edge-cut profile."
            })
        },
        "GSX-S125 / GSX-R125 / VanVan / Address / Katana": {
            "2007 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£70 | Lost all keys £100-£165",
                chip: "Mechanical with magnetic shutter on GSX-S125; keyless rotary knob on GSX-R125; ID46 transponder on Katana",
                warning: "⚠️ Pay close attention to the exact 125 model: the naked GSX-S125 uses a mechanical key with a magnetic security shutter, whereas the faired GSX-R125 uses a proximity Smart Key fob with a rotary ignition knob.",
                risk: "LOW on VanVan/GSX-S125 | MODERATE-HIGH on keyless GSX-R125",
                blankNote: "Suzuki shutter-head blank on GSX-S125/Address."
            })
        },
        "KingQuad (ATV)": {
            "2005 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare key £40-£75 | New lock + keys £110-£175",
                chip: "Mechanical ignition key on most; coded on the newest KingQuad",
                warning: "⚠️ The workhorse farm quad. Mostly mechanical, so a spare is a simple cut — but a lost-all job means replacing the ignition lock, because there is no code source to recover the original from. Quote the lock, not a coder.",
                risk: "LOW-MODERATE — mechanical on most",
                blankNote: "Suzuki quad blank — often interchangeable with the motorcycle profile."
            })
        }
    },

    "Kawasaki": {
        "Ninja / Z Series": {
            "2007 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£65 | New lock + keys £95-£150",
                chip: "Mechanical on the older models; KISS immobiliser from around 2011",
                warning: "⚠️ KISS (Kawasaki Immobiliser Security System) fits a lot of mid-range Ninnas and Zs. Identify KISS before quoting — the key then needs cutting and programming at the diagnostic connector, not just a bench cut. Kawasaki code data is dealer-issued by VIN.",
                risk: "MODERATE — KISS on 2011+",
                blankNote: "Kawasaki bike blank, typically 6-pin profile. Read the existing key."
            })
        },
		"ZX-6R / ZX-9R / ZX-10R / ZZR / ER-5 / ER-6 (Pre-KISS Mechanical Era)": {
            "1995 - 2010": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£60 | Lost all keys £95-£150",
                chip: "Mechanical on ER-5, early ER-6, ZX-9R and 90s/early-00s sportsbikes; early Texas 4D transponder on ~2006-2010 ZX/ZZR",
                warning: "⚠️ Older Kawasaki ignitions use a stepped keyway where the tip or shoulder stop matters, and the fuel tank cap often only uses 5 of the 7 wafers in the ignition. If you decode from the tank or seat lock on an AKL job, you will have to progression/impression the missing 2 cuts for the ignition.",
                risk: "LOW — purely mechanical on most, watch the missing tank wafers",
                blankNote: "Kawasaki KW14 / KW15 / KW16 profile."
            })
        },
		"W800 / Eliminator 500 / Vulcan S 650 (Retro & A2 Cruiser)": {
            "2015 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £45-£85 | Lost all keys £120-£190",
                chip: "Mechanical on some export base models; KISS transponder standard on modern UK-spec",
                warning: "⚠️ Frame-mounted ignition barrel on the W800 and Vulcan S. Check the instrument cluster for the red immobiliser warning LED before quoting. If KISS is present, the key requires chip programming via the under-seat harness connector.",
                risk: "MODERATE — KISS transponder",
                blankNote: "Kawasaki KW14 / KW16 profile."
            })
        },
        "Mule / Brute Force / KVF (ATV & Utility UTV)": {
            "2005 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare key £30-£55 | New lock + keys £85-£140",
                chip: "Mechanical — standard non-transponder utility switch",
                warning: "⚠️ Kawasaki Mule UTVs and Brute Force quads are agricultural/estate staples across the UK. Purely mechanical ignition barrels that suffer heavily from mud and water ingress. Flush with contact cleaner/lubricant before picking or decoding.",
                risk: "LOW — pure mechanical utility switch",
                blankNote: "Kawasaki ATV / Mule mechanical blank."
            })
        },
        "Versys / Vulcan / KL / Z Pro": {
            "2010 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£65 | New lock + keys £95-£150",
                chip: "KISS immobiliser on most modern Versys and Vulcan",
                warning: "⚠️ KISS is near-standard on this range, so assume a coded key rather than a pure cut. No OBD socket — Kawasaki's diagnostic plug sits under the seat or behind a side panel.",
                risk: "MODERATE — KISS common",
                blankNote: "Kawasaki bike blank, typically 6-pin profile."
            })
        }
    },

    "BMW": {
        "R / GS / S / Adventure Range": {
            "2010 - Present": Object.assign({}, BIKE_SMART, {
                price: "Spare fob £160-£300 | Lost all keys £220-£380",
                chip: "Keyless Ride with proximity fob on most modern machines; coded blade on the older ones",
                warning: "⚠️ BMW motorcycles are keyless/proximity on the current range and need the BMW tool or a dealer to pair a fob. The physical steering lock still opens to picks or an override. A lost-all job with no fob present is realistically a dealer job — quote it that way.",
                blankNote: "BMW motorcycle blank — NOT the same as a BMW car blank. Do not order a car blade for a bike.",
                risk: "HIGH — BMW tool or dealer for the fob"
            })
        },
		"C400X / C400GT / C600 / C650 / CE 04 (Maxi-Scooters)": {
            "2012 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key/fob £140-£250 | Lost all keys £200-£340",
                chip: "Bladed transponder (EWS4) on early C600/C650; Keyless Ride proximity fob on C400X/GT and CE 04",
                warning: "⚠️ Treat these as BMW motorcycles under the plastics, not basic scooters. C400 models use BMW's Keyless Ride module (X_SLZ) and require specialist BMW bike diagnostics or bench EEPROM work, or ordering a pre-coded fob from BMW by VIN.",
                risk: "HIGH — BMW EWS / Keyless Ride architecture",
                blankNote: "BMW scooter emergency/ignition blade."
            })
        },
        "K1200 / K1300 / F650 / R1150 (Coded Era)": {
            "2002 - 2020": Object.assign({}, BIKE_BASE, {
                price: "Spare key £120-£220 | Lost all keys £180-£300",
                chip: "Coded transponder/proximity key — pairing needs maker access",
                warning: "⚠️ Even the older coded BMWs are a maker-tool job for the key. Mechanical entry on the steering lock is still locksmith work. Keep the two halves of the quote separate: the lock is yours, the coded key is not.",
                risk: "HIGH — maker tool for the coded key",
                blankNote: "BMW motorcycle blade, distinct from the car range."
            })
        }
    },

    // =========================================================
    // UK SCOOTER VOLUME — cheapest, fastest, highest-frequency
    // two-wheeler work in the file.
    // =========================================================
    "Vespa": {
        "PX / Primavera / GTS": {
            "2005 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £30-£55 | New lock + keys £90-£140",
                chip: "Usually mechanical — no transponder on most Vespa. Some later Giorno/GTS have an immobiliser",
                warning: "⚠️ Vespa keys are cut from a code held by Piaggio/Vespa dealers and printed on the key tag. If the customer has the tag, this is a quick bench job. Without the tag or an existing key, it becomes a dealer order.",
                risk: "LOW — euro profile, quick cut",
                blankNote: "Vespa/Piaggio euro-profile blank. Measure the existing key rather than trusting the model year — the profile changed across the generations."
            })
        },
        "ET4 / GTS 300+ (Keyless era)": {
            "2014 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £60-£110 | Lost all keys £140-£220",
                chip: "Immobiliser-equipped — keyless on high-spec GTS/ET4, transponder key on lower variants",
                warning: "⚠️ Keyless/smart Vespa is a Piaggio tool or dealer job for the coded key. The mechanical steering lock still opens to picks. If every key is lost with no fob present, price the dealer route honestly.",
                risk: "MODERATE-HIGH — maker tool for the key"
            })
        }
    },

    "Piaggio": {
        "Liberty / Typhoon / X9 / ZIP / NRG": {
            "2000 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £30-£55 | New lock + keys £85-£135",
                chip: "Mechanical on most; transponder on the latest NRG and Quantum",
                warning: "⚠️ Very common UK job — a lost scooter key is usually a simple euro-profile cut. Only the newest Piaggio machines carry a transponder. Check the key before quoting the coder job.",
                risk: "LOW — euro profile, quick cut",
                blankNote: "Piaggio euro-profile blank; several different depths in circulation across the Liberty/X9 generations."
            })
        },
        "Beverly / Fly / Vespa 300 (Transponder era)": {
            "2010 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £50-£90 | Lost all keys £120-£190",
                chip: "Transponder key — cut and coded via the underseat ECU",
                warning: "⚠️ Transponder scooter needs the code programmed as well as cut. No OBD socket — go to the underseat connector or harness the ECU. Piaggio codes are usually obtainable from the dealer by frame number.",
                risk: "MODERATE — cut plus ECU coding"
            })
        }
    },

    "Kymco": {
        "MXU / Downtown / Agility (Utility Maxi-Scooters)": {
            "2008 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £25-£50 | New lock + keys £75-£125",
                chip: "Mechanical — these are large utility scooters, not quads, and are not immobilised",
                warning: "⚠️ Bigger-framed maxi-scooter, so a little more underseat work, but still mechanical on the majority. Cheapest work in this file — do not over-quote the labour. Read the blank from the existing key.",
                risk: "LOW — mechanical",
                blankNote: "Kymco euro-profile blank."
            })
        }
    },

    "Sinnis / Lexmoto / FYM / Keeway / Sym": {
        "Commuter / 125cc / 300cc Range": {
            "2010 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £25-£50 | New lock + keys £75-£125",
                chip: "Mechanical — this whole sector is overwhelmingly non-immobilised",
                warning: "⚠️ Cheap, fast, high-volume UK dealer-bike work. Almost all mechanical. No dealer code is normally available, so a spare is cut from an existing key. If every key is lost there is often no code source at all — price new lock and new keys as standard, not as an AKL special.",
                risk: "LOW — mechanical, spare from existing key"
            })
        },
        "Lexmoto / Sinnis Premium & Smart Models": {
            "2018 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £45-£85 | Lost all keys £115-£180",
                chip: "Transponder or keyless start on the top-end models",
                warning: "⚠️ The premium end of the UK importer market does carry immobilisers. Identify the specific model before quoting mechanical. Importer codes are usually obtainable from the UK importer by frame number.",
                risk: "MODERATE — check model for a transponder"
            })
        }
    },

    // =========================================================
    // GROWING IMPORT / MAINSTREAM BRANDS
    // =========================================================
    "Royal Enfield": {
        "Classic / Interceptor / Himalayan / Meteor": {
            "2010 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£60 | New lock + keys £85-£135",
                chip: "Mechanical — this brand is almost entirely un-immobilised",
                warning: "⚠️ Very fast, very cheap bench work: an RE key is a straightforward cut from an existing key with no transponder. Confirm there is no dealer-fitted alarm or tracker before quoting. There is normally no code to recover from, so lost-all means a new lock and keys.",
                risk: "LOW — mechanical, quick cut",
                blankNote: "Royal Enfield bike blank. Cheap and plentiful, but check the profile depth against the existing key."
            })
        }
    },

    "Benelli / Voge (Keeway Group)": {
        "TNT / BJ / ZX / DSX": {
            "2014 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£60 | New lock + keys £85-£135",
                chip: "Mechanical on most; transponder on some later Voge models",
                warning: "⚠️ Fast-growing UK market and mostly mechanical, so a good cheap job. Identify the model before ordering — the later Voge DSX and 525 models do carry a transponder. Importer codes go through the UK Keeway dealer.",
                risk: "LOW-MODERATE — mechanical on most",
                blankNote: "Benelli/Voge euro-profile bike blank."
            })
        }
    },

    "CFMOTO": {
        "Asfal / 300SR / 700CL / 800MT": {
            "2019 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£60 | New lock + keys £90-£140",
                chip: "Mechanical on most; keyless start on the newest 800MT",
                warning: "⚠️ The fastest-growing UK bike brand and mostly mechanical — good, cheap, high-turnover work. The keyless 800MT needs the maker's tool for a fob, so quote the mechanical lock separately from the coded fob.",
                risk: "LOW — mechanical on most",
                blankNote: "CFMOTO euro-profile bike blank."
            })
        },
        "CFORCE / UTV (Quad & UTV)": {
            "2019 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare key £35-£70 | New lock + keys £100-£165",
                chip: "Mechanical on most; coded on the higher-spec CFORCE",
                warning: "⚠️ CFMOTO quads and UTVs are largely mechanical, so a spare is a cheap cut. Check for a coded key on the top-spec machines — the code is released by CFMOTO against the VIN.",
                risk: "LOW-MODERATE — mechanical on most",
                blankNote: "CFMOTO quad blank; often the same profile as the motorcycle range."
            })
        }
    },

    "Aprilia / Moto Guzzi": {
        "Racing / Tuono / Shiver / V7 / V100": {
            "2013 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £120-£230 | Lost all keys £190-£320",
                chip: "Coded transponder or keyless depending on model — Piaggio-group electronics",
                warning: "⚠️ Piaggio-group electronics on both Aprilia and Moto Guzzi, so keys are usually coded rather than plain. No OBD socket — underseat diagnostic connector or a harness to the ECU. Identify the exact model and year; some older Aprilias are still plain mechanical and would be a cheap cut.",
                risk: "MODERATE-HIGH — Piaggio group coding",
                blankNote: "Piaggio-group blank; several profiles in use, read the existing key."
            })
        },
		"RS125 / RX125 / SX125 / SR50 / Tuono 125 (Small Capacity & 2-Stroke)": {
            "1998 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £25-£55 | Lost all keys £85-£140",
                chip: "Mechanical — the 50cc and 125cc Aprilia range is almost entirely non-immobilised",
                warning: "⚠️ Do not price a 125cc Aprilia like an RSV4! The RS125, SX125, and SR50 scooters are pure mechanical Zadi locks with no transponder chip. Very quick, easy bench or callout work.",
                risk: "LOW — pure mechanical Zadi lockset",
                blankNote: "Zadi ZD17 / ZD23R Italian blank."
            })
        }
    },

    // =========================================================
    // SMART / LOCKLESS / MAKER-TOOL MACHINES — price these as a
    // coder's time, not as a key cut.
    // =========================================================
    "Harley-Davidson": {
        "Sportster / Cruiser / Street & Touring": {
            "2008 - Present": Object.assign({}, BIKE_SMART, {
                price: "Smart key / fob £180-£320 | Lost all keys £250-£420",
                chip: "Smart Key with encrypted fob — pairing is a Harley dealer or specialist tool job",
                warning: "⚠️ Harley Smart Key is encrypted and cannot be duplicated or paired with general automotive tooling. Mechanical entry to the steering lock is still possible with picks. Treat the fob as a dealer/specialist item and quote your labour honestly around it.",
                blankNote: "Harley blade is manufacturer-specific and must come from HD for an encrypted key.",
                risk: "HIGH — Harley dealer or specialist rig"
            })
        },
		"Sportster / Dyna / Softail / Touring (Tubular 'Ace' Key & Early Barrel Era)": {
            "1994 - 2013": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£65 | Lost all keys £100-£170",
                chip: "7-pin Tubular (Ace) barrel key or flat wing-nut ignition key — separate button/proximity alarm fob if factory security is fitted",
                warning: "⚠️ High-volume UK cruiser job. The physical key is a 7-pin tubular barrel lock (standard 0.375\" / 7.8mm diameter) that picks and decodes easily with a standard 7-pin tubular pick. Check if the bike has the optional H-D TSSM/HFSM security module fitted — if the indicators flash alternately on ignition, it needs the alarm fob or the 5-digit personal PIN entered via the indicator buttons.",
                risk: "LOW on mechanical tubular key | MODERATE if alarm is armed with no fob",
                blankNote: "Harley 7-pin tubular blank (HYD13)."
            })
        }
    },

    "Ducati": {
        "Panigale / Monster / Multistrada / Scrambler": {
            "2015 - Present": Object.assign({}, BIKE_SMART, {
                price: "Spare key/fob £170-£300 | Lost all keys £230-£380",
                chip: "Keyless entry with proximity fob on current Ducati; older machines use a coded Marelli-style key",
                warning: "⚠️ Modern Ducati is keyless — there is no spare key in the conventional sense, only a fob to pair. Needs Ducati tool or dealer access. The steering lock opens to picks. Quote the mechanical recovery and the fob as separate lines.",
                blankNote: "Ducati-specific blank; older coded machines are not interchangeable with aftermarket blades.",
                risk: "HIGH — Ducati tool or dealer"
            })
        },
		"Monster / 749 / 999 / 848 / 1098 / Hypermotard (Red Key & Code Card Era)": {
            "1998 - 2014": Object.assign({}, BIKE_BASE, {
                price: "Spare key £55-£95 | Lost all keys £160-£260",
                chip: "Magneti Marelli / Digitek Immobiliser — T5 (ID11/ID12) or Crypto ID48 transponder",
                warning: "⚠️ Pre-keyless Ducatis store the immobiliser data directly inside the instrument cluster (dash) or ECU. They came with a Red Key (or 5-digit Electronic Code Card) to emergency-start via the throttle/buttons. Spares can often be cloned. If all keys are lost, you have to open the dash/ECU and read the EEPROM chip on the bench to generate a transponder.",
                risk: "LOW-MODERATE on spare | HIGH on AKL (delicate dash EEPROM job)",
                blankNote: "Ducati ZD23CP / KW16 profile."
            })
        }
    },

    "Triumph": {
        "Tiger / Street / Trophy / Speed Triple": {
            "2013 - Present": Object.assign({}, BIKE_SMART, {
                price: "Spare key/fob £150-£280 | Lost all keys £210-£350",
                chip: "Keyless entry with proximity fob on most modern Triumphs",
                warning: "⚠️ Triumph's keyless system needs the maker's tool or a dealer to pair a fob. The mechanical steering lock still opens to picks or an override, so recovery work is legitimate — the coded key is not.",
                blankNote: "Triumph-specific blank; do not substitute a generic euro-profile blade.",
                risk: "HIGH — maker tool for the fob"
            })
        },
		"Rocket III / Rocket 3 / Thunderbird / America / Speedmaster (Cruisers)": {
            "2002 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £35-£80 (Bladed) | £160-£280 (Rocket 3 Keyless)",
                chip: "Mechanical on America, Speedmaster, Thunderbird & early Rocket III (2004-2018); Keyless proximity fob on 2019+ Rocket 3 (2500cc)",
                warning: "⚠️ On the classic 2300cc Rocket III, Thunderbird, and America, the ignition barrel is often mounted down on the side panel or frame neck and is purely mechanical. The 2019+ 2500cc Rocket 3 switched to Triumph's encrypted keyless proximity system.",
                risk: "LOW on pre-2019 cruisers | HIGH on 2019+ keyless Rocket 3",
                blankNote: "Triumph KW14 / ZD24R on bladed models."
            })
        },
        "Tiger Sport 660 / Trident 660 / Daytona 660 / Speed 400 & Scrambler 400X": {
            "2021 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £60-£110 | Lost all keys £140-£230",
                chip: "Bladed Transponder (Hitag AES / ID47 / ID49)",
                warning: "⚠️ Triumph's newer middleweight 660 triples and 400 singles DO NOT use the keyless fob system — they went back to a traditional bladed ignition key with a transponder chip in the head. Standard OBD2 diagnostic port is under the seat.",
                risk: "MODERATE — bladed transponder, OBD under seat",
                blankNote: "Triumph laser/wave profile on the 400 series; edge-cut ZD profile on the 660s."
            })
        },
		"Bonneville / Thruxton / Scrambler 900 & 1200 / Speed Twin (Modern Classics)": {
            "2001 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £45-£90 | Lost all keys £130-£220",
                chip: "Mechanical (2001-2015) | Bladed Transponder ID46/ID47 (2016+ Liquid-Cooled range)",
                warning: "⚠️ Unlike the big keyless triples, the Modern Classics range mostly retains a traditional bladed ignition in the headlight bracket or side panel. 2001-2015 air-cooled models are pure mechanical cuts. 2016+ liquid-cooled (T100/T120/Street Twin/Speed Twin) have an immobiliser antenna ring and standard OBD2 port under the seat.",
                risk: "LOW on pre-2016 | MODERATE on 2016+ transponder",
                blankNote: "Triumph ZD24R / KW14 profile."
            })
        },
        "Sprint / Tiger 955i & 1050 / Speed & Street Triple (Bladed Era)": {
            "1997 - 2016": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£65 | New lock / AKL £95-£160",
                chip: "Mechanical on all 955i and early 1050/675 models; optional Datatool alarm fobs common; factory transponder from ~2013",
                warning: "⚠️ Bread-and-butter mechanical key cutting on the 955i and early 1050/675 generations — no factory transponder in the key prior to ~2012/2013. Watch out for dealer-fitted Datatool S3/S4 alarms wired into the harness under the seat/tail unit, which will immobilise the bike independently of the key.",
                risk: "LOW — mechanical keyway, watch for aftermarket Datatool alarms",
                blankNote: "Triumph KW14 / ZD24R 6-disc/wafer profile. Easily picked and decoded via the ignition or tank cap."
            })
        }
    },
    
	"CCM (Clews Competition Motorcycles)": {
        "Spitfire / Blackout / Foggy / Stealth / GP450": {
            "2014 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £40-£80 | Lost all keys £110-£180",
                chip: "Mechanical ignition barrel on Spitfire series; keyless options on select custom orders",
                warning: "⚠️ Boutique British hand-built bikes from Bolton. High retail value, but the Spitfire frame platform uses a straightforward, un-chipped mechanical ignition switch tucked under the tank or behind the headstock. Take extreme care with hand-painted trellis frames and billet triple clamps.",
                risk: "LOW mechanically | HIGH vehicle value / fragile finishes",
                blankNote: "Standard European mechanical blank."
            })
        }
    },
	
    "KTM": {
        "Duke / Adventure / SMC / 790/890/1290": {
            "2017 - Present": Object.assign({}, BIKE_SMART, {
                price: "Spare key/fob £150-£280 | Lost all keys £210-£350",
                chip: "Keyless on most modern KTM — proximity fob only, no conventional blade",
                warning: "⚠️ The current KTM range is keyless, so there is no spare key to cut — it is a fob pairing job with the KTM tool or a dealer. On the older Duke 125/200/390 there IS a conventional blade, so identify the model first; that version is a cheap bench cut.",
                blankNote: "KTM bike blank for the keyed models only — the keyless range needs no blade.",
                risk: "HIGH on keyless models — maker tool for the fob"
            })
        },
		"Duke 125 / 390 & RC 125 / 390 (Bladed A1/A2 Range)": {
            "2011 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£60 | Lost all keys £90-£150",
                chip: "Mechanical — the smaller 125/250/390 platform does NOT use an immobiliser or keyless fob",
                warning: "⚠️ Do not turn away 125/390 Dukes thinking they are keyless like the 1290! The small-capacity KTM range is massive in the UK and uses a simple non-transponder mechanical key (even on the newer TFT-dash 390s). Very profitable, straightforward decode and cut job.",
                risk: "LOW — mechanical only, no transponder",
                blankNote: "KTM laser/wave profile on newer models; standard edge-cut on early 2011-2016 Dukes."
            })
        },
		"690 Enduro / SMC / 990 / 1050 / 1090 / 1190 Adventure (Zadi Transponder Era)": {
            "2006 - 2020": Object.assign({}, BIKE_BASE, {
                price: "Spare key £60-£110 | Lost all keys £170-£270",
                chip: "Zadi Immobiliser System — ID46 transponder (Orange Master Key + Black keys)",
                warning: "⚠️ The generation between pure mechanical dirt bikes and modern proximity keyless. Uses an Orange Master Key to learn new black service keys. Spares can be cloned onto an aftermarket ID46 transponder. Lost all keys with no Orange key requires the instrument cluster or EFI ECU pulled for an EEPROM dump.",
                risk: "LOW on spare (cloning) | HIGH on AKL (EEPROM without orange key)",
                blankNote: "Zadi ZD23R / ZD30 profile with transponder chip cavity."
            })
        },
        "EXC / SX / Freeride (Enduro & Motocross)": {
            "2004 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £25-£50 | New switch / keys £75-£120",
                chip: "Mechanical steering lock / simple 2-wire ignition barrel (EXC road-registered models)",
                warning: "⚠️ Pure dirt/enduro bikes. SX motocrossers have no key at all; road-registered EXC models have a basic mechanical ignition switch behind the headlight mask and a steering neck lock. Zero electronics in the key.",
                risk: "LOW — simple mechanical barrel"
            })
        }
    },

    // =========================================================
    // ATV / UTV / QUAD — the powersports side
    // =========================================================
    "Polaris": {
        "Ranger / RZR (Utility & Sport Side-by-Side)": {
            "2013 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare coded key £70-£140 | Lost all keys £160-£280",
                chip: "Coded transponder key — some models use a key fob; the code is released against the VIN",
                warning: "⚠️ Polaris will not release a replacement key code without proof of ownership and the VIN, and some dealers require the machine in front of them. Get the VIN photographed at the job. Mechanical entry on the ignition lock is still possible with picks.",
                risk: "MODERATE-HIGH — coded key, VIN-gated code",
                blankNote: "Polaris-specific transponder blade. The mechanical override key supplied with some Rangers is a different, simpler blank."
            })
        },
        "Sportsman / General / RZR XP (Coded Era)": {
            "2016 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare coded key £70-£140 | Lost all keys £160-£280",
                chip: "Encrypted coded key with PIN security on higher-spec models",
                warning: "⚠️ Higher-spec Polaris machines add PIN security on top of the coded key, so a new key needs both the code and the PIN set. This is a longer job than a Ranger — price it up and get the VIN and PIN agreed with the customer before starting.",
                risk: "HIGH — encrypted code plus PIN",
                blankNote: "Polaris encrypted blade, VIN-gated."
            })
        }
    },

    "Can-Am": {
        "Maverick / Outlander / Defender": {
            "2013 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare coded key £70-£140 | Lost all keys £160-£280",
                chip: "Coded key with transponder — code released by the dealer against the VIN",
                warning: "⚠️ Can-Am requires the VIN to release a key code, and the dealers are strict about proof of ownership. Photograph the VIN on arrival. Some Defenders also use a key fob for the accessory bus — handle the ignition key and the fob as separate items in the quote.",
                risk: "MODERATE-HIGH — coded key, VIN-gated code",
                blankNote: "Can-Am coded blade; the fob for the electrical bus is a separate part."
            })
        }
    },

    "Kubota": {
        "RTV-X / RUGG (Utility UTV)": {
            "2013 - Present": Object.assign({}, ATV_BASE, {
                price: "PIN reset £90-£160 | New key fob £140-£240",
                chip: "KEYLESS IGNITION WITH PIN CODE — there is no conventional key to cut on most RTVs",
                warning: "⚠️ Most modern Kubota RTV/RUGG have no key blade at all — ignition is by PIN code entered on the dash, with up to three codes and a factory master PIN. The job is a PIN reset or code relearn, not a cut. If the customer has forgotten every PIN and the master PIN has been changed, this becomes a Kubota dealer job. Confirm the machine has no blade before quoting anything as a key.",
                risk: "MODERATE-HIGH — PIN relearn, dealer if master PIN lost"
            })
        }
    },

    "John Deere": {
        "Gator / R-Series UTV": {
            "2013 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare coded key £65-£130 | Lost all keys £150-£260",
                chip: "Coded key on most modern Gators — code released by the dealer against the VIN",
                warning: "⚠️ Deere releases key codes against the VIN only, so photograph it on arrival. Older utility Gators are mechanical and are a cheap cut — identify the year first. If the customer has lost all keys on a coded machine, get the serial/VIN photographed and have the dealer paperwork ready before you commit to a date.",
                risk: "MODERATE-HIGH — coded key, VIN-gated code",
                blankNote: "John Deere UTV coded blade."
            })
        }
    },
	
	"Husqvarna / GasGas": {
        "Svartpilen / Vitpilen 125 & 401 / Enduro (FE / TE / EC)": {
            "2014 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £30-£65 | Lost all keys £95-£150",
                chip: "Mechanical on 125/401 and Enduro; immobiliser on 701/Norden 901",
                warning: "⚠️ Built on KTM platforms since the Pierer Mobility takeover. The popular Svartpilen/Vitpilen 125 and 401 share the KTM 125/390 Duke architecture — they use a laser/wave mechanical blade with NO transponder. The bigger 701 and Norden 901 carry an immobiliser chip.",
                risk: "LOW on 125/401 & Enduro | MODERATE on 701/901",
                blankNote: "Uses KTM blanks under the Husqvarna/GasGas badge."
            })
        }
    },

    "Zontes": {
        "ZT125 / GK125 / U125 / 310 / 350 Range": {
            "2018 - Present": Object.assign({}, BIKE_SMART, {
                price: "Spare key/fob £70-£130 | Lost all keys £150-£240",
                chip: "PKE (Passive Keyless Entry) proximity wristband / mini-fob on almost the entire range; some base 125s are mechanical",
                warning: "⚠️️ Huge UK learner bike volume, and almost all of them are factory keyless! There is NO ignition barrel on PKE models — fuel flap, seat, and steering lock are all electric solenoids. Common callout is a 'lost key' that is actually a flat CR2032/CR1632 fob battery or a flat bike battery. If the fob battery dies, hold the fob flat against the induction sensor pad (usually on the right front fairing or under the seat) to start. New fobs pair via a dedicated 2-wire programming lead under the seat.",
                risk: "MODERATE — quirky Chinese PKE system, check battery/induction first",
                blankNote: "No mechanical blade on PKE models."
            })
        }
    },

    "Peugeot": {
        "Speedfight / Vivacity / Kisbee / Tweet / Django (Scooters)": {
            "2000 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare key £30-£55 | New lock + keys £85-£135",
                chip: "Mechanical on almost all 50cc and 125cc commuter models; transponder on larger Satelis/Geopolis",
                warning: "⚠️ High-volume UK delivery and learner scooters. Speedfight 3/4, Kisbee, and Tweet are simple mechanical cuts with no immobiliser. Watch out for early 2000s JetForce/Elyseo/Speedfight 2 models with a grey-headed key, which used a nightmare Marelli/Dellorto transponder ECU.",
                risk: "LOW — mechanical on modern 50/125cc commuters",
                blankNote: "Peugeot scooter blank (often shared with SYM/Piaggio profiles depending on the factory)."
            })
        },
        "Metropolis 400 (3-Wheel Keyless)": {
            "2013 - Present": Object.assign({}, SCOOTER_BASE, {
                price: "Spare fob £130-£220 | Lost all keys £200-£320",
                chip: "Smart Key proximity fob",
                warning: "⚠️ Three-wheeled commuter popular with car-licence holders. Uses a proximity fob and electronic rotary ignition switch. Dealer or specialist diagnostic job if all fobs are lost.",
                risk: "HIGH — specialist/dealer fob system"
            })
        }
    },

    "Indian Motorcycle": {
        "Scout / Chief / FTR / Challenger / Chieftain": {
            "2014 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key/fob £80-£220 | Lost all keys £160-£320",
                chip: "Mechanical bladed ignition on most Scout models; Proximity Smart Fob + PIN on Chief, Chieftain, and Challenger",
                warning: "⚠️ Owned by Polaris. Standard Indian Scouts use a simple mechanical key in the side of the frame neck with no transponder — very easy bench or decode job. The heavy cruisers/baggers (Chief, Chieftain, Challenger) use a Polaris proximity fob with a personal PIN override entered via the handlebar switchgear.",
                risk: "LOW on bladed Scout | HIGH on keyless baggers (Polaris Digital Wrench)",
                blankNote: "Indian/Polaris motorcycle blank."
            })
        }
    },

    "MV Agusta": {
        "F3 / F4 / Brutale / Dragster / Turismo Veloce": {
            "2005 - Present": Object.assign({}, BIKE_BASE, {
                price: "Spare key £65-£130 | Lost all keys £180-£300",
                chip: "Mechanical on early F4/Brutale; Eldor / Marelli transponder on modern Euro 4 / Euro 5 bikes",
                warning: "⚠️ Exotic Italian low-volume machines. Early 2000s models surprisingly have no immobiliser at all. Later models use a chipped key (often cloneable for a spare). Treat plastics, tank paint, and alloy yokes with extreme care when picking or decoding.",
                risk: "MODERATE — high-value trim, check for transponder first",
                blankNote: "Zadi (ZD) Italian bike blank profile."
            })
        }
    },

    "Arctic Cat / Textron": {
        "Alterra / Prowler / Wildcat (ATV & UTV)": {
            "2008 - Present": Object.assign({}, ATV_BASE, {
                price: "Spare key £30-£60 | New lock + keys £90-£145",
                chip: "Mechanical — standard non-transponder ignition switch across almost the entire range",
                warning: "⚠️ Common agricultural quad in rural areas. Unlike Polaris and Can-Am, Arctic Cat largely stuck with traditional mechanical ignition switches rather than VIN-gated transponder keys. If all keys are lost, you can either pick and decode the 5-wafer barrel or fit a replacement ignition switch straight off the shelf.",
                risk: "LOW — pure mechanical switch",
                blankNote: "Arctic Cat / Yamaha/Suzuki shared quad blank depending on manufacturing era."
            })
        }
    }
};

// Deep-merge so this file can add a bike model to a make that already
// exists for cars (Honda, Yamaha, Suzuki, BMW) or tractors (Kubota,
// John Deere) without duplicating the make.
function __svaDeepMergeBikes(target, source) {
    Object.keys(source).forEach(function (k) {
        const sv = source[k];
        if (sv && typeof sv === 'object' && !Array.isArray(sv) &&
            target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
            __svaDeepMergeBikes(target[k], sv);
        } else {
            target[k] = sv;
        }
    });
}
if (typeof carDatabase !== 'undefined') {
    Object.keys(BIKES_ATV_DB).forEach(function (make) {
        if (carDatabase[make]) __svaDeepMergeBikes(carDatabase[make], BIKES_ATV_DB[make]);
        else carDatabase[make] = BIKES_ATV_DB[make];
    });
}
