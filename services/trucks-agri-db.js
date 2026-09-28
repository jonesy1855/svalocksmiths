// ============================================================
// TRUCKS & AGRI — HGV / haulage and agricultural machinery
// reference tranche, shared with the SVA FieldMate Pro app so
// the website and the app quote from one catalogue. Same field
// shape as car-database.js and deep-merged into carDatabase at
// load (see bottom), so live search, the make/model/year
// dropdowns and the result card all pick these up with no
// further code changes.
//
// MUST be loaded AFTER car-database.js — it merges into the
// carDatabase object that script defines.
//
// HONESTY RULE: truck/agri keysets are fragmented and often
// dealer-locked. Where an exact chip/tool is not certain the
// entry stays advisory ("verify against the machine").
// ============================================================

const HGV_BASE = {
    "segment": "HGV",
    "lishi": "N/A",
    "silca": "N/A",
    "ic": "N/A",
    "xhorse": "N/A",
    "module": "Multiplexed cab body electronics",
    "location": "Cab dash / firewall area, behind trim",
    "access": "Cab trim removal; driver's seat fully back",
    "risk": "MODERATE — lost keys route via maker/dealer or a specialist rig",
    "protocol": "PIN via maker dealer by VIN; key coding with maker tooling or an approved rig. Verify the exact chassis variant before quoting.",
    "acGas": "R134a",
    "acCap": "Per under-bonnet label",
    "acOil": "PAG 46",
    "acNote": "Cab A/C systems are large and cab-variant dependent — always charge to the machine's label, never a car spec.",
    "entry": "Cab door lock cylinder / handle release. HGV door seals wedge well — never lever an aerodynamic cab's A-pillar.",
    "battery": "Under-cab tray — often dual batteries; isolate the chassis earth before touching terminals.",
    "battType": "Typically 2x 12V HGV-grade AGM.",
    "fobBatt": "CR2032",
    "fobCount": "Two cab keys standard",
    "fobNote": "Multiplexed cabs: a flat fob battery mimics a lock fault — replace the cell before deeper diagnosis.",
    "blankNote": "Cab keys use maker-specific blades — cut from code or a dealer/fleet blank; cheap blades fail fast in heavy handles."
};

const AGRI_BASE = {
    "segment": "Agri",
    "lishi": "N/A",
    "silca": "N/A",
    "ic": "N/A",
    "xhorse": "N/A",
    "module": "Cab multiplexed controllers (dash / roof console)",
    "location": "Inside cab, behind console / under roof trim",
    "access": "Cab ladder-up entry; console trim panels",
    "risk": "LOW-MODERATE — cab entry and cylinders via standard tooling; coded keys usually maker/dealer route",
    "protocol": "Mechanical cab/door work is the locksmith's in; coded keys normally via maker/dealer by machine serial. Verify the machine generation before pricing.",
    "acGas": "R134a",
    "acCap": "Per cabin label",
    "acOil": "PAG 46",
    "acNote": "Cabin A/C is a specialist charge — follow the machine label, not a car spec.",
    "entry": "Cab door latch/handle cylinders are mechanically simple and pickable on most makes — wedge the door seal and work the latch, confirm lock type before levering.",
    "battery": "Single heavy-duty 12V AGM under the bonnet / side pod; isolate before service.",
    "battType": "12V heavy-duty AGM (100Ah+ class).",
    "blankNote": "Steel machine keys cut from code suit older mechanical locks; coded modern keys need dealer blanks."
};

