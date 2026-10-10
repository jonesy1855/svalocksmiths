// ============================================================
// NEWER VEHICLES — BYD / Omoda / Jaecoo / GWM / Smart / MG /
// Renault Scenic E-Tech / Kia EV3 / Fiat 600e / VW ID. Buzz &
// ID.7 / Ford Tourneo Custom, Ranger (T6.2), Puma Gen-E.
//
// Separate file on purpose: carDatabase.js is a 12k-line literal
// that is easy to corrupt with a careless edit, and the whole
// catalogue is the app's product. Same field shape as
// carDatabase.js and deep-merged into carDatabase at load (see
// bottom), so live search, the make/model/year dropdowns, the
// result card and the Quote price guide all pick these up with no
// other code change.
//
// MUST load AFTER carDatabase.js and BEFORE trucksAgriDb.js
// (trucksAgriDb deep-merges too, and load order decides who wins
// on a shared make — the HGV/Agri file must stay last so its
// researched lock profiles are the ones that land).
//
// HONESTY RULE (same as the HGV/Agri tranche): a lot of these are
// connected-platform cars whose keysets are new, encrypted or
// dealer-gated. Where a Lishi / Silca / Xhorse reference is not
// verifiable we say "N/A" and route the locksmith honestly rather
// than inheriting a family guess. Every entry carries a `price`
// string in the catalogue's standard two-half format so the Quote
// tab's vehicle-aware guide can parse spare vs AKL rates.
//
// PRICING: the ranges follow the catalogue's existing bands
// (std key £90-£150 for the budget end, £220-£330 for smart /
// high-security, AKL £170-£260 up to £550-£800) and are shifted up
// for vehicles that need dealer or rig coding, since those jobs
// carry higher labour and a lower success rate. Advisory — confirm
// before pricing a job.
// ============================================================

const NEWER_BASE = {
    lishi: "N/A",
    silca: "N/A",
    ic: "N/A",
    xhorse: "N/A",
    module: "Body Control Module / central gateway",
    location: "Cabin — BCM or gateway behind dash/centre console trim",
    access: "Lower dash / console trim. Modern modules often live under the centre stack rather than the OBD port.",
    protocol: "Not confirmed for aftermarket programming on this platform. Verify the exact variant and year against a live job before quoting or promising an OBD add.",
    acGas: "R1234yf",
    acCap: "450g",
    acOil: "PAG 46",
    acNote: "Newer platforms are almost always R1234yf. Always read the under-bonnet or strut-tower label before charging — do not assume from the model."
};