const TRUCKS_AGRI_DB = {
    "DAF": {
        "XF": {
            "2013 - 2021 (XF105 / XF106)": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£350 (dealer or rig)",
                chip: "Transponder cab key — PIN via DAF dealer by VIN; newer multiplexed cabs coded with maker tooling.",
                warning: "⚠️ DAF lost-ALL-key jobs route through PACCAR/dealer — quote the dealer or a truck rig, not an OBD add.",
                tip: "XF doors are heavy, well-sealed HGV units — wedge and long-reach; never lever an aerodynamic cab's A-pillar."
            })
        },
        "LF": {
            "2013 - 2021 (LF / LF45-LF55)": Object.assign({}, HGV_BASE, {
                price: "Cab key £80-£140 | Lost key / AKL from £180-£300",
                chip: "Transponder cab key — PIN via DAF dealer by VIN.",
                tip: "LF is distribution-route common — fleet ops often hold spare keys; check before AKL-pricing."
            })
        },
        "XG / XG+": {
            "2021 - Present (New Generation)": Object.assign({}, HGV_BASE, {
                price: "Cab key £95-£160 | Lost key / AKL from £230-£400",
                chip: "Transponder cab key — PIN via DAF dealer by VIN; New-Gen coded on maker tooling.",
                tip: "XG cab is the newest PACCAR platform — confirm chassis variant before ordering blanks or chips."
            })
        },
        "CF": {
            "2013 - Present (CF, incl. new CF Euro 6)": Object.assign({}, HGV_BASE, {
                price: "Cab key £80-£140 | Lost key / AKL from £180-£300",
                chip: "Transponder cab key — PIN via DAF dealer by VIN.",
                tip: "CF is the fleet-workhorse — shared cab architecture with XF, so keys and blanks interchange-check against the chassis."
            })
        }
    },
    "Scania": {
        "R-Series": {
            "2018 - Present (New Generation)": Object.assign({}, HGV_BASE, {
                price: "Cab key £95-£160 | Lost key / AKL from £220-£380",
                chip: "Transponder cab key — PIN via Scania dealer by VIN; new-gen coded on maker tooling.",
                tip: "New-Gen Scania cabs are fully multiplexed — dead fob batteries mimic many faults, change the CR2032 first."
            })
        },
        "P / G / S-Series": {
            "2018 - Present (New Generation)": Object.assign({}, HGV_BASE, {
                price: "Cab key £90-£150 | Lost key / AKL from £200-£350",
                chip: "Transponder cab key — PIN via Scania dealer by VIN.",
                tip: "Aerodynamic cab A-pillars are not load-bearing points — always wedge and long-reach the door."
            })
        },
        "R / G / P Previous Gen": {
            "2010 - 2018": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£340",
                chip: "Transponder cab key — PIN via Scania dealer by VIN; older cabs code on maker tooling.",
                tip: "Previous-gen cabs still dominate the UK fleet — a large slice of roadside truck AKL calls are these."
            })
        }
    },
    "Volvo Trucks": {
        "FH": {
            "2013 - Present (FH4 / FH5)": Object.assign({}, HGV_BASE, {
                price: "Cab key £90-£160 | Lost key / AKL from £220-£380",
                chip: "Transponder/coded cab key — PIN via Volvo Trucks dealer by VIN.",
                warning: "⚠️ Volvo FH keys are VIN-coded — order by chassis and expect maker/dealer or rig coding.",
                tip: "FH cab doors use heavy seals — wedge low, long-reach to the latch release, confirm lock type before levering."
            })
        },
        "FM": {
            "2013 - Present (FM4 / FM5)": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£340",
                chip: "Transponder/coded cab key — PIN via Volvo Trucks dealer by VIN.",
                tip: "FM shares FH key architecture — check chassis variant when ordering blanks."
            })
        },
        "FL / FE": {
            "2012 - Present (Distribution)": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£340",
                chip: "Transponder/coded cab key — PIN via Volvo Trucks dealer by VIN.",
                tip: "FL/FE cover 12-18t urban work — bodybuilders add their own locks; ask which body is fitted before pricing."
            })
        },
        "FH / FM (2009 - 2012)": {
            "2009 - 2012 (FH4-legacy / FM3-legacy)": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£340",
                chip: "Transponder/coded cab key — PIN via Volvo Trucks dealer by VIN.",
                tip: "Older Volvo cabs still use the VIN-coded system — the dealer/rig PIN route applies exactly the same."
            })
        }
    },
    "MAN": {
        "TGX": {
            "2012 - Present (TGX / TG3)": Object.assign({}, HGV_BASE, {
                price: "Cab key £90-£160 | Lost key / AKL from £220-£380",
                chip: "Transponder cab key — PIN via MAN dealer by VIN; multiplexed coding on maker tooling.",
                tip: "MAN shutter-style and blade keys both exist by year — confirm the blade before ordering a blank."
            })
        },
        "TGL / TGM": {
            "2012 - Present (16-26t)": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£340",
                chip: "Transponder cab key — PIN via MAN dealer by VIN.",
                tip: "TGL/TGM are the construction-fleet workhorses — many carry telematics boxes; confirm the symptoms are keys, not tracking faults."
            })
        }
    },
    "Mercedes-Benz": {
        "Actros / Arocs": {
            "2012 - 2021 (New Generation)": Object.assign({}, HGV_BASE, {
                price: "Cab key £95-£165 | Lost key / AKL from £230-£400",
                chip: "Transponder/coded cab key — PIN via Mercedes dealer by VIN.",
                tip: "Newest Actros cabs may carry R1234yf A/C instead of R134a — read the label before quoting a recharge."
            })
        },
        "Atego": {
            "2013 - Present": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£340",
                chip: "Transponder cab key — PIN via Mercedes dealer by VIN.",
                tip: "Medium-rig Ategos mostly run R134a — verify the label; cab keys follow Sprinter-era architecture."
            })
        },
        "Econic": {
            "2017 - Present (Low-entry / bin)": Object.assign({}, HGV_BASE, {
                price: "Cab key £90-£160 | Lost key / AKL from £220-£380",
                chip: "Transponder/coded cab key — PIN via Mercedes dealer by VIN.",
                warning: "⚠️ Municipal Econics are hired on contracts — the fleet keeps master/spare keys; ask the operator before AKL-pricing.",
                tip: "Low-entry side access makes the cab door easier to work — but never lever the wrap-around glazing."
            })
        }
    },
    "Iveco": {
        "S-Way / Stralis": {
            "2013 - Present (S-Way 2021+, Stralis to 2020)": Object.assign({}, HGV_BASE, {
                price: "Cab key £90-£160 | Lost key / AKL from £220-£380",
                chip: "Transponder/coded cab key — PIN via Iveco dealer by VIN.",
                tip: "S-Way cab is fully multiplexed; isolate the chassis earth before any module work."
            })
        },
        "Eurocargo": {
            "2013 - Present (7.5-16t midi)": Object.assign({}, HGV_BASE, {
                price: "Cab key £80-£140 | Lost key / AKL from £180-£300",
                chip: "Transponder cab key — PIN via Iveco dealer by VIN.",
                tip: "Eurocargo is a midi-rig — many are bodybuilders with aftermarket locks fitted; ask about the body first."
            })
        }
    },
    "Renault Trucks": {
        "T / K Series": {
            "2013 - Present (T-high / K)": Object.assign({}, HGV_BASE, {
                price: "Cab key £90-£160 | Lost key / AKL from £220-£380",
                chip: "Transponder/coded cab key — PIN via Renault Trucks dealer by VIN.",
                tip: "Renault Trucks cabs share Volvo-era architecture — verify the generation when ordering chips or blanks."
            })
        },
        "D / C Wide": {
            "2013 - Present (Distribution / Construction)": Object.assign({}, HGV_BASE, {
                price: "Cab key £85-£150 | Lost key / AKL from £200-£340",
                chip: "Transponder cab key — PIN via Renault Trucks dealer by VIN.",
                tip: "D-range cabs are the urban/vocational spread of the family — same Volvo-era PIN route as T/K."
            })
        }
    },
    "Isuzu": {
        "N-Series (NPR / NQR / NPS)": {
            "2012 - Present (7.5t light truck)": Object.assign({}, HGV_BASE, {
                lishi: "DAT12R (X154/B54) / ISU5 (B113)",
                price: "Cab key £70-£120 | Lost key / AKL from £160-£280",
                chip: "Transponder cab key — PIN via Isuzu dealer by VIN.",
                entry: "N-Series cabs are reachable — wedge low and long-reach the latch; the door geometry is vander than a car.",
                tip: "Fleet N-Series usually keep spare keys in the depot — check before charging AKL rates.",
                warning: "Isuzu is one of the few HGV makes Lishi actually tools. DAT12R (X154/B54) is sold as the Isuzu Heavy Truck pick; ISU5 (B113) is the Isuzu car/LCV depth. Match the depth to the lock before you commit — wrong depth costs you a tool, not just a job."
            })
        }
    },
    "Mitsubishi Fuso": {
        "Canter": {
            "2016 - Present (7C / 8C class)": Object.assign({}, HGV_BASE, {
                price: "Cab key £70-£120 | Lost key / AKL from £160-£280",
                chip: "Transponder cab key — PIN via Fuso dealer by VIN.",
                tip: "Canters are big on landscaping/food-service run routes — fleet spares are common, ask first."
            })
        }
    },
    "Hino": {
        "500 / 700": {
            "2013 - Present (7.5-32t)": Object.assign({}, HGV_BASE, {
                lishi: "HI1 / DAT12R (X154/B54)",
                price: "Cab key £80-£140 | Lost key / AKL from £180-£300",
                chip: "Transponder cab key — PIN via Hino dealer by VIN.",
                tip: "Hino runs Toyota-family key architecture in places — verify the chassis before ordering blanks.",
                warning: "Hino is charted to the Lishi HI1, and the DAT12R (X154/B54) is listed for Hino heavy trucks alongside Isuzu. Read the keyway off the existing key first — HI1 and DAT12R are not interchangeable."
            })
        }
    },
    "John Deere": {
        "6R / 6M Series": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £60-£120 | Dealer-coded key from £150-£400 (by machine)",
                chip: "Dealer-coded/smart key on 2000+ models; older machines (pre-2000) run mechanical keys only — cut and pin change viable.",
                warning: "⚠️ John Deere keys are dealer-programmed for later machines — expect a dealer route for lost keys, not OBD.",
                entry: "JD cab doors use standard pin-tumbler cylinders that pick cleanly — wedge the door seal and work the latch."
            })
        },
        "5G / 5E Utility": {
            "2010 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £55-£110 | Dealer-coded key from £140-£350",
                chip: "Utility machines are mostly mechanical-key — replacement by door/ignition lock cut is usually viable.",
                entry: "5G cabs run simple door cylinders — standard auto-tooling works; confirm lock type before levering."
            })
        },
        "8R / 9R Row Crop": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £70-£130 | Dealer-coded key from £180-£450 (by machine)",
                chip: "Premium row-crop range — smart/coded key, dealer route by machine serial.",
                entry: "8R/9R cabs are 4-post platforms with conventional door cylinders — wedge, long-reach, work the latch."
            })
        },
        "6010 / 6020 Series": {
            "2000 - 2008 (6010 / 6020 / 6030)": Object.assign({}, AGRI_BASE, {
                price: "Cab key £50-£100 (mechanical) | Coded add-on from £120-£250",
                chip: "Mostly mechanical-key era — cut from code or door/ignition; later 6030s gained coded options.",
                tip: "The 6000 family is still a huge UK fleet — mechanical key work here is a fast, clean earner."
            })
        },
        "S-Series Combine": {
            "2014 - Present (S760 onward, incl. X9)": Object.assign({}, AGRI_BASE, {
                price: "Cab key £70-£130 | Dealer/Combine-coded key from £180-£400",
                chip: "Coded key via John Deere dealer by machine serial.",
                warning: "⚠️ Combines carry serious telematics (run hours, location) — book combine key work as dealer/ADM; never OBD-poke a header controller.",
                entry: "Combine cabs lock like tractors — standard door cylinders, but access is higher; take a proper ladder."
            })
        }
    },
    "New Holland": {
        "T6 / T7": {
            "2013 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £60-£120 | Dealer-coded key from £150-£350",
                chip: "Coded key via New Holland dealer by machine serial; cab doors stay mechanically simple.",
                entry: "T6 / T7 cab doors have conventional cylinders — wedge, long-reach, work the latch."
            })
        },
        "T8 / T9": {
            "2014 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £60-£120 | Dealer-coded key from £160-£380",
                chip: "Coded key via New Holland dealer by machine serial; T9 chassis are Moose-platform heavy tractors.",
                entry: "T8/T9 cabs open with standard cylinders — the mechanical route is the locksmith's in."
            })
        },
        "TL / TS Classic": {
            "1990 - 2005 (mechanical-era)": Object.assign({}, AGRI_BASE, {
                price: "Mechanical steel keys — cut from code £40-£90",
                chip: "Mechanical-only — replacement by door/ignition lock cut; no coding on these.",
                entry: "Classic TL/TS doors are plainly pickable — wedge and work the latch, standard tooling."
            })
        }
    },
    "Case IH": {
        "Puma": {
            "2013 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £60-£120 | Dealer-coded key from £150-£350",
                chip: "Coded key via Case IH dealer by machine serial.",
                entry: "Puma cabs open with standard cylinders — the mechanical route is the locksmith's in."
            })
        },
        "Magnum / Optum": {
            "2016 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £60-£120 | Dealer-coded key from £160-£380",
                chip: "Coded key via Case IH dealer by machine serial.",
                entry: "Magnum/Optum cabs pick cleanly at the door — wedge and long-reach."
            })
        },
        "Maxxum": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £55-£110 | Dealer-coded key from £140-£350",
                chip: "Coded key via Case IH dealer by machine serial.",
                entry: "Maxxum doors use conventional cylinders — mechanical opening first, then the key route if needed."
            })
        },
        "Steiger (Tracked)": {
            "2010 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £65-£120 | Dealer-coded key from £160-£380",
                chip: "Coded key via Case IH dealer by machine serial — tracked frames carry the same cab electronics family.",
                entry: "Steiger cabs are high-access — take the ladder and work the door latch, never lever the skin."
            })
        }
    },
    "Massey Ferguson": {
        "5S / 7S": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £55-£110 | Dealer-coded key from £140-£350",
                chip: "Coded key via MF dealer for later machines; mechanical-only on many older models.",
                entry: "MF cab doors are simple to open — wedge and work the latch, never lever the cab skin."
            })
        },
        "7700 / 8700 Dynamic": {
            "2007 - 2017": Object.assign({}, AGRI_BASE, {
                price: "Cab key £50-£100 | Dealer-coded key from £130-£320",
                chip: "Mechanical era with late coded options — confirm the model year before quoting coding.",
                entry: "7700/8700 cabs open mechanically with standard cylinders — quick clean entry work."
            })
        }
    },
    "Fendt": {
        "900 Vario": {
            "2012 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £70-£130 | Dealer-coded key from £200-£450 (Fendt-specific)",
                chip: "Highly restricted Fendt keyset — dealer/maker path for coded keys.",
                warning: "⚠️ Fendt keys are among the most restricted in agri — quote dealer coding, and sell the cab-entry/cylinder work yourself."
            })
        },
        "1000 Vario": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £75-£140 | Dealer-coded key from £220-£480 (Fendt-specific)",
                chip: "Most restricted Fendt keyset (flagship platform) — expect the dealer route outright.",
                warning: "⚠️ Treat 1000 Vario as a dealer-coded job end-to-end; price transparency wins trusted estate work.",
                entry: "1000-series cab doors still open mechanically — sell entry/cylinder work separately, then hand the key to dealer coding."
            })
        },
        "300 Vario": {
            "2013 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £65-£120 | Dealer-coded key from £180-£420 (Fendt-specific)",
                chip: "Restricted Fendt keyset — dealer/maker path; smaller frame, same rules.",
                entry: "300 Vario compact cabs — wedge and long-reach, small doors mean tight access."
            })
        }
    },
    "Claas": {
        "Axion 900": {
            "2013 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £60-£120 | Dealer-coded key from £150-£350",
                chip: "Coded key via Claas dealer by machine serial; cab doors mechanically simple.",
                entry: "Axion cabs pick cleanly at the door — standard wedge and long-reach."
            })
        },
        "Arion": {
            "2014 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £55-£110 | Dealer-coded key from £140-£350",
                chip: "Coded key via Claas dealer by machine serial.",
                entry: "Arion doors open mechanically — wedge, long-reach, work the latch."
            })
        },
        "Lexion Combine": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £70-£130 | Dealer-coded key from £180-£400",
                chip: "Coded key via Claas dealer — combines use the same cab electronics family as Arion/Axion.",
                warning: "⚠️ Harvesters are high-value, telematics-heavy — book combine keys as dealer/ADM work, never an OBD poke.",
                entry: "Lexion cab access is up a proper ladder — wedge and work the door latch normally, keep hands off the glazing."
            })
        },
        "Xerion": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £70-£130 | Dealer-coded key from £180-£400",
                chip: "Coded key via Claas dealer by machine serial; articulated frame carries the standard cab electronics.",
                tip: "Xerion is an articulated specialist — confirm the machine before quoting; cab work is otherwise standard Claas."
            })
        }
    },
    "Kubota": {
        "M-Series": {
            "2010 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £45-£90 | Coded/maker key from £120-£300",
                chip: "Mostly mechanical-key machines — replacement by lock cut; newer models have maker-coded options.",
                entry: "Compact-frame cabs — wedge and long-reach; smaller doors mean tighter access."
            })
        },
        "M7 / M8": {
            "2015 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £50-£100 | Coded/maker key from £130-£320",
                chip: "Flagship Kubota range — later machines coded by maker; frames stay mechanically openable.",
                entry: "M7/M8 cabs use conventional cylinders — wedge, long-reach, work the latch."
            })
        }
    },
    "Valtra": {
        "T / G Series": {
            "2013 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £55-£110 | Dealer-coded key from £140-£350",
                chip: "Coded key via Valtra dealer by machine serial; AGCO-family electronics.",
                tip: "Valtra shares AGCO cab architecture with some Massey Ferguson ranges — verify the generation before ordering."
            })
        }
    },
    "Deutz-Fahr": {
        "6 / 9 S-Max Series": {
            "2013 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £55-£110 | Dealer-coded key from £140-£350",
                chip: "Coded key via Deutz-Fahr dealer by machine serial.",
                entry: "Deutz-Fahr cabs open mechanically with standard cylinders — wedge and work the latch."
            })
        }
    },
    "JCB": {
        "Loadall": {
            "2010 - Present (530-560 series)": Object.assign({}, AGRI_BASE, {
                price: "Cab key £50-£100 | Dealer-coded key from £150-£350 (JCB keyset)",
                chip: "JCB smart keyset (VIC) is dealer-coded; older Loadalls run conventional handles.",
                warning: "⚠️ JCB keysets are dealer-locked — expect a dealer route for lost keys, not OBD.",
                tip: "Loadalls live on farms and sites — telematics/PTO faults are often booked as 'key faults'; confirm symptoms first."
            })
        },
        "Fastrac": {
            "2015 - Present (4000 / 8000)": Object.assign({}, AGRI_BASE, {
                price: "Cab key £55-£110 | Dealer-coded key from £160-£380 (JCB keyset)",
                chip: "JCB smart keyset dealer-coded; door handles use conventional lock cylinders.",
                entry: "Fastrac road-speed cabs — door cylinders are pickable; use load-tolerant wedge points, not the cab skin."
            })
        },
        "3CX Backhoe": {
            "2010 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £50-£100 | Dealer-coded key from £150-£350 (JCB keyset)",
                chip: "JCB keyset (VIC) dealer-coded on later machines; classic 3CXs are mechanical-key outright.",
                entry: "3CX cabs open with standard cylinders — wedge and work the latch; access is via a step ladder."
            })
        },
        "Teletruk": {
            "2013 - Present": Object.assign({}, AGRI_BASE, {
                price: "Cab key £50-£100 | Dealer-coded key from £150-£350 (JCB keyset)",
                chip: "JCB smart keyset dealer-coded; lift-truck frame keeps basic door cylinders.",
                entry: "Teletruk cabs are yard-level — standard pickable door cylinders; wedge and long-reach."
            })
        }
    }
};

// ---- LOCK PROFILE RESEARCH ---------------------------------------------
// The defining data for a farm/HGV job is not the Lishi code, it is:
// what the lock physically is, what code identifies it, and whether
// you can open it. Everything below is researched, and every row
// carries its own evidence level so nothing reads as more certain
// than it is.
//
// conf: "documented" = part number / key code confirmed against a
//       manufacturer parts catalogue or an equipment-key supplier.
//       "family"      = solid prior from the parent company's key
//                       programme or a shared platform, but confirm.
//       "generic"     = the common arrangement for the segment, not
//                       verified per model. Confirm before cutting.
//
// THE UNIVERSAL IDENTIFIER, and the most useful line on this card:
// on essentially all plant and HGV locks the key code is stamped on
// the key bow AND repeated on the face of the lock or the barrel.
// If the customer still has a key, read it. If not, read the lock.
const LOCK_PROFILE = {
    // ---- HGV: cab doors across the European truck range are serviceable
    // mechanical cylinders. Aftermarket "cylinder + 2 keys" kits are sold
    // for Volvo/Scania/MAN/Mercedes/DAF/Renault/Iveco, which is the proof
    // that keys are cut from a code and not dealer-only.
    "DAF": {
        lockType: "Mechanical euro-profile cab door cylinder",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "Cut from the barrel code — DAF cab key blank",
        pickable: "Yes — euro profile, pickable or override. Do NOT lever the A-pillar",
        conf: "generic"
    },
    "Scania": {
        lockType: "Mechanical euro-profile cab door cylinder",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "Cut from the barrel code — Scania cab key blank",
        pickable: "Yes — euro profile, pickable or override",
        conf: "generic"
    },
    "MAN": {
        lockType: "Mechanical euro-profile cab door cylinder",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "Cut from the barrel code — MAN cab key blank",
        pickable: "Yes — euro profile, pickable or override",
        conf: "generic"
    },
    "Volvo Trucks": {
        lockType: "Serviceable mechanical cylinder — cylinder kits sold with 2 keys",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "Cut from the barrel code. Cylinder kit 3090483 (FH/FM/NH) is '1 cylinder, 2 keys'",
        pickable: "Yes — mechanical cylinder is replaceable; the door mechanism (21505893/94) is a separate part",
        conf: "documented"
    },
    "Renault Trucks": {
        lockType: "Mechanical euro-profile cab door cylinder",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "Cut from the barrel code — Renault cab key blank",
        pickable: "Yes — euro profile, pickable or override",
        conf: "generic"
    },
    // Mercedes and Iveco: our own car DB already verifies the keyway for the
    // light-commercial siblings of these trucks. Actros/Eurocargo cab doors
    // very often use the same keyway, but that is a strong prior, not a fact.
    "Mercedes-Benz": {
        lockType: "Mechanical cab door cylinder, Mercedes keyway family",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "HU64 family — verified in our car DB on the Sprinter (W906 = HU64, W907/W910 = HU64/HU136)",
        pickable: "Try HU64 first — it is the Mercedes keyway, but confirm the barrel before you commit",
        conf: "family"
    },
    "Iveco": {
        lockType: "Mechanical cab door cylinder, Fiat-derived keyway on older units",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "SIP22 on pre-Euro VI (verified in our car DB on the Daily 2006-2014); Euro VI moved to a new keyway",
        pickable: "Try SIP22 on older cabs; Euro VI is a different keyway — read the code",
        conf: "family"
    },
    "Mitsubishi Fuso": {
        lockType: "Mechanical cab door cylinder, Iveco-Daily-derived cab on most Canter/Fuso",
        lockCode: "Code stamped on the lock barrel face; read it before ordering",
        blank: "Try SIP22 — the Fuso Canter cab is derived from the Iveco Daily (SIP22 in our car DB). Confirm the barrel",
        pickable: "Likely yes — euro profile, pickable or override. Confirm before quoting",
        conf: "family"
    },
    "Isuzu": {
        lockType: "Mechanical cylinder, deeper 5-depth wafer on heavy trucks",
        lockCode: "Code stamped on the lock barrel face",
        blank: "DAT12R (X154/B54) heavy-truck depth, or ISU5 (B113) car/LCV depth — match the depth to the lock",
        pickable: "Yes — pick and decode with the matching Lishi depth; standard CY24 will NOT reach the 5th wafer",
        conf: "documented"
    },
    "Hino": {
        lockType: "Mechanical cylinder, Toyota-family key architecture on some units",
        lockCode: "Code stamped on the lock barrel face",
        blank: "HI1 (charted to Hino trucks) or DAT12R (X154/B54, listed for Hino heavy) — not interchangeable",
        pickable: "Yes with the matching tool; read the keyway before choosing HI1 vs DAT12R",
        conf: "documented"
    },

    // ---- AGRI. Note the two alliances: CNH runs New Holland and Case IH
    // on a SHARED key programme, and AGCO runs Massey Ferguson, Valtra,
    // Fendt, Challenger and Gleaner — so AGCO's ACW/ACX/429xxxxMxx family
    // is a live prior for Fendt and Valtra too.
    "JCB": {
        lockType: "Mechanical steel cab door key, code stamped on bow and barrel",
        lockCode: "14603 / 14607 / 14707 / 14657 / 334-D2856 / 334-D2895 / 701-45501A / ELI80-0088. Fastrac: 2820308170, 2440311000, NFHPR731101101",
        blank: "JCB 146xx-series machine key (14601-14650 family)",
        pickable: "Yes — older mechanical cylinders are pickable; decode and cut from the code",
        conf: "documented"
    },
    "John Deere": {
        lockType: "Mechanical machine key, code stamped on bow; smart key on later models",
        lockCode: "Genuine OE key blank TriMark KS970 (also sold as KS960, KS970R/S/P). Yard tractors: E1098JD / JD-3D. Part nos. include AT194969, GY20680",
        blank: "TriMark KS970 for tractors; E1098JD for yard tractors",
        pickable: "Older machines — yes, mechanical and decodable. 2000+ smart-key models route to dealer",
        conf: "documented"
    },
    "New Holland": {
        lockType: "Mechanical machine key, code stamped on bow",
        lockCode: "86502903 (also E9NN11603AB; 81877351 obsolete; keys marked 92274). Also 71451203, 86533202, 9971268",
        blank: "NH/CNH machine key — the SAME blank as Case IH on the shared CNH programme",
        pickable: "Older mechanical machines yes; coded/smart machines route to dealer by serial",
        conf: "documented"
    },
    "Case IH": {
        lockType: "Mechanical machine key, code stamped on bow",
        lockCode: "86502903 and 89995262 — the same blanks as New Holland (shared CNH programme). Challenger: 71468224, VA371222",
        blank: "NH/CNH shared machine key blank",
        pickable: "Older mechanical machines yes; coded machines route to dealer by serial",
        conf: "documented"
    },
    "Massey Ferguson": {
        lockType: "Mechanical machine key, code stamped on bow",
        lockCode: "3813582M1 (marked 5713), 4297513M91, ACW1987250, ACX315899A (cab door), ACX4046710, 4354361M3, 3902584M91, 4290720M1, ACW0461630/3A",
        blank: "AGCO machine key — ACW/ACX/429xxxxMxx family",
        pickable: "Older mechanical machines yes; AGCO-coded machines route to dealer",
        conf: "documented"
    },
    "Fendt": {
        lockType: "Mechanical machine key — Fendt sits inside the AGCO key programme",
        lockCode: "Look for the AGCO ACW/ACX/429xxxxMxx codes (Massey Ferguson uses these). Confirm on the bow",
        blank: "AGCO machine key family — confirm the code before cutting",
        pickable: "Mechanical cab cylinders usually pickable; coded keys dealer-only, and Fendt keys are among the most restricted in agri",
        conf: "family"
    },
    "Valtra": {
        lockType: "Mechanical machine key — Valtra is AGCO-owned, so AGCO key family applies",
        lockCode: "Look for the AGCO ACW/ACX/429xxxxMxx codes (Massey Ferguson uses these). Confirm on the bow",
        blank: "AGCO machine key family — confirm the code before cutting",
        pickable: "Mechanical cab cylinders usually pickable; coded keys dealer-only",
        conf: "family"
    },
    "Claas": {
        lockType: "Mechanical machine key, code stamped on bow",
        lockCode: "013142 / 0000131420",
        blank: "Claas machine key",
        pickable: "Older mechanical machines yes; coded/combine keys dealer or ADM route",
        conf: "documented"
    },
    "Kubota": {
        lockType: "Mechanical cab door cylinder, code stamped on bow/barrel",
        lockCode: "Read the code off the key bow or the lock face — we have no confirmed Kubota code yet",
        blank: "Cut from the code — order the blank to match",
        pickable: "Usually yes — small utility cabs use simple mechanical cylinders, but confirm before quoting",
        conf: "generic"
    },
    "Deutz-Fahr": {
        lockType: "Mechanical cab door cylinder, code stamped on bow/barrel",
        lockCode: "Read the code off the key bow or the lock face — no confirmed Deutz code yet",
        blank: "Cut from the code — order the blank to match",
        pickable: "Usually yes on older mechanical machines; confirm the lock before quoting",
        conf: "generic"
    }
};