const NEWER_VEHICLES_DB = {

    // ---------------------------------------------------------- BYD
    "BYD": {
        "Atto 3": {
            "2023 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Bluetooth / NFC smart key, encrypted",
                warning: "⚠️ BYD keys are shipped pre-coded per VIN through the dealer. A spare can usually be ordered by VIN, but All Keys Lost needs maker access to the gateway — budget for a dealer or secure-cloud coding route, not an OBD add.",
                price: "Std key £180-£280 | AKL from £450-£650",
                risk: "HIGH — gateway-secure, dealer coding route",
                acCap: "500g"
            })
        },
        "Dolphin": {
            "2023 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Bluetooth smart key, encrypted",
                warning: "⚠️ Dealer-only coding on most variants. Spare keys are VIN-orderable; AKL is a dealer job unless you hold the maker's cloud credentials.",
                price: "Std key £160-£240 | AKL from £420-£600",
                risk: "HIGH — dealer coding route"
            })
        },
        "Seal": {
            "2023 - Present": Object.assign({}, NEWER_BASE, {
                chip: "NFC card / Bluetooth smart key, encrypted",
                warning: "⚠️ NFC card keys are tightly paired to the vehicle. Lost-all keys is a dealer job — quote accordingly and do not promise a roadside programming.",
                price: "Std key £200-£300 | AKL from £500-£700",
                risk: "HIGH — dealer coding route",
                acCap: "550g"
            })
        },
        "Seal U": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "NFC card / Bluetooth smart key, encrypted",
                warning: "⚠️ Same platform as Seal. Dealer/VIN-only coding for spares; AKL via maker.",
                price: "Std key £200-£280 | AKL from £480-£680",
                risk: "HIGH — dealer coding route",
                acCap: "550g"
            })
        },
        "Han": {
            "2023 - Present": Object.assign({}, NEWER_BASE, {
                chip: "NFC / Bluetooth smart key, encrypted",
                warning: "⚠️ Dealer-locked keyset. Treat AKL as a dealer job.",
                price: "Std key £220-£320 | AKL from £550-£750",
                risk: "HIGH — dealer coding route",
                acCap: "600g"
            })
        }
    },

    // ------------------------------------------------- Omoda / Jaecoo
    "Omoda": {
        "Omoda 5": {
            "2023 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key with encrypted transponder (Chery platform)",
                warning: "⚠️ Chery-platform key coding is market-specific and not well documented. Read the keyway off the existing key before quoting — a mechanical spare cut and a coded spare are very different jobs.",
                price: "Std key £150-£230 | AKL from £380-£550",
                risk: "MODERATE-HIGH — verify coding route before quoting",
                acGas: "R1234yf"
            })
        },
        "Omoda 7": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key with encrypted transponder (Chery platform)",
                warning: "⚠️ As Omoda 5. Confirm the exact trim — some variants ship with a different fob and different keyway.",
                price: "Std key £170-£250 | AKL from £420-£580",
                risk: "MODERATE-HIGH — verify coding route before quoting",
                acCap: "500g"
            })
        }
    },

    "Jaecoo": {
        "Jaecoo 7": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key with encrypted transponder (Chery platform)",
                warning: "⚠️ Shares the Chery platform with Omoda. Coding route is not publicly documented — verify before quoting AKL.",
                price: "Std key £170-£250 | AKL from £420-£580",
                risk: "MODERATE-HIGH — verify coding route before quoting",
                acCap: "500g"
            })
        }
    },

    // ------------------------------------------------------------ GWM
    "GWM": {
        "Ora 03": {
            "2023 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key / proximity fob (GWM platform)",
                warning: "⚠️ Ora fobs are cheap and clone poorly. Spare keys are usually VIN-orderable through the dealer; AKL varies by year — verify the gateway route first.",
                price: "Std key £140-£220 | AKL from £380-£550",
                risk: "MODERATE-HIGH",
                acGas: "R134a"
            })
        },
        "Haval Jolion": {
            "2021 - Present (2nd Gen)": Object.assign({}, NEWER_BASE, {
                chip: "Smart key, encrypted transponder",
                warning: "⚠️ 2nd-gen Jolion moved to a different fob from the 1st gen. Confirm the generation before quoting a blank or a programming job.",
                price: "Std key £130-£210 | AKL from £320-£500",
                risk: "MODERATE",
                acGas: "R134a"
            })
        }
    },

    // ----------------------------------------------------------- Smart
    "Smart": {
        "#1": {
            "2020 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Keyless-go smart key (Geely platform)",
                warning: "⚠️ This is the all-new Smart, not the 1998-2007 city car — different make, different platform, different keyset entirely. Coding is dealer/secure-cloud.",
                price: "Std key £160-£240 | AKL from £420-£600",
                risk: "HIGH — dealer coding route"
            })
        },
        "#3": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Keyless-go smart key (Geely platform)",
                warning: "⚠️ Newest Smart. No published aftermarket tooling — treat AKL as dealer-only.",
                price: "Std key £170-£250 | AKL from £440-£620",
                risk: "HIGH — dealer coding route"
            })
        }
    },

    // -------------------------------------------------------------- MG
    "MG": {
        "MG3 Hybrid+": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key, encrypted transponder",
                warning: "⚠️ The Hybrid+ uses a different fob from the earlier MG3. Read the keyway and confirm the key type before ordering a blank.",
                price: "Std key £90-£150 | AKL from £240-£380",
                risk: "MODERATE",
                acGas: "R134a"
            })
        },
        "ZS EV": {
            "2022 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key / proximity fob",
                warning: "⚠️ Facelift changed the fob. Confirm year before quoting.",
                price: "Std key £90-£150 | AKL from £250-£380",
                risk: "MODERATE",
                acGas: "R134a"
            })
        },
        "MG4": {
            "2021 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key / proximity fob",
                warning: "⚠️ MG4 keys are commonly clonable, but the mechanical blade and the smart fob are separate buys — check which one the customer actually lost.",
                price: "Std key £90-£150 | AKL from £250-£400",
                risk: "MODERATE",
                acGas: "R134a"
            })
        },
        "Cyberster": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "NFC key card + smartphone key",
                warning: "⚠️ NFC card key, tightly paired. Spare by VIN via dealer; AKL is dealer-only.",
                price: "Std key £220-£320 | AKL from £550-£750",
                risk: "HIGH — dealer coding route"
            })
        }
    },

    // --------------------------------------------------------- Renault
    "Renault": {
        "Scenic E-Tech": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key, encrypted (CMF-EV platform)",
                warning: "⚠️ CMF-EV is a new platform with no published Lishi keyway data. Renault smart keys are usually dealer-coded; verify the route before quoting.",
                price: "Std key £160-£240 | AKL from £400-£580",
                risk: "MODERATE-HIGH",
                acCap: "450g"
            })
        }
    },

    // ------------------------------------------------------------- Kia
    "Kia": {
        "EV3": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key, encrypted (E-GMP platform)",
                warning: "⚠️ Kia/Hyundai smart keys are card-type on many EV trims and dealer-coded. Verify the coding route before quoting AKL.",
                price: "Std key £160-£240 | AKL from £400-£580",
                risk: "MODERATE-HIGH"
            })
        },
        "EV9": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key card, encrypted (E-GMP platform)",
                warning: "⚠️ As EV3. Large three-row platform — worth quoting the higher AKL band.",
                price: "Std key £180-£260 | AKL from £450-£650",
                risk: "MODERATE-HIGH",
                acCap: "550g"
            })
        }
    },

    // ------------------------------------------------------------ Fiat
    "Fiat": {
        "600e": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key, encrypted (Stellantis)",
                warning: "⚠️ Stellantis smart-key platform. Coding route is dealer/connected; verify before quoting.",
                price: "Std key £150-£220 | AKL from £380-£550",
                risk: "MODERATE"
            })
        }
    },

    // ----------------------------------------------------- Volkswagen
    // NOTE: ID. Buzz is deliberately absent. carDatabase.js already
    // carries a better-researched "ID. Buzz (EV Lineup)" record (HU162T,
    // Megamos AES, SFD gateway token, POE oil) and a near-duplicate here
    // would only split the search results and dilute that entry.
    "Volkswagen": {
        "ID.7": {
            "2024 - Present (MEB)": Object.assign({}, NEWER_BASE, {
                lishi: "HU162T (9 / 10 Cut)",
                silca: "HU162T",
                ic: "Card 1412 / 1413",
                chip: "VAG Megamos AES / 4A (VW MEB)",
                xhorse: "OEM MEB Smart Key Only",
                warning: "⚠️ Same MEB gateway and SFD protection as the ID. Buzz — see that record for the full architecture. HV vehicle: work to the manufacturer isolation procedure before touching the KESSY module.",
                module: "MEB KESSY Module & Gateway",
                location: "Passenger footwell behind glovebox assembly",
                access: "Release glovebox retention tabs and lower the assembly.",
                price: "Std key £220-£320 | AKL from £550-£750",
                risk: "HIGH — SFD gateway token, VAG online server calculation",
                acGas: "R1234yf",
                acCap: "550g ± 20g",
                acOil: "POE",
                acNote: "🛑 100% electric — non-conductive POE compressor oil ONLY."
            })
        }
    },

    // ------------------------------------------------------------ Ford
    "Ford": {
        "Tourneo Custom": {
            "2023 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Smart key, encrypted transponder",
                warning: "⚠️ Ford moved the Custom to gateway-protected key coding. An OBD add needs an FDRS session or a gateway bypass — quote the labour accordingly, don't promise a quick add.",
                price: "Std key £160-£240 | AKL from £380-£550",
                risk: "MODERATE-HIGH — gateway-protected",
                acCap: "500g"
            })
        },
        "Ranger": {
            "2023 - Present (T6.2)": Object.assign({}, NEWER_BASE, {
                chip: "Smart key, encrypted transponder",
                warning: "⚠️ T6.2 shares the gateway-protected coding with the Transit Custom. Confirm the year — pre-2019 Ranger is a different, cheaper job.",
                price: "Std key £130-£200 | AKL from £320-£480",
                risk: "MODERATE",
                acCap: "500g"
            })
        },
        "Puma Gen-E": {
            "2024 - Present": Object.assign({}, NEWER_BASE, {
                chip: "Proximity smart key",
                warning: "⚠️ Electric Puma uses a different fob from the petrol car. Confirm before ordering.",
                price: "Std key £140-£220 | AKL from £360-£520",
                risk: "MODERATE"
            })
        }
    }
};

// Deep-merge into the master catalogue. Same shape as the HGV/Agri
// merge below it: existing models on a shared make are kept, new
// models are added, and per-field values already on the record win
// over the shared base — so these records never overwrite researched
// car data, they only fill in makes and models that were missing.
function __svaDeepMergeNewer(target, source) {
    Object.keys(source).forEach(function (k) {
        const sv = source[k];
        if (sv && typeof sv === 'object' && !Array.isArray(sv) &&
            target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
            __svaDeepMergeNewer(target[k], sv);
        } else {
            target[k] = sv;
        }
    });
}
if (typeof carDatabase !== 'undefined') {
    Object.keys(NEWER_VEHICLES_DB).forEach(function (make) {
        if (carDatabase[make]) __svaDeepMergeNewer(carDatabase[make], NEWER_VEHICLES_DB[make]);
        else carDatabase[make] = NEWER_VEHICLES_DB[make];
    });
}