// ---- Lishi coverage pass ------------------------------------------------
// Lishi publishes an automotive-only tool range. Across the whole
// published catalogue the only plant/commercial applications are
// DAT12R (Isuzu / Hino heavy trucks), ISU5 (Isuzu), HI1 (Hino),
// CY24-CV and CY24-TRUCK (Chrysler/Dodge/Jeep/Peterbilt commercial) —
// there is no Lishi tooling for agricultural machinery at all.
//
// So an entry we could not match to a published Lishi tool now says
// so outright instead of showing a bare "N/A", and carries the
// realistic non-Lishi route so the card is still actionable at the
// roadside. Runs over TRUCKS_AGRI_DB only, before the merge, so the
// car catalogue is untouched and future entries are covered too.
const NO_LISHI_ROUTE = {
    HGV: "No Lishi tool for this make — read the keyway off the existing key before quoting. Older mechanical cab locks are often generic-wafer pickable or overridable; coded keys go via maker/dealer.",
    Agri: "No Lishi tool for farm machinery (Lishi's range is automotive only) — read the keyway off the existing key. Older steel machine keys can be cut from code; coded keys go via maker/dealer by machine serial."
};

Object.keys(TRUCKS_AGRI_DB).forEach(function (make) {
    Object.keys(TRUCKS_AGRI_DB[make]).forEach(function (model) {
        Object.keys(TRUCKS_AGRI_DB[make][model]).forEach(function (year) {
            const rec = TRUCKS_AGRI_DB[make][model][year];
            if (!rec || typeof rec !== 'object') return;
            if (!rec.lishi || /^(n\/?a|none|tbc|—|-)$/i.test(String(rec.lishi).trim())) {
                rec.lishi = "No Lishi tool";
            }
            const hasRealTool = rec.lishi.indexOf('Lishi') === -1 &&
                                rec.lishi.indexOf('no Lishi') === -1;
            if (!hasRealTool) {
                const route = NO_LISHI_ROUTE[rec.segment] || NO_LISHI_ROUTE.HGV;
                if (!rec.warning) {
                    rec.warning = route;
                } else if (rec.warning.indexOf('read the keyway') === -1 &&
                           rec.warning.indexOf('automotive only') === -1) {
                    rec.warning = rec.warning + ' ' + route;
                }
            }

            // Attach the researched lock profile for this make. Entries
            // that did not carry a per-model override get the make-level
            // research; per-model fields already on the record win.
            const prof = LOCK_PROFILE[make];
            if (prof) {
                if (!rec.lockType) rec.lockType = prof.lockType;
                if (!rec.lockCode) rec.lockCode = prof.lockCode;
                if (!rec.blank) rec.blank = prof.blank;
                if (!rec.pickable) rec.pickable = prof.pickable;
                if (!rec.conf) rec.conf = prof.conf;
            }
        });
    });
});

// Deep-merge into the master catalogue so search, reverse-lookup,
// dropdowns and gating pick these up with no other change. Deep merge
// keeps existing models on shared makes (Mercedes-Benz, Iveco, Isuzu).
function __svaDeepMerge(target, source) {
    Object.keys(source).forEach(function (k) {
        const sv = source[k];
        if (sv && typeof sv === 'object' && !Array.isArray(sv) &&
            target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
            __svaDeepMerge(target[k], sv);
        } else {
            target[k] = sv;
        }
    });
}
Object.keys(TRUCKS_AGRI_DB).forEach(function (make) {
    if (typeof carDatabase !== 'undefined') {
        if (carDatabase[make]) __svaDeepMerge(carDatabase[make], TRUCKS_AGRI_DB[make]);
        else carDatabase[make] = TRUCKS_AGRI_DB[make];
    }
});