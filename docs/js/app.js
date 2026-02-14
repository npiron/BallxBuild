/**
 * BALL x PIT — Build Suggester (Static / GitHub Pages version)
 * All logic runs client-side — data loaded from static JSON files.
 */

// ═══ STATE ═══
const state = {
    characters: [],
    balls: [],
    passives: [],
    biomes: [],
    evolutions: [],
    builds: [],
    selectedCharacters: [],
    selectedBiome: null,
    selectedBalls: [],
    selectedPassives: [],
    selectedStyle: null,
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ═══ INIT ═══
document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    renderAll();
    bindEvents();
});

async function loadData() {
    const [characters, balls, passives, biomes, evolutions, builds] = await Promise.all([
        fetch("data/characters.json").then((r) => r.json()),
        fetch("data/balls.json").then((r) => r.json()),
        fetch("data/passives.json").then((r) => r.json()),
        fetch("data/biomes.json").then((r) => r.json()),
        fetch("data/evolutions.json").then((r) => r.json()),
        fetch("data/builds.json").then((r) => r.json()),
    ]);
    state.characters = characters;
    state.balls = balls;
    state.passives = passives;
    state.biomes = biomes;
    state.evolutions = evolutions;
    state.builds = builds;
}

// ═══ IMAGE HELPERS ═══

function getImagePath(entityType, name) {
    const safeName = name.toLowerCase().replace(/ /g, "_").replace(/'/g, "").replace(/[()]/g, "");
    const prefix = entityType === "biomes" && !safeName.startsWith("the_") ? "the_" : "";
    return `img/${entityType}/${prefix}${safeName}.png`;
}

function imgTag(src, alt, fallbackEmoji = "🎱") {
    if (src) {
        return `<img src="${src}" alt="${alt}" loading="lazy" onerror="this.outerHTML='<span class=\\'img-placeholder\\'>${fallbackEmoji}</span>'">`;
    }
    return `<span class="img-placeholder">${fallbackEmoji}</span>`;
}

// ═══ RENDER ═══

function renderAll() {
    renderCharacters();
    renderBiomes();
    renderBalls();
    renderPassives();
}

function renderCharacters() {
    const grid = $("#character-grid");
    grid.innerHTML = state.characters
        .map(
            (c) => `
        <div class="entity-item ${state.selectedCharacters.includes(c.name) ? "selected" : ""}"
             data-name="${c.name}" data-type="character"
             data-tooltip="${c.name}|${c.ability || "Aucune capacité"}|Balle: ${c.starting_ball} · Tier ${c.tier}">
            ${imgTag(c.image, c.name, "🎮")}
            <span class="entity-name">${c.name.replace("The ", "")}</span>
            <span class="tier-badge tier-${c.tier.toLowerCase().replace('+', '-plus')}">${c.tier}</span>
            ${state.selectedCharacters.indexOf(c.name) >= 0 ? `<span class="char-slot-badge">${state.selectedCharacters.indexOf(c.name) + 1}</span>` : ""}
        </div>`
        )
        .join("");
}

function renderBiomes() {
    const grid = $("#biome-grid");
    grid.innerHTML = state.biomes
        .map(
            (b) => `
        <div class="entity-item ${state.selectedBiome === b.name ? "selected" : ""}"
             data-name="${b.name}" data-type="biome"
             data-tooltip="${b.name}|Boss: ${b.boss_name}|${b.unlock_requirement || ""}">
            ${imgTag(b.image, b.name, "🌍")}
            <span class="entity-name">${b.name}</span>
        </div>`
        )
        .join("");
}

function renderBalls() {
    const grid = $("#ball-grid");
    const baseBalls = state.balls.filter((b) => b.is_base_ball);
    const evoBalls = state.balls.filter((b) => b.is_evolution);

    const renderBall = (b) => {
        const rarClass = b.rarity ? `rarity-${b.rarity.toLowerCase()}` : "";
        const selected = state.selectedBalls.includes(b.name);
        return `
        <div class="entity-item ${selected ? "selected" : ""} ${rarClass}"
             data-name="${b.name}" data-type="ball"
             data-tooltip="${b.name}|${b.effect || ""}|${b.rarity} · ${b.base_damage} dmg · ${b.speed}">
            ${imgTag(b.image, b.name, "⚪")}
            <span class="entity-name">${b.name}</span>
        </div>`;
    };

    grid.innerHTML =
        `<div style="width:100%;font-size:0.6rem;color:var(--text-muted);margin:4px 0;font-weight:600;">BALLES DE BASE</div>` +
        baseBalls.map(renderBall).join("") +
        `<div style="width:100%;font-size:0.6rem;color:var(--text-muted);margin:8px 0 4px;font-weight:600;">ÉVOLUTIONS</div>` +
        evoBalls.map(renderBall).join("");
}

function renderPassives() {
    const grid = $("#passive-grid");
    const baseP = state.passives.filter((p) => !p.is_evolution);
    const evoP = state.passives.filter((p) => p.is_evolution);

    const renderP = (p) => {
        const selected = state.selectedPassives.includes(p.name);
        return `
        <div class="entity-item ${selected ? "selected" : ""}"
             data-name="${p.name}" data-type="passive"
             data-tooltip="${p.name}|${p.effect}|${p.is_evolution ? "Évolution" : "Standard"}">
            ${imgTag(p.image, p.name, "🛡️")}
            <span class="entity-name">${p.name}</span>
        </div>`;
    };

    grid.innerHTML =
        `<div style="width:100%;font-size:0.6rem;color:var(--text-muted);margin:4px 0;font-weight:600;">PASSIFS STANDARDS</div>` +
        baseP.map(renderP).join("") +
        `<div style="width:100%;font-size:0.6rem;color:var(--text-muted);margin:8px 0 4px;font-weight:600;">ÉVOLUTIONS</div>` +
        evoP.map(renderP).join("");
}

function updateSelectedBalls() {
    const container = $("#selected-balls");
    if (state.selectedBalls.length === 0) {
        container.innerHTML = '<span class="placeholder">Aucune balle sélectionnée — clique ici pour déplier</span>';
    } else {
        container.innerHTML = state.selectedBalls
            .map((name) => {
                const b = state.balls.find((x) => x.name === name);
                return `<span class="selected-tag">
                    ${b && b.image ? `<img src="${b.image}" alt="${name}">` : ""}
                    ${name}
                    <span class="remove" data-name="${name}" data-type="ball">✕</span>
                </span>`;
            })
            .join("");
    }
}

function updateSelectedPassives() {
    const container = $("#selected-passives");
    if (state.selectedPassives.length === 0) {
        container.innerHTML = '<span class="placeholder">Aucun passif sélectionné — clique ici pour déplier</span>';
    } else {
        container.innerHTML = state.selectedPassives
            .map((name) => {
                const p = state.passives.find((x) => x.name === name);
                return `<span class="selected-tag">
                    ${p && p.image ? `<img src="${p.image}" alt="${name}">` : ""}
                    ${name}
                    <span class="remove" data-name="${name}" data-type="passive">✕</span>
                </span>`;
            })
            .join("");
    }
}

// ═══ EVENTS ═══

function bindEvents() {
    // Character (max 2)
    $("#character-grid").addEventListener("click", (e) => {
        const item = e.target.closest(".entity-item");
        if (!item) return;
        const name = item.dataset.name;
        const idx = state.selectedCharacters.indexOf(name);
        if (idx >= 0) {
            // Deselect
            state.selectedCharacters.splice(idx, 1);
        } else if (state.selectedCharacters.length < 2) {
            // Select (max 2)
            state.selectedCharacters.push(name);
            const char = state.characters.find((c) => c.name === name);
            if (char && !state.selectedBalls.includes(char.starting_ball)) {
                state.selectedBalls.push(char.starting_ball);
                renderBalls();
                updateSelectedBalls();
            }
        } else {
            // Already 2 selected → replace the oldest
            state.selectedCharacters.shift();
            state.selectedCharacters.push(name);
            const char = state.characters.find((c) => c.name === name);
            if (char && !state.selectedBalls.includes(char.starting_ball)) {
                state.selectedBalls.push(char.starting_ball);
                renderBalls();
                updateSelectedBalls();
            }
        }
        renderCharacters();
    });

    // Biome
    $("#biome-grid").addEventListener("click", (e) => {
        const item = e.target.closest(".entity-item");
        if (!item) return;
        const name = item.dataset.name;
        state.selectedBiome = state.selectedBiome === name ? null : name;
        renderBiomes();
    });

    // Balls
    $("#selected-balls").addEventListener("click", (e) => {
        const remove = e.target.closest(".remove");
        if (remove) {
            state.selectedBalls = state.selectedBalls.filter((b) => b !== remove.dataset.name);
            updateSelectedBalls();
            renderBalls();
            return;
        }
        $("#ball-grid").classList.toggle("expanded");
    });

    $("#ball-grid").addEventListener("click", (e) => {
        const item = e.target.closest(".entity-item");
        if (!item) return;
        const name = item.dataset.name;
        if (state.selectedBalls.includes(name)) {
            state.selectedBalls = state.selectedBalls.filter((b) => b !== name);
        } else {
            state.selectedBalls.push(name);
        }
        renderBalls();
        updateSelectedBalls();
    });

    // Passives
    $("#selected-passives").addEventListener("click", (e) => {
        const remove = e.target.closest(".remove");
        if (remove) {
            state.selectedPassives = state.selectedPassives.filter((p) => p !== remove.dataset.name);
            updateSelectedPassives();
            renderPassives();
            return;
        }
        $("#passive-grid").classList.toggle("expanded");
    });

    $("#passive-grid").addEventListener("click", (e) => {
        const item = e.target.closest(".entity-item");
        if (!item) return;
        const name = item.dataset.name;
        if (state.selectedPassives.includes(name)) {
            state.selectedPassives = state.selectedPassives.filter((p) => p !== name);
        } else {
            state.selectedPassives.push(name);
        }
        renderPassives();
        updateSelectedPassives();
    });

    // Style
    $("#style-buttons").addEventListener("click", (e) => {
        const btn = e.target.closest(".style-btn");
        if (!btn) return;
        const style = btn.dataset.style;
        if (state.selectedStyle === style) {
            state.selectedStyle = null;
            btn.classList.remove("selected");
        } else {
            $$(".style-btn").forEach((b) => b.classList.remove("selected"));
            state.selectedStyle = style;
            btn.classList.add("selected");
        }
    });

    // Suggest
    $("#btn-suggest").addEventListener("click", suggest);

    // Reset
    $("#btn-reset").addEventListener("click", () => {
        state.selectedCharacters = [];
        state.selectedBiome = null;
        state.selectedBalls = [];
        state.selectedPassives = [];
        state.selectedStyle = null;
        $$(".style-btn").forEach((b) => b.classList.remove("selected"));
        renderAll();
        updateSelectedBalls();
        updateSelectedPassives();
        $("#results").classList.add("hidden");
    });

    setupTooltip();
}

// ═══ SUGGESTION ENGINE v2 (client-side) ═══
// Improved engine using status_effect synergies, character affinity,
// evolution chains, alternative recipes, biome awareness, passive combos,
// and smart "next pickup" recommendations.

// ─── Lookup helpers (built once after loadData) ───
let ballsByName = {};
let passivesByName = {};
let evosByResult = {};
let evosByIngredient = {};

function buildIndexes() {
    ballsByName = {};
    for (const b of state.balls) ballsByName[b.name] = b;
    passivesByName = {};
    for (const p of state.passives) passivesByName[p.name] = p;
    evosByResult = {};
    evosByIngredient = {};
    for (const e of state.evolutions) {
        evosByResult[e.result_ball] = e;
        const keys = ["ingredient_1", "ingredient_2", "ingredient_3", "ingredient_1_alt", "ingredient_2_alt"];
        for (const key of keys) {
            const ing = e[key];
            if (ing && typeof ing === "string") {
                if (!Object.prototype.hasOwnProperty.call(evosByIngredient, ing)) {
                    evosByIngredient[ing] = [];
                }
                evosByIngredient[ing].push(e);
            }
        }
    }
}

// ─── Status effect extraction ───
function getStatusEffects(ballName) {
    const ball = ballsByName[ballName];
    if (!ball || !ball.status_effect) return [];
    return ball.status_effect.split(",").map((s) => s.trim()).filter(Boolean);
}

// ─── Evolution chain: trace full ingredient tree recursively ───
function getEvolutionChain(targetBall, currentBalls, depth = 0) {
    if (depth > 5) return null; // prevent infinite loops
    if (currentBalls.includes(targetBall)) {
        return { ball: targetBall, status: "owned", image: getImagePath("balls", targetBall) };
    }
    const recipe = evosByResult[targetBall];
    if (!recipe) {
        return { ball: targetBall, status: "pickup", image: getImagePath("balls", targetBall) };
    }

    const ingredients = [recipe.ingredient_1, recipe.ingredient_2];
    if (recipe.ingredient_3) ingredients.push(recipe.ingredient_3);

    const altIngredients = {};
    if (recipe.ingredient_1_alt) altIngredients[recipe.ingredient_1] = recipe.ingredient_1_alt;
    if (recipe.ingredient_2_alt) altIngredients[recipe.ingredient_2] = recipe.ingredient_2_alt;

    const children = ingredients.map((ing) => {
        // Check if alt ingredient is owned instead
        const alt = altIngredients[ing];
        if (currentBalls.includes(ing)) {
            return { ball: ing, status: "owned", image: getImagePath("balls", ing) };
        }
        if (alt && currentBalls.includes(alt)) {
            return { ball: alt, status: "owned", image: getImagePath("balls", alt), replaces: ing };
        }
        // Check if this ingredient is itself an evolution we can trace
        const subChain = getEvolutionChain(ing, currentBalls, depth + 1);
        if (subChain) return subChain;
        return { ball: ing, status: "pickup", image: getImagePath("balls", ing), alt: alt || null };
    });

    const allOwned = children.every((c) => c.status === "owned");
    const someOwned = children.some((c) => c.status === "owned");
    const status = allOwned ? "ready" : someOwned ? "partial" : "missing";

    return {
        ball: targetBall,
        status,
        image: getImagePath("balls", targetBall),
        children,
        tier: recipe.tier,
        tips: recipe.tips || recipe.wiki_description || null,
    };
}

// ─── Biome synergy map ───
const BIOME_SYNERGIES = {
    "BONExYARD":          { strong: ["Burn", "Light", "Bleed"], weak: ["Dark"], desc: "Les ennemis squelettes sont faibles au feu et à la lumière" },
    "SNOWYxSHORES":       { strong: ["Burn", "Earthquake", "Wind"], weak: ["Freeze"], desc: "Les ennemis de glace résistent au gel mais fondent au feu" },
    "LIMINALxDESERT":     { strong: ["Freeze", "Poison", "Wind"], weak: ["Burn"], desc: "Le désert résiste au feu, le gel et le vent sont efficaces" },
    "FUNGALxFOREST":      { strong: ["Burn", "Freeze", "Lightning"], weak: ["Poison"], desc: "Les champignons résistent au poison mais brûlent bien" },
    "GORYxGRASSLANDS":    { strong: ["Burn", "Poison", "Dark"], weak: [], desc: "Terrain ouvert — les AoE et DoT excellent" },
    "SMOLDERINGxDEPTHS":  { strong: ["Freeze", "Iron", "Ghost"], weak: ["Burn"], desc: "Les créatures de feu résistent au burn, le gel les stoppe" },
    "HEAVENLYxGATES":     { strong: ["Dark", "Poison", "Bleed"], weak: ["Light"], desc: "Les ennemis divins résistent à la lumière, le dark excelle" },
    "VASTxVOID":          { strong: ["Light", "Lightning", "Iron"], weak: [], desc: "Zone finale — les dégâts bruts et la lumière percent le vide" },
};

// ─── Style mapping extended with DPS/Burst/Survival/Speedrun ───
const STYLE_MAP = {
    aoe: ["AOE Status", "DPS", "Burst"], status: ["AOE Status"],
    sustain: ["Sustain", "Survival"], tank: ["Sustain", "Survival"],
    control: ["Control"], freeze: ["Control"],
    boss: ["Boss Killer", "DPS", "Burst"], dps: ["DPS", "Boss Killer", "Burst"],
    minion: ["Minion Swarm"], swarm: ["Minion Swarm"],
    hybrid: ["Hybrid"], laser: ["Hybrid"],
    burst: ["Burst", "DPS"], speedrun: ["Speedrun", "DPS", "Burst"],
    survival: ["Survival", "Sustain"],
};

// ─── CHARACTER MECHANICS — Dynamic scoring based on wiki_ability ───
const CHARACTER_MECHANICS = {
    "The Itchy Finger": {
        desc: "Tire 2x plus vite, aim dispersé, bouge à pleine vitesse",
        ballPrefs: { speed: ["Fast", "Very Fast"], effect: ["Burn", "Poison", "Bleed"] },
        bonus: 20, reason: "Cadence 2x → les DoT stack rapiement",
        antiSynergy: { speed: ["Slow", "Very Slow"] }, antiReason: "Balles lentes sous-optimales avec tir rapide",
    },
    "The Physicist": {
        desc: "Gravité attire les balles vers le fond",
        ballPrefs: { effect: ["Burn", "Poison", "Earthquake"], category: ["Elemental"] },
        bonus: 15, reason: "La gravité concentre les AoE au fond",
        antiSynergy: {}, antiReason: "",
    },
    "The Shieldbearer": {
        desc: "Bouclier qui renvoie les balles",
        ballPrefs: { speed: ["Slow"], effect: ["Iron"] },
        bonus: 18, reason: "Les balles rebondissent sur le bouclier pour +dmg",
        antiSynergy: {}, antiReason: "",
    },
    "The Cohabitants": {
        desc: "Chaque tir est dupliqué en miroir, dégâts divisés par 2",
        ballPrefs: { effect: ["Burn", "Poison", "Bleed", "Charm", "Freeze"] },
        bonus: 18, reason: "Tir miroir double l'application des effets de statut",
        antiSynergy: {}, antiReason: "",
    },
    "The Empty Nester": {
        desc: "Pas de baby balls — tire plusieurs instances d'une balle spéciale",
        ballPrefs: { speed: ["Fast", "Very Fast"] },
        bonus: 20, reason: "Multi-instances = stack massif d'effets",
        antiSynergy: { effect: ["Baby Ball Spawn"] }, antiReason: "Pas de baby balls → synergies baby inutiles",
    },
    "The Flagellant": {
        desc: "Balles rebondissent normalement en bas",
        ballPrefs: {},
        bonus: 8, reason: "Rebonds supplémentaires",
        antiSynergy: {}, antiReason: "",
    },
    "The Spendthrift": {
        desc: "Tire toutes les balles en même temps en arc",
        ballPrefs: { effect: ["Burn", "Poison", "Bleed", "Freeze"] },
        bonus: 18, reason: "Salve = couverture AoE massive, bon avec DoT",
        antiSynergy: {}, antiReason: "",
    },
    "The Juggler": {
        desc: "Lobe les balles en l'air vers une position cible",
        ballPrefs: { effect: ["Earthquake", "Burn"], speed: ["Slow"] },
        bonus: 15, reason: "Ciblage précis → burst sur une zone",
        antiSynergy: {}, antiReason: "",
    },
    "The Makeshift Sisyphus": {
        desc: "Pas de dmg direct, mais AoE et status ×4. Pas de baby balls",
        ballPrefs: { effect: ["Burn", "Poison", "Bleed", "Freeze", "Earthquake"] },
        bonus: 25, reason: "×4 dégâts de statut → tous les DoT dominent",
        antiSynergy: { effect: ["Baby Ball Spawn", "N/A"], category: ["Basic"] }, antiReason: "Pas de dmg direct → balles sans effet de statut inutiles",
    },
    "The Shade": {
        desc: "Balles tirées depuis l'arrière, 10% crit de base",
        ballPrefs: { speed: ["Fast", "Very Fast"] },
        bonus: 15, reason: "Crit 10% de base → DPS brut élevé",
        antiSynergy: {}, antiReason: "",
    },
    "The Embedded": {
        desc: "Balles percent les ennemis jusqu'au mur",
        ballPrefs: { effect: ["Burn", "Poison", "Bleed"] },
        bonus: 20, reason: "Pierce = chaque balle touche TOUS les ennemis sur son passage",
        antiSynergy: {}, antiReason: "",
    },
    "The Repentant": {
        desc: "+5% dmg par rebond, retour au joueur au mur arrière",
        ballPrefs: { speed: ["Slow", "Medium"] },
        bonus: 20, reason: "+5%/rebond → les balles lentes multi-rebonds explosent",
        antiSynergy: { speed: ["Very Fast"] }, antiReason: "Balles trop rapides = moins de rebonds",
    },
    "The Tactician": {
        desc: "Combat au tour par tour",
        ballPrefs: { effect: ["Freeze", "Charm"] },
        bonus: 12, reason: "Tour par tour → le contrôle est roi",
        antiSynergy: {}, antiReason: "",
    },
};

// ─── PASSIVE↔BALL SYNERGY MAP ───
const PASSIVE_BALL_SYNERGIES = [
    // Baby ball synergies
    { passives: ["Baby Rattle", "War Horn", "Iron Onesie", "Cornucopia"], balls: ["Brood Mother", "Egg Sac", "Catapult", "Shotgun", "Maggot", "Voluptuous Egg Sac", "Spider Queen"],
      effects: ["Baby Ball Spawn"], reason: "Synergie Baby Balls : plus de baby balls = plus de dégâts", tier: "S" },
    // Crit synergies
    { passives: ["Diamond Hilted Dagger", "Sapphire Hilted Dagger", "Ruby Hilted Dagger", "Emerald Hilted Dagger", "Deadeye's Amulet", "Deadeye's Cross", "Gracious Impaler", "Deadeye's Impaler"],
      balls: [], effects: [], reason: "Synergie Critique : stack les daggers pour Deadeye's Cross", tier: "A", anyBall: true },
    // Poison synergy
    { passives: ["Cursed Elixir"], balls: ["Poison", "Noxious", "Brimstone", "Swamp", "Virus"],
      effects: ["Poison"], reason: "Cursed Elixir : ennemis empoisonnés deviennent des zombies", tier: "A" },
    // Burn synergy
    { passives: ["Midnight Oil"], balls: ["Burn", "Inferno", "Magma", "Sun", "Brimstone", "Fireworks", "Frozen Flame"],
      effects: ["Burn"], reason: "Midnight Oil : bonus +10-20 dmg feu sur ennemis en feu", tier: "A" },
    // Ghost/Phase synergy
    { passives: ["Ethereal Cloak", "Ghostly Corset", "Phantom Regalia"], balls: ["Ghost", "Phantom", "Wraith", "Assassin"],
      effects: [], reason: "Synergie Phase : les balles traversent les ennemis avec bonus dmg", tier: "A" },
    // Vampire/Lifesteal synergy
    { passives: ["Vampiric Sword", "Soul Reaver", "Everflowing Goblet", "Bandage Roll"], balls: ["Vampire", "Vampire Lord", "Leech", "Nosferatu", "Mosquito King", "Mosquito Swarm", "Soul Sucker"],
      effects: ["Heal", "Lifesteal", "Leech"], reason: "Synergie Vampire : heal + vol de vie = immortalité", tier: "S" },
    // Charm synergy
    { passives: ["Kiss of Death", "Lover's Quiver"], balls: ["Charm", "Incubus", "Succubus", "Satan", "Berserk", "Lovestruck"],
      effects: ["Charm"], reason: "Synergies Charme : chance d'insta-kill les charmés", tier: "A" },
    // Freeze synergy
    { passives: ["Frozen Spike"], balls: ["Freeze", "Blizzard", "Freeze Ray", "Frozen Flame", "Glacier", "Wraith"],
      effects: ["Freeze", "Frostburn"], reason: "Frozen Spike : ennemis gelés émettent du froid → contrôle en chaîne", tier: "S" },
    // AoE synergy
    { passives: ["Magic Staff", "Pressure Valve"], balls: ["Earthquake", "Bomb", "Nuclear Bomb", "Magma", "Landslide", "Lightning"],
      effects: ["Earthquake"], reason: "Magic Staff : +20% dmg AoE sur earthquake/laser/lightning", tier: "A" },
    // Bounce synergy
    { passives: ["Rubber Headband", "Wagon Wheel", "Hourglass", "Upturned Hatchet"], balls: [],
      effects: [], reason: "Synergies Rebond : bonus de dégâts par rebond", tier: "B", anyBall: true },
    // Stone ally synergy
    { passives: ["Archer's Effigy", "Stone Effigy", "Healer's Effigy", "Artificial Heart", "Traitor's Cowl", "Golden Bull"], balls: [],
      effects: [], reason: "Synergie Alliés : allies en pierre + buffs de santé", tier: "B", anyBall: true },
    // Shield/Defense synergy
    { passives: ["Breastplate", "Protective Charm", "Eye of the Beholder", "Odiferous Shell"], balls: ["Iron", "Steel"],
      effects: [], reason: "Synergie Défense : survie et réduction de dégâts", tier: "B" },
];

// ─── PATHFINDING: find optimal routes to high-tier evolutions ───
function findEvolutionPaths(currentBalls) {
    const paths = [];
    const highTierEvos = state.evolutions.filter((e) => e.tier === "S+" || e.tier === "S");

    for (const evo of highTierEvos) {
        const path = traceEvolutionPath(evo.result_ball, currentBalls, new Set(), 0);
        if (path) {
            paths.push(path);
        }
    }

    // Sort by: fewer missing balls = more feasible
    paths.sort((a, b) => a.missing.length - b.missing.length || a.depth - b.depth);
    return paths;
}

function traceEvolutionPath(target, currentBalls, visited, depth) {
    if (depth > 6) return null;
    if (visited.has(target)) return null;
    visited.add(target);

    if (currentBalls.includes(target)) {
        return { ball: target, tier: null, status: "owned", missing: [], steps: [], depth: 0 };
    }

    const recipe = evosByResult[target];
    if (!recipe) {
        // Base ball, not owned → need to pick it up
        return { ball: target, tier: null, status: "pickup", missing: [target], steps: [], depth: 0 };
    }

    const ingredients = [recipe.ingredient_1, recipe.ingredient_2];
    if (recipe.ingredient_3) ingredients.push(recipe.ingredient_3);

    // Check alt ingredients too
    const altMap = {};
    if (recipe.ingredient_1_alt) altMap[recipe.ingredient_1] = recipe.ingredient_1_alt;
    if (recipe.ingredient_2_alt) altMap[recipe.ingredient_2] = recipe.ingredient_2_alt;

    let totalMissing = [];
    const steps = [];

    for (const ing of ingredients) {
        const alt = altMap[ing];
        // Use alt if we own it and don't own the primary
        const useAlt = alt && !currentBalls.includes(ing) && currentBalls.includes(alt);
        const actualIng = useAlt ? alt : ing;

        const sub = traceEvolutionPath(actualIng, currentBalls, new Set(visited), depth + 1);
        if (!sub) return null; // broken path
        totalMissing.push(...sub.missing);
        if (sub.status !== "owned") {
            steps.push(sub);
        }
    }

    // Deduplicate missing
    totalMissing = [...new Set(totalMissing)];

    return {
        ball: target,
        tier: recipe.tier,
        status: totalMissing.length === 0 ? "ready" : "reachable",
        missing: totalMissing,
        steps,
        depth: depth + 1,
        tips: recipe.tips || null,
        difficulty: recipe.difficulty || null,
        ingredients,
        altMap,
    };
}

// ─── PASSIVE↔BALL synergy analyzer ───
function analyzePassiveBallSynergies(currentBalls, currentPassives) {
    const activeSynergies = [];

    for (const syn of PASSIVE_BALL_SYNERGIES) {
        const ownedPassives = syn.passives.filter((p) => currentPassives.includes(p));
        if (ownedPassives.length === 0) continue;

        let matchedBalls = [];
        if (syn.anyBall) {
            matchedBalls = currentBalls.slice(0, 3); // generic synergy
        } else {
            // Match by ball name
            matchedBalls = currentBalls.filter((b) => syn.balls.includes(b));
            // Match by status effect
            if (syn.effects.length > 0) {
                for (const b of currentBalls) {
                    if (matchedBalls.includes(b)) continue;
                    const effs = getStatusEffects(b);
                    if (effs.some((e) => syn.effects.includes(e))) matchedBalls.push(b);
                }
            }
        }

        const power = ownedPassives.length * (matchedBalls.length > 0 ? 2 : 0.5);
        const suggestedBalls = syn.balls.filter((b) => !currentBalls.includes(b)).slice(0, 3);
        const suggestedPassives = syn.passives.filter((p) => !currentPassives.includes(p)).slice(0, 2);

        activeSynergies.push({
            reason: syn.reason,
            tier: syn.tier,
            ownedPassives,
            matchedBalls,
            suggestedBalls,
            suggestedPassives,
            power,
            active: matchedBalls.length > 0,
        });
    }

    activeSynergies.sort((a, b) => b.power - a.power);
    return activeSynergies.filter((s) => s.power > 0);
}

// ─── CHARACTER DYNAMIC SCORING ───
function getCharacterBallBonus(charName, ballName) {
    const mech = CHARACTER_MECHANICS[charName];
    if (!mech) return { bonus: 0, reason: null, anti: false, antiReason: null };

    const ball = ballsByName[ballName];
    if (!ball) return { bonus: 0, reason: null, anti: false, antiReason: null };

    let bonus = 0;
    let reason = null;
    let anti = false;
    let antiReason = null;

    const prefs = mech.ballPrefs;
    // Speed match
    if (prefs.speed && prefs.speed.includes(ball.speed)) {
        bonus += mech.bonus;
        reason = mech.reason;
    }
    // Effect match
    if (prefs.effect) {
        const ballEffects = getStatusEffects(ballName);
        if (prefs.effect.some((e) => ballEffects.includes(e) || ball.name === e)) {
            bonus += Math.round(mech.bonus * 0.8);
            reason = reason || mech.reason;
        }
    }
    // Category match
    if (prefs.category && prefs.category.includes(ball.category)) {
        bonus += Math.round(mech.bonus * 0.5);
        reason = reason || mech.reason;
    }

    // Anti-synergy
    const antiPrefs = mech.antiSynergy || {};
    if (antiPrefs.speed && antiPrefs.speed.includes(ball.speed)) {
        anti = true;
        antiReason = mech.antiReason;
    }
    if (antiPrefs.effect) {
        const ballEffects = getStatusEffects(ballName);
        if (antiPrefs.effect.some((e) => ballEffects.includes(e))) {
            anti = true;
            antiReason = mech.antiReason;
        }
    }

    return { bonus, reason, anti, antiReason };
}

// ─── EVOLUTION GRAPH DATA — for interactive visualization ───
function buildEvolutionGraph(currentBalls) {
    const nodes = [];
    const edges = [];
    const nodeSet = new Set();

    // Add all current balls as nodes
    for (const b of currentBalls) {
        if (!nodeSet.has(b)) {
            nodeSet.add(b);
            const ball = ballsByName[b];
            nodes.push({
                id: b, label: b, status: "owned",
                image: ball ? ball.image : getImagePath("balls", b),
                isEvo: ball ? !!ball.is_evolution : false,
                tier: null,
            });
        }
    }

    // Find all evolutions reachable (with limited depth)
    const processedEvos = new Set();
    function addEvoNodes(ballName, depth) {
        if (depth > 3) return;
        const evos = evosByIngredient[ballName] || [];
        for (const evo of evos) {
            if (processedEvos.has(evo.result_ball)) continue;
            processedEvos.add(evo.result_ball);

            const ings = [evo.ingredient_1, evo.ingredient_2];
            if (evo.ingredient_3) ings.push(evo.ingredient_3);

            const ownedIngs = ings.filter((i) => currentBalls.includes(i));
            const missingIngs = ings.filter((i) => !currentBalls.includes(i));

            let status = "unreachable";
            if (missingIngs.length === 0) status = "ready";
            else if (missingIngs.length === 1) status = "one-away";
            else if (ownedIngs.length > 0) status = "partial";

            // Add result node
            if (!nodeSet.has(evo.result_ball)) {
                nodeSet.add(evo.result_ball);
                const resultBall = ballsByName[evo.result_ball];
                nodes.push({
                    id: evo.result_ball, label: evo.result_ball, status,
                    image: evo.result_image || (resultBall ? resultBall.image : getImagePath("balls", evo.result_ball)),
                    isEvo: true, tier: evo.tier, missing: missingIngs,
                });
            }

            // Add missing ingredient nodes
            for (const ing of missingIngs) {
                if (!nodeSet.has(ing)) {
                    nodeSet.add(ing);
                    const ingBall = ballsByName[ing];
                    nodes.push({
                        id: ing, label: ing, status: "needed",
                        image: ingBall ? ingBall.image : getImagePath("balls", ing),
                        isEvo: ingBall ? !!ingBall.is_evolution : false, tier: null,
                    });
                }
            }

            // Add edges
            for (const ing of ings) {
                edges.push({ from: ing, to: evo.result_ball, owned: currentBalls.includes(ing) });
            }

            // Recurse for chain evolutions
            addEvoNodes(evo.result_ball, depth + 1);
        }
    }

    for (const b of currentBalls) addEvoNodes(b, 0);

    return { nodes, edges };
}

function suggest() {
    const btn = $("#btn-suggest");
    btn.classList.add("loading");
    btn.innerHTML = '<span class="spinner"></span> Analyse en cours...';

    setTimeout(() => {
        buildIndexes();
        const result = computeSuggestions();
        renderResults(result);
        btn.classList.remove("loading");
        btn.innerHTML = '<span class="btn-icon">🔮</span> Analyser & Suggérer';
    }, 100);
}

function computeSuggestions() {
    let currentBalls = [...state.selectedBalls];
    const currentPassives = [...state.selectedPassives];
    const characters = [...state.selectedCharacters];
    const biome = state.selectedBiome;
    const preferStyle = state.selectedStyle;

    // ─── Step 1: Character info + enrichment (supports 2 characters) ───
    const charInfos = [];
    for (const charName of characters) {
        const ci = state.characters.find((c) => c.name === charName);
        if (ci) {
            charInfos.push(ci);
            if (!currentBalls.includes(ci.starting_ball)) {
                currentBalls = [ci.starting_ball, ...currentBalls];
            }
        }
    }
    const charInfo = charInfos[0] || null; // primary for backward compat

    // ─── Step 2: Possible evolutions (with alt ingredients) ───
    let possibleEvolutions = [];
    const seen = new Set();
    for (const ball of currentBalls) {
        const evos = (evosByIngredient[ball] || []);
        for (const evo of evos) {
            if (seen.has(evo.result_ball)) continue;
            seen.add(evo.result_ball);

            if (evo.ingredient_3) {
                // Triple evolution (e.g., Nosferatu)
                const have1 = currentBalls.includes(evo.ingredient_1);
                const have2 = currentBalls.includes(evo.ingredient_2);
                const have3 = currentBalls.includes(evo.ingredient_3);
                const needed = [];
                if (!have1) needed.push(evo.ingredient_1);
                if (!have2) needed.push(evo.ingredient_2);
                if (!have3) needed.push(evo.ingredient_3);
                possibleEvolutions.push({
                    ...evo,
                    from_ball: ball,
                    needs_ball: needed.join(" + "),
                    have_both: have1 && have2 && have3,
                    match_count: (have1 ? 1 : 0) + (have2 ? 1 : 0) + (have3 ? 1 : 0),
                    total_ingredients: 3,
                });
            } else {
                const matchesIng1 = (evo.ingredient_1 === ball || evo.ingredient_1_alt === ball);
                const otherIng = matchesIng1 ? evo.ingredient_2 : evo.ingredient_1;
                const otherIngAlt = matchesIng1 ? evo.ingredient_2_alt : evo.ingredient_1_alt;
                const haveOther = currentBalls.includes(otherIng) || (otherIngAlt && currentBalls.includes(otherIngAlt));
                possibleEvolutions.push({
                    ...evo,
                    from_ball: ball,
                    needs_ball: otherIngAlt ? `${otherIng} ou ${otherIngAlt}` : otherIng,
                    have_both: haveOther,
                    match_count: 1 + (haveOther ? 1 : 0),
                    total_ingredients: 2,
                });
            }
        }
    }

    const tierOrder = { "S+": 0, S: 1, A: 2, B: 3, C: 4 };
    possibleEvolutions.sort(
        (a, b) =>
            (a.have_both ? 0 : 1) - (b.have_both ? 0 : 1) ||
            (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9) ||
            b.match_count - a.match_count
    );

    // ─── Step 3: Detect status effect profile ───
    const statusProfile = {};
    for (const ballName of currentBalls) {
        for (const effect of getStatusEffects(ballName)) {
            statusProfile[effect] = (statusProfile[effect] || 0) + 1;
        }
    }
    const dominantEffects = Object.entries(statusProfile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([eff]) => eff);

    // ─── Step 4: Biome analysis ───
    let biomeSynergy = null;
    if (biome && BIOME_SYNERGIES[biome]) {
        biomeSynergy = BIOME_SYNERGIES[biome];
    }

    // ─── Step 5: Score and recommend builds ───
    const scoredBuilds = state.builds.map((build) => {
        const b = { ...build };
        let score = 0;
        const reasons = [];

        // === Tier score ===
        const tierScore = { "S+": 45, S: 35, "A+": 28, A: 22, B: 12 };
        score += tierScore[b.tier] || 0;

        // === Character match (both characters) ===
        for (const ci of charInfos) {
            if ((b.recommended_characters || "").includes(ci.name)) {
                score += 45;
                reasons.push(`Recommandé pour ${ci.name}`);
            }

            // Playstyle affinity
            if (b.archetype) {
                const charStrengths = (ci.strengths || []).join(" ").toLowerCase();
                const charPlaystyle = (ci.playstyle || "").toLowerCase();
                const archLower = b.archetype.toLowerCase();
                if (charStrengths.includes("dps") && (archLower.includes("dps") || archLower.includes("boss"))) {
                    score += 15;
                    reasons.push(`Synergie playstyle DPS (${ci.name.replace("The ", "")})`);
                }
                if (charStrengths.includes("defense") && (archLower.includes("sustain") || archLower.includes("survival"))) {
                    score += 15;
                    reasons.push(`Synergie playstyle défensif (${ci.name.replace("The ", "")})`);
                }
                if (charPlaystyle.includes("speed") && archLower.includes("speed")) {
                    score += 10;
                    reasons.push(`Synergie vitesse (${ci.name.replace("The ", "")})`);
                }
            }

            // best_balls match
            if (ci.best_balls) {
                const buildBallsRaw = b.core_balls.split(",").map((s) => s.trim().toLowerCase());
                for (const bb of ci.best_balls) {
                    const bbLower = bb.toLowerCase();
                    if (buildBallsRaw.some((name) => name.includes(bbLower) || bbLower.includes(name))) {
                        score += 12;
                        reasons.push(`${bb} recommandé pour ${ci.name.replace("The ", "")}`);
                        break;
                    }
                }
            }
        }

        // === Style match (extended) ===
        if (preferStyle) {
            const matchedTypes = STYLE_MAP[preferStyle.toLowerCase()] || [];
            if (matchedTypes.includes(b.archetype)) {
                score += 40;
                reasons.push(`Style ${b.archetype} demandé`);
            } else if (matchedTypes.some((t) => (b.archetype || "").toLowerCase().includes(t.toLowerCase()))) {
                score += 20;
                reasons.push(`Style similaire à ${b.archetype}`);
            }
        }

        // === Ball synergy ===
        const buildBalls = b.core_balls.split(",").map((s) => s.trim());
        let ballOverlap = 0;
        for (const cb of currentBalls) {
            if (buildBalls.includes(cb)) {
                ballOverlap++;
                score += 18;
                reasons.push(`Balle ${cb} dans le build`);
            }
            // Can evolve into a build ball?
            for (const evo of possibleEvolutions) {
                if (evo.from_ball === cb && buildBalls.includes(evo.result_ball)) {
                    score += evo.have_both ? 15 : 8;
                    reasons.push(`${cb} → ${evo.result_ball}${evo.have_both ? " (prêt!)" : ""}`);
                }
            }
        }

        // === Status effect synergy with build ===
        const buildEffects = new Set();
        for (const bbName of buildBalls) {
            for (const eff of getStatusEffects(bbName)) buildEffects.add(eff);
        }
        let effectOverlap = 0;
        for (const eff of dominantEffects) {
            if (buildEffects.has(eff)) {
                effectOverlap++;
                score += 12;
                reasons.push(`Synergie effet ${eff}`);
            }
        }

        // === Passive synergy ===
        const buildPassives = (b.core_passives || "").split(",").map((s) => s.trim());
        for (const cp of currentPassives) {
            if (buildPassives.includes(cp)) {
                score += 12;
                reasons.push(`Passif ${cp} dans le build`);
            }
        }

        // === Biome synergy ===
        if (biomeSynergy) {
            let biomeBonus = 0;
            for (const bbName of buildBalls) {
                const ball = ballsByName[bbName];
                if (!ball) continue;
                const ballEffects = getStatusEffects(bbName);
                const ballBase = ball.name;
                // Check if ball's type is strong in this biome
                for (const strong of biomeSynergy.strong) {
                    if (ballBase === strong || ballEffects.includes(strong)) {
                        biomeBonus += 8;
                        break;
                    }
                }
                // Penalty for weak types
                for (const weak of biomeSynergy.weak) {
                    if (ballBase === weak || ballEffects.includes(weak)) {
                        biomeBonus -= 5;
                        break;
                    }
                }
            }
            if (biomeBonus > 0) {
                score += biomeBonus;
                reasons.push(`Efficace dans ${biome}`);
            } else if (biomeBonus < 0) {
                score += biomeBonus;
                reasons.push(`⚠ Faible dans ${biome}`);
            }
        }

        // === Character dynamic scoring (wiki_ability mechanics, both chars) ===
        for (const ci of charInfos) {
            for (const bbName of buildBalls) {
                const charBonus = getCharacterBallBonus(ci.name, bbName);
                if (charBonus.bonus > 0) {
                    score += charBonus.bonus;
                    if (charBonus.reason) reasons.push(`🎮 ${charBonus.reason} (${ci.name.replace("The ", "")})`);
                }
                if (charBonus.anti) {
                    score -= 10;
                    if (charBonus.antiReason) reasons.push(`⚠️ ${charBonus.antiReason} (${ci.name.replace("The ", "")})`);
                }
            }
        }

        // === Difficulty bonus (easier builds score slightly higher for accessibility) ===
        if (b.difficulty) {
            const diffBonus = { Easy: 5, Medium: 3, Hard: 0, "Very Hard": -3 };
            score += diffBonus[b.difficulty] || 0;
        }

        // === Feasibility bonus: how much of the build is already owned ===
        const feasibilityRatio = currentBalls.length > 0 ? ballOverlap / buildBalls.length : 0;
        if (feasibilityRatio >= 0.5) {
            score += 15;
            reasons.push(`${Math.round(feasibilityRatio * 100)}% du build déjà en place`);
        }

        // === Roadmap with full evolution chains ===
        const roadmap = buildBalls.map((targetBall) => getEvolutionChain(targetBall, currentBalls));

        b.score = score;
        b.reasons = [...new Set(reasons)]; // deduplicate
        b.roadmap = roadmap;
        b.core_balls_list = buildBalls;
        b.core_passives_list = buildPassives;
        b.balls_images = {};
        b.passives_images = {};
        for (const name of buildBalls) b.balls_images[name] = getImagePath("balls", name);
        for (const name of buildPassives) if (name) b.passives_images[name] = getImagePath("passives", name);

        return b;
    });

    scoredBuilds.sort((a, b) => b.score - a.score);

    // ─── Step 6: Passive evolution suggestions ───
    const passiveEvos = [];
    const evoPassives = state.passives.filter((p) => p.is_evolution && p.combination);
    for (const ep of evoPassives) {
        const ingredients = ep.combination.split("+").map((s) => s.trim());
        const owned = ingredients.filter((ing) => currentPassives.includes(ing));
        const missing = ingredients.filter((ing) => !currentPassives.includes(ing));
        passiveEvos.push({
            ...ep,
            ingredients,
            owned_ingredients: owned,
            missing_ingredients: missing,
            ready: missing.length === 0,
            progress: ingredients.length > 0 ? owned.length / ingredients.length : 0,
        });
    }
    passiveEvos.sort((a, b) => b.progress - a.progress || (a.ready ? 0 : 1) - (b.ready ? 0 : 1));

    // ─── Step 7: Smart "next pickup" — what single ball would unlock the most evolutions ───
    const nextPickupScores = {};
    for (const evo of state.evolutions) {
        const ings = [evo.ingredient_1, evo.ingredient_2];
        if (evo.ingredient_3) ings.push(evo.ingredient_3);
        const alts = [];
        if (evo.ingredient_1_alt) alts.push({ orig: evo.ingredient_1, alt: evo.ingredient_1_alt });
        if (evo.ingredient_2_alt) alts.push({ orig: evo.ingredient_2, alt: evo.ingredient_2_alt });

        // For each ingredient: if all OTHERS are owned, this ball unlocks the evolution
        for (const ing of ings) {
            if (currentBalls.includes(ing)) continue;
            const others = ings.filter((i) => i !== ing);
            const allOthersOwned = others.every((o) => currentBalls.includes(o));
            if (allOthersOwned && others.length > 0) {
                const evoTierVal = { "S+": 50, S: 40, A: 25, B: 12 };
                const val = evoTierVal[evo.tier] || 10;
                nextPickupScores[ing] = (nextPickupScores[ing] || 0) + val;
            }
        }
        // Same for alt ingredients
        for (const { orig, alt } of alts) {
            if (currentBalls.includes(alt)) continue;
            const others = ings.filter((i) => i !== orig);
            const allOthersOwned = others.every((o) => currentBalls.includes(o));
            if (allOthersOwned && others.length > 0) {
                const evoTierVal = { "S+": 50, S: 40, A: 25, B: 12 };
                const val = evoTierVal[evo.tier] || 10;
                nextPickupScores[alt] = (nextPickupScores[alt] || 0) + val;
            }
        }
    }
    const nextPickups = Object.entries(nextPickupScores)
        .map(([ball, pickupScore]) => {
            const ballData = ballsByName[ball];
            // Which evolutions does this ball unlock?
            const unlocks = state.evolutions.filter((evo) => {
                const ings = [evo.ingredient_1, evo.ingredient_2];
                if (evo.ingredient_3) ings.push(evo.ingredient_3);
                if (!ings.includes(ball)) {
                    // Check if it's an alt ingredient
                    const isAlt = (evo.ingredient_1_alt === ball || evo.ingredient_2_alt === ball);
                    if (!isAlt) return false;
                }
                return true;
            }).filter((evo) => {
                const ings = [evo.ingredient_1, evo.ingredient_2];
                if (evo.ingredient_3) ings.push(evo.ingredient_3);
                // Replace the ball's slot with "owned" and check if all others are owned
                const relevantIngs = ings.filter((i) => i !== ball);
                return relevantIngs.every((o) => currentBalls.includes(o));
            }).map((evo) => evo.result_ball);

            return {
                ball,
                score: pickupScore,
                image: ballData ? ballData.image : getImagePath("balls", ball),
                rarity: ballData ? ballData.rarity : null,
                effect: ballData ? ballData.effect : null,
                unlocks,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

    // ─── Step 8: Status effect analysis summary ───
    const statusAnalysis = {
        profile: statusProfile,
        dominant: dominantEffects,
        suggestion: null,
    };
    if (dominantEffects.length > 0) {
        // Find what evolutions enhance the dominant effect
        const enhancingEvos = possibleEvolutions.filter((evo) => {
            const resultEffects = getStatusEffects(evo.result_ball);
            return resultEffects.some((e) => dominantEffects.includes(e));
        });
        statusAnalysis.enhancing_evolutions = enhancingEvos.slice(0, 3).map((e) => e.result_ball);
        if (dominantEffects[0] === "Bleed") statusAnalysis.suggestion = "Build Bleed puissant : visez Haemorrhage ou Vampire Lord";
        else if (dominantEffects[0] === "Burn") statusAnalysis.suggestion = "Build Burn solide : Magma et Inferno amplifient massivement";
        else if (dominantEffects[0] === "Freeze") statusAnalysis.suggestion = "Build Control : Blizzard et Frozen Flame offrent un contrôle total";
        else if (dominantEffects[0] === "Charm") statusAnalysis.suggestion = "Build Charm : visez Incubus/Succubus et ultimement Satan";
        else if (dominantEffects[0] === "Poison") statusAnalysis.suggestion = "Build Poison : Virus propage les dégâts, Nuclear Bomb comme finisher";
        else if (dominantEffects[0] === "Lifesteal" || dominantEffects[0] === "Heal") statusAnalysis.suggestion = "Build Sustain : Nosferatu est l'évolution ultime, unkillable";
    }

    // ─── Step 9: Evolution pathfinding (optimal routes to S+/S evolutions) ───
    const evolutionPaths = findEvolutionPaths(currentBalls);

    // ─── Step 10: Passive↔Ball synergy analysis ───
    const passiveBallSynergies = analyzePassiveBallSynergies(currentBalls, currentPassives);

    // ─── Step 11: Build evolution graph for visualization ───
    const evolutionGraph = buildEvolutionGraph(currentBalls);

    // ─── Step 12: Character-specific hints (supports 2 characters) ───
    const characterHintsList = [];
    for (const ci of charInfos) {
        if (!CHARACTER_MECHANICS[ci.name]) continue;
        const mech = CHARACTER_MECHANICS[ci.name];
        const goodBalls = currentBalls.filter((b) => {
            const cb = getCharacterBallBonus(ci.name, b);
            return cb.bonus > 0;
        });
        const badBalls = currentBalls.filter((b) => {
            const cb = getCharacterBallBonus(ci.name, b);
            return cb.anti;
        });
        const idealBalls = (mech.ballPrefs.effect || []).filter((e) => !currentBalls.includes(e) && ballsByName[e]);
        characterHintsList.push({
            name: ci.name,
            desc: mech.desc,
            goodBalls,
            badBalls,
            idealBalls: idealBalls.slice(0, 4),
            antiReason: mech.antiReason,
        });
    }

    return {
        characters: charInfos,
        current_balls: currentBalls,
        current_passives: currentPassives,
        possible_evolutions: possibleEvolutions.slice(0, 15),
        recommended_builds: scoredBuilds.slice(0, 5),
        passive_evolutions: passiveEvos.slice(0, 6),
        next_pickups: nextPickups,
        status_analysis: statusAnalysis,
        biome_synergy: biomeSynergy,
        evolution_paths: evolutionPaths.slice(0, 8),
        passive_ball_synergies: passiveBallSynergies.slice(0, 6),
        evolution_graph: evolutionGraph,
        character_hints: characterHintsList,
    };
}

// ═══ RENDER RESULTS ═══

function renderResults(data) {
    const resultsPanel = $("#results");
    resultsPanel.classList.remove("hidden");

    // ─── Analysis Summary (status effects + biome) ───
    let analysisSummary = "";

    // Status effect analysis
    if (data.status_analysis && data.status_analysis.dominant.length > 0) {
        const effectTags = data.status_analysis.dominant.map((e) => {
            const count = data.status_analysis.profile[e];
            return `<span class="effect-tag">${e} <small>×${count}</small></span>`;
        }).join("");
        const suggestion = data.status_analysis.suggestion
            ? `<div class="analysis-suggestion">💡 ${data.status_analysis.suggestion}</div>` : "";
        const enhancing = (data.status_analysis.enhancing_evolutions || []).length > 0
            ? `<div class="analysis-enhance">🔬 Évolutions synergiques : ${data.status_analysis.enhancing_evolutions.map(
                (e) => `<strong>${e}</strong>`).join(", ")}</div>` : "";
        analysisSummary += `
        <div class="analysis-card">
            <h4 class="analysis-title">📊 Profil de Statut</h4>
            <div class="effect-tags">${effectTags}</div>
            ${suggestion}${enhancing}
        </div>`;
    }

    // Biome synergy
    if (data.biome_synergy) {
        const strongTags = data.biome_synergy.strong.map((s) => `<span class="effect-tag strong">${s}</span>`).join("");
        const weakTags = data.biome_synergy.weak.map((s) => `<span class="effect-tag weak">${s}</span>`).join("");
        analysisSummary += `
        <div class="analysis-card">
            <h4 class="analysis-title">🌍 Synergies Biome</h4>
            <p class="analysis-desc">${data.biome_synergy.desc}</p>
            <div class="biome-effects">
                ${strongTags ? `<div>✅ Efficace : ${strongTags}</div>` : ""}
                ${weakTags ? `<div>❌ Résisté : ${weakTags}</div>` : ""}
            </div>
        </div>`;
    }

    // Character hints cards (supports 2 characters)
    if (data.character_hints && data.character_hints.length > 0) {
        for (const ch of data.character_hints) {
            const goodHTML = ch.goodBalls.length > 0
                ? `<div class="char-hint-row"><span class="char-hint-label">✅ Synergiques :</span> ${ch.goodBalls.map((b) => `<span class="effect-tag strong">${b}</span>`).join("")}</div>` : "";
            const badHTML = ch.badBalls.length > 0
                ? `<div class="char-hint-row"><span class="char-hint-label">⚠️ Sous-optimales :</span> ${ch.badBalls.map((b) => `<span class="effect-tag weak">${b}</span>`).join("")}${ch.antiReason ? `<small class="char-anti-reason">${ch.antiReason}</small>` : ""}</div>` : "";
            const idealHTML = ch.idealBalls.length > 0
                ? `<div class="char-hint-row"><span class="char-hint-label">🎯 Balles idéales à trouver :</span> ${ch.idealBalls.map((b) => `<span class="effect-tag">${b}</span>`).join("")}</div>` : "";
            analysisSummary += `
            <div class="analysis-card char-card">
                <h4 class="analysis-title">🎮 ${ch.name}</h4>
                <p class="analysis-desc">${ch.desc}</p>
                ${goodHTML}${badHTML}${idealHTML}
            </div>`;
        }
    }

    // Passive↔Ball synergies
    if (data.passive_ball_synergies && data.passive_ball_synergies.length > 0) {
        let synHTML = data.passive_ball_synergies.map((syn) => {
            const activeClass = syn.active ? "active" : "potential";
            const matchedHTML = syn.matchedBalls.length > 0
                ? `<span class="syn-matched">🎱 ${syn.matchedBalls.join(", ")}</span>` : "";
            const sugBallsHTML = syn.suggestedBalls.length > 0
                ? `<span class="syn-suggest">💡 Ajoute : ${syn.suggestedBalls.join(", ")}</span>` : "";
            const sugPassHTML = syn.suggestedPassives.length > 0
                ? `<span class="syn-suggest">🛡️ Cherche : ${syn.suggestedPassives.join(", ")}</span>` : "";
            return `<div class="syn-item ${activeClass}">
                <span class="syn-tier tier-${syn.tier.toLowerCase()}">${syn.tier}</span>
                <div class="syn-body">
                    <span class="syn-reason">${syn.reason}</span>
                    <div class="syn-passives">🛡️ ${syn.ownedPassives.join(", ")}</div>
                    ${matchedHTML}${sugBallsHTML}${sugPassHTML}
                </div>
            </div>`;
        }).join("");
        analysisSummary += `
        <div class="analysis-card syn-card">
            <h4 class="analysis-title">🔗 Synergies Passif ↔ Balle</h4>
            <div class="syn-list">${synHTML}</div>
        </div>`;
    }

    const analysisSectionEl = $("#analysis-section");
    if (analysisSummary) {
        analysisSectionEl.classList.remove("hidden");
        analysisSectionEl.innerHTML = `
            <h3 class="section-subtitle"><span class="icon">🧠</span> Analyse Intelligente</h3>
            <div class="analysis-grid">${analysisSummary}</div>`;
    } else {
        analysisSectionEl.classList.add("hidden");
    }

    // ─── Next Pickups ───
    const nextPickupsEl = $("#next-pickups");
    if (data.next_pickups && data.next_pickups.length > 0) {
        nextPickupsEl.classList.remove("hidden");
        nextPickupsEl.innerHTML = `
            <h3 class="section-subtitle"><span class="icon">🎯</span> Prochaine Balle à Trouver</h3>
            <p class="section-hint">Balles qui débloquent le plus d'évolutions si tu les trouves</p>
            <div class="pickup-grid">
                ${data.next_pickups.map((p) => `
                    <div class="pickup-card">
                        ${imgTag(p.image, p.ball, "⚪")}
                        <div class="pickup-info">
                            <span class="pickup-name">${p.ball}</span>
                            ${p.rarity ? `<span class="pickup-rarity rarity-${p.rarity.toLowerCase()}">${p.rarity}</span>` : ""}
                            <span class="pickup-unlocks">Débloque : ${p.unlocks.map((u) => `<strong>${u}</strong>`).join(", ")}</span>
                        </div>
                    </div>`).join("")}
            </div>`;
    } else {
        nextPickupsEl.classList.add("hidden");
    }

    // ─── Evolutions ───
    const quickEvos = $("#quick-evos");
    const evoCards = $("#evo-cards");

    if (data.possible_evolutions && data.possible_evolutions.length > 0) {
        quickEvos.classList.remove("hidden");
        evoCards.innerHTML = data.possible_evolutions
            .map((evo) => {
                const readyClass = evo.have_both ? "ready" : "";
                const ing3HTML = evo.ingredient_3 ? `
                    <span class="evo-plus">+</span>
                    <div class="evo-ingredient ${state.selectedBalls.includes(evo.ingredient_3) ? "owned" : "missing"}">
                        ${imgTag(null, evo.ingredient_3, "⚪")}
                        <span class="evo-label">${evo.ingredient_3}</span>
                    </div>` : '';
                // Alt ingredients hint
                const altHints = [];
                if (evo.ingredient_1_alt) altHints.push(`${evo.ingredient_1} remplaçable par ${evo.ingredient_1_alt}`);
                if (evo.ingredient_2_alt) altHints.push(`${evo.ingredient_2} remplaçable par ${evo.ingredient_2_alt}`);
                const altHTML = altHints.length > 0
                    ? `<div class="evo-alt">🔄 ${altHints.join(" · ")}</div>` : "";
                const tipsHTML = evo.tips
                    ? `<div class="evo-tips">💡 ${evo.tips}</div>` : "";
                return `
                <div class="evo-card ${readyClass}">
                    <div class="evo-recipe">
                        <div class="evo-ingredient ${state.selectedBalls.includes(evo.ingredient_1) ? "owned" : "missing"}">
                            ${imgTag(evo.ingredient_1_image || getImagePath("balls", evo.ingredient_1), evo.ingredient_1, "⚪")}
                            <span class="evo-label">${evo.ingredient_1}</span>
                        </div>
                        <span class="evo-plus">+</span>
                        <div class="evo-ingredient ${state.selectedBalls.includes(evo.ingredient_2) ? "owned" : "missing"}">
                            ${imgTag(evo.ingredient_2_image || getImagePath("balls", evo.ingredient_2), evo.ingredient_2, "⚪")}
                            <span class="evo-label">${evo.ingredient_2}</span>
                        </div>
                        ${ing3HTML}
                        <span class="evo-arrow">→</span>
                        ${imgTag(evo.result_image, evo.result_ball, "✨")}
                        <span class="evo-result-name">${evo.result_ball}</span>
                        <span class="evo-tier tier-${(evo.tier || "B").toLowerCase().replace('+', '-plus')}">${evo.tier}</span>
                    </div>
                    ${altHTML}${tipsHTML}
                </div>`;
            })
            .join("");
    } else {
        quickEvos.classList.add("hidden");
    }

    // ─── Passive Evolutions ───
    const passiveEvosEl = $("#passive-evos");
    if (data.passive_evolutions && data.passive_evolutions.length > 0 && data.passive_evolutions.some((p) => p.progress > 0)) {
        passiveEvosEl.classList.remove("hidden");
        passiveEvosEl.innerHTML = `
            <h3 class="section-subtitle"><span class="icon">🛡️</span> Évolutions de Passifs</h3>
            <div class="passive-evo-grid">
                ${data.passive_evolutions.filter((p) => p.progress > 0).map((pe) => `
                    <div class="passive-evo-card ${pe.ready ? "ready" : ""}">
                        ${imgTag(pe.image, pe.name, "🛡️")}
                        <div class="passive-evo-info">
                            <span class="passive-evo-name">${pe.name}</span>
                            <div class="passive-evo-recipe">
                                ${pe.ingredients.map((ing) =>
                                    `<span class="${pe.owned_ingredients.includes(ing) ? "have" : "need"}">${ing}</span>`
                                ).join(" + ")}
                            </div>
                            <div class="passive-evo-bar">
                                <div class="passive-evo-fill" style="width:${pe.progress * 100}%"></div>
                            </div>
                        </div>
                    </div>`).join("")}
            </div>`;
    } else {
        passiveEvosEl.classList.add("hidden");
    }

    // ─── Evolution Paths (routes to S+/S evolutions) ───
    const evoPathsEl = $("#evo-paths");
    if (data.evolution_paths && data.evolution_paths.length > 0) {
        evoPathsEl.classList.remove("hidden");
        evoPathsEl.innerHTML = `
            <h3 class="section-subtitle"><span class="icon">🗺️</span> Chemins d'Évolution Optimaux</h3>
            <p class="section-hint">Routes les plus courtes vers les évolutions S+ et S depuis tes balles actuelles</p>
            <div class="evo-paths-grid">
                ${data.evolution_paths.map((path) => {
                    const statusClass = path.status === "ready" ? "path-ready" : path.missing.length <= 1 ? "path-close" : "path-far";
                    const missingHTML = path.missing.length > 0
                        ? `<div class="path-missing">Manque : ${path.missing.map((m) => `<span class="effect-tag weak">${m}</span>`).join("")}</div>`
                        : `<div class="path-ready-label">✅ Tous les ingrédients prêts !</div>`;
                    const stepsHTML = path.steps.length > 0
                        ? `<div class="path-steps">${renderPathSteps(path)}</div>` : "";
                    const tipsHTML = path.tips ? `<div class="path-tips">💡 ${path.tips}</div>` : "";
                    const diffHTML = path.difficulty ? `<span class="difficulty-badge diff-${path.difficulty.toLowerCase().replace(/ /g, "-")}">${path.difficulty}</span>` : "";
                    return `
                    <div class="path-card ${statusClass}">
                        <div class="path-header">
                            ${imgTag(getImagePath("balls", path.ball), path.ball, "✨")}
                            <span class="path-target">${path.ball}</span>
                            <span class="build-tier-badge tier-${(path.tier || "B").toLowerCase().replace('+', '-plus')}">${path.tier}</span>
                            ${diffHTML}
                            <span class="path-cost">${path.missing.length === 0 ? "Prêt!" : path.missing.length + " balle(s) manquante(s)"}</span>
                        </div>
                        ${missingHTML}
                        ${stepsHTML}
                        ${tipsHTML}
                    </div>`;
                }).join("")}
            </div>`;
    } else {
        evoPathsEl.classList.add("hidden");
    }

    // ─── Interactive Evolution Graph ───
    const evoGraphEl = $("#evo-graph");
    if (data.evolution_graph && data.evolution_graph.nodes.length > 0) {
        evoGraphEl.classList.remove("hidden");
        const graph = data.evolution_graph;

        // Group nodes by status for layered display
        const ownedNodes = graph.nodes.filter((n) => n.status === "owned");
        const readyNodes = graph.nodes.filter((n) => n.status === "ready");
        const oneAwayNodes = graph.nodes.filter((n) => n.status === "one-away");
        const partialNodes = graph.nodes.filter((n) => n.status === "partial");
        const neededNodes = graph.nodes.filter((n) => n.status === "needed");

        const renderGraphNode = (node) => {
            const tierBadge = node.tier ? `<span class="graph-tier tier-${node.tier.toLowerCase().replace('+', '-plus')}">${node.tier}</span>` : "";
            const missingHint = node.missing && node.missing.length > 0
                ? `<span class="graph-missing">+${node.missing.join(", +")}</span>` : "";
            return `
            <div class="graph-node graph-${node.status}" data-ball="${node.id}" title="${node.id}">
                ${imgTag(node.image, node.id, "⚪")}
                <span class="graph-label">${node.label}</span>
                ${tierBadge}${missingHint}
            </div>`;
        };

        const renderLayer = (nodes, label, icon) => {
            if (nodes.length === 0) return "";
            return `<div class="graph-layer">
                <div class="graph-layer-label">${icon} ${label} <span class="graph-count">(${nodes.length})</span></div>
                <div class="graph-layer-nodes">${nodes.map(renderGraphNode).join("")}</div>
            </div>`;
        };

        evoGraphEl.innerHTML = `
            <h3 class="section-subtitle"><span class="icon">🌐</span> Graphe d'Évolution</h3>
            <p class="section-hint">Toutes les évolutions accessibles depuis tes balles — regroupées par proximité</p>
            <div class="graph-container">
                ${renderLayer(ownedNodes, "Possédées", "🟢")}
                ${renderLayer(readyNodes, "Prêtes à Fusionner", "⚡")}
                ${renderLayer(oneAwayNodes, "1 Balle Manquante", "🟡")}
                ${renderLayer(partialNodes, "Partiellement Atteignables", "🟠")}
                ${renderLayer(neededNodes, "Ingrédients à Trouver", "🔴")}
            </div>`;

        // Add interactivity: click node to highlight edges
        setTimeout(() => {
            const graphNodes = evoGraphEl.querySelectorAll(".graph-node");
            graphNodes.forEach((el) => {
                el.addEventListener("click", () => {
                    const ballName = el.dataset.ball;
                    // Toggle highlight
                    const wasActive = el.classList.contains("graph-active");
                    graphNodes.forEach((n) => n.classList.remove("graph-active", "graph-connected"));
                    if (!wasActive) {
                        el.classList.add("graph-active");
                        // Highlight connected nodes
                        for (const edge of graph.edges) {
                            if (edge.from === ballName || edge.to === ballName) {
                                const other = edge.from === ballName ? edge.to : edge.from;
                                graphNodes.forEach((n) => {
                                    if (n.dataset.ball === other) n.classList.add("graph-connected");
                                });
                            }
                        }
                    }
                });
            });
        }, 0);
    } else {
        evoGraphEl.classList.add("hidden");
    }

    // ─── Builds ───
    const buildsSection = $("#build-suggestions");
    if (data.recommended_builds && data.recommended_builds.length > 0) {
        buildsSection.innerHTML = data.recommended_builds
            .map((build, idx) => renderBuildCard(build, idx))
            .join("");
    } else {
        buildsSection.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-muted);">
                <p style="font-size:2rem;margin-bottom:10px;">🤔</p>
                <p>Aucun build trouvé. Essaie de sélectionner un personnage ou des balles.</p>
            </div>`;
    }

    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Helper: render path steps recursively ───
function renderPathSteps(path) {
    if (!path.steps || path.steps.length === 0) return "";
    return path.steps.map((step) => {
        const statusIcon = step.status === "owned" ? "🟢" : step.status === "pickup" ? "🔴" : step.status === "ready" ? "⚡" : "🟡";
        const subSteps = step.steps && step.steps.length > 0 ? `<div class="path-substeps">${renderPathSteps(step)}</div>` : "";
        return `<div class="path-step">
            <span class="path-step-icon">${statusIcon}</span>
            <span class="path-step-name">${step.ball}</span>
            ${step.tier ? `<span class="path-step-tier">[${step.tier}]</span>` : ""}
            ${subSteps}
        </div>`;
    }).join('<span class="path-step-arrow">→</span>');
}

function renderBuildCard(build, idx) {
    const tierClass = `tier-${build.tier.toLowerCase().replace('+', '-plus')}-card`;
    const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

    // ─── Ratings bar ───
    let ratingsHTML = "";
    if (build.dps_rating || build.survival_rating || build.skill_cap) {
        const ratingBar = (label, value, maxVal = 10, color) => {
            const pct = Math.round((value / maxVal) * 100);
            return `<div class="rating-row">
                <span class="rating-label">${label}</span>
                <div class="rating-bar"><div class="rating-fill" style="width:${pct}%;background:${color}"></div></div>
                <span class="rating-value">${value}/${maxVal}</span>
            </div>`;
        };
        ratingsHTML = `
        <div class="build-ratings">
            ${build.dps_rating ? ratingBar("DPS", build.dps_rating, 10, "var(--danger)") : ""}
            ${build.survival_rating ? ratingBar("Survie", build.survival_rating, 10, "var(--success)") : ""}
            ${build.skill_cap ? ratingBar("Difficulté", build.skill_cap, 10, "var(--warning)") : ""}
        </div>`;
    }

    // ─── Timeline ───
    let timelineHTML = "";
    if (build.timeline) {
        timelineHTML = `
        <div class="build-section">
            <span class="build-section-label">⏱️ Timeline</span>
            <div class="build-section-content">
                <div class="build-timeline">
                    ${build.timeline.early ? `<div class="timeline-phase"><span class="phase-label early">Early</span><span class="phase-desc">${build.timeline.early}</span></div>` : ""}
                    ${build.timeline.mid ? `<div class="timeline-phase"><span class="phase-label mid">Mid</span><span class="phase-desc">${build.timeline.mid}</span></div>` : ""}
                    ${build.timeline.late ? `<div class="timeline-phase"><span class="phase-label late">Late</span><span class="phase-desc">${build.timeline.late}</span></div>` : ""}
                </div>
            </div>
        </div>`;
    }

    // ─── Roadmap with evolution chains ───
    let roadmapHTML = "";
    if (build.roadmap && build.roadmap.length > 0) {
        const renderChainNode = (node, depth = 0) => {
            if (!node) return "";
            const indent = depth > 0 ? `style="margin-left:${depth * 16}px"` : "";
            let childrenHTML = "";
            if (node.children && node.children.length > 0) {
                childrenHTML = `<div class="chain-children">
                    ${node.children.map((c) => renderChainNode(c, depth + 1)).join('<span class="chain-plus">+</span>')}
                </div>`;
            }
            const altHTML = node.alt ? `<span class="chain-alt">(ou ${node.alt})</span>` : "";
            const tipsHTML = node.tips && depth === 0 ? `<div class="chain-tips">💡 ${node.tips}</div>` : "";
            return `
            <div class="roadmap-step ${node.status}" ${indent}>
                ${imgTag(node.image, node.ball, "⚪")}
                <span class="step-name">${node.ball}</span>
                ${altHTML}
                <span class="roadmap-status ${node.status}">${statusLabel(node.status)}</span>
                ${childrenHTML}${tipsHTML}
            </div>`;
        };

        roadmapHTML = `
        <div class="build-section">
            <span class="build-section-label">🗺️ Roadmap</span>
            <div class="build-section-content">
                <div class="roadmap">
                    ${build.roadmap.map((step, i) => {
                        return `${i > 0 ? '<span class="roadmap-arrow">→</span>' : ""}${renderChainNode(step)}`;
                    }).join("")}
                </div>
            </div>
        </div>`;
    }

    // Balls
    const ballsHTML = build.core_balls_list
        .map((name) => {
            const img = build.balls_images[name];
            const ball = ballsByName[name];
            const effectHint = ball && ball.status_effect ? ` (${ball.status_effect})` : "";
            return `<span class="build-item">${imgTag(img, name, "⚪")} ${name}<small class="ball-effect-hint">${effectHint}</small></span>`;
        })
        .join("");

    // Passives
    const passivesHTML = build.core_passives_list
        .filter((p) => p)
        .map((name) => {
            const img = build.passives_images[name];
            return `<span class="build-item">${imgTag(img, name, "🛡️")} ${name}</span>`;
        })
        .join("");

    // Reasons
    const reasonsHTML =
        build.reasons && build.reasons.length > 0
            ? `<div class="build-reasons">${build.reasons.map((r) => `<span class="reason-tag">✦ ${r}</span>`).join("")}</div>`
            : "";

    // Difficulty badge
    const diffBadge = build.difficulty
        ? `<span class="difficulty-badge diff-${(build.difficulty || "").toLowerCase().replace(/ /g, "-")}">${build.difficulty}</span>` : "";

    // Subtitle
    const subtitleHTML = build.subtitle
        ? `<span class="build-subtitle">${build.subtitle}</span>` : "";

    // Pros/Cons (use arrays if available, else fallback to strings)
    let prosConsHTML = "";
    if (build.pros && build.cons) {
        prosConsHTML = `
        <div class="build-pros-cons">
            <div class="build-pro-list">
                <span class="pros-label">✅ Forces</span>
                ${(build.pros || []).map((p) => `<div class="pro-item">+ ${p}</div>`).join("")}
            </div>
            <div class="build-con-list">
                <span class="cons-label">❌ Faiblesses</span>
                ${(build.cons || []).map((c) => `<div class="con-item">− ${c}</div>`).join("")}
            </div>
        </div>`;
    } else {
        prosConsHTML = `
        <div class="build-pros-cons">
            <div class="build-pro">✅ ${build.strengths || "N/A"}</div>
            <div class="build-con">❌ ${build.weaknesses || "N/A"}</div>
        </div>`;
    }

    return `
    <div class="build-card ${tierClass}">
        <div class="build-header">
            <span class="build-rank">${rankEmojis[idx] || ""}</span>
            <span class="build-name">${build.name}</span>
            ${subtitleHTML}
            <span class="build-archetype">${build.archetype}</span>
            <span class="build-tier-badge tier-${build.tier.toLowerCase().replace('+', '-plus')}">Tier ${build.tier}</span>
            ${diffBadge}
            <span class="build-score">Score: <strong>${build.score}</strong></span>
        </div>

        ${reasonsHTML}
        ${ratingsHTML}

        <div class="build-body">
            <div class="build-section">
                <span class="build-section-label">🎱 Balles</span>
                <div class="build-section-content">
                    <div class="build-items">${ballsHTML}</div>
                </div>
            </div>

            <div class="build-section">
                <span class="build-section-label">🛡️ Passifs</span>
                <div class="build-section-content">
                    <div class="build-items">${passivesHTML}</div>
                </div>
            </div>

            ${roadmapHTML}
            ${timelineHTML}

            <div class="build-section">
                <span class="build-section-label">📋 Stratégie</span>
                <div class="build-section-content">
                    <div class="build-strategy">${build.strategy || ""}</div>
                </div>
            </div>

            ${prosConsHTML}
        </div>
    </div>`;
}

function statusLabel(status) {
    const map = {
        owned: "Possédé",
        ready: "Prêt!",
        partial: "Partiel",
        missing: "Manquant",
        pickup: "À trouver",
    };
    return map[status] || status;
}

// ═══ TOOLTIP ═══

function setupTooltip() {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);

    document.addEventListener("mouseover", (e) => {
        const item = e.target.closest("[data-tooltip]");
        if (!item) {
            tooltip.classList.remove("visible");
            return;
        }
        const parts = item.dataset.tooltip.split("|");
        tooltip.innerHTML = `
            <div class="tooltip-title">${parts[0] || ""}</div>
            <div class="tooltip-effect">${parts[1] || ""}</div>
            ${parts[2] ? `<div class="tooltip-meta">${parts[2]}</div>` : ""}
        `;
        tooltip.classList.add("visible");
    });

    document.addEventListener("mousemove", (e) => {
        if (!tooltip.classList.contains("visible")) return;
        const x = Math.min(e.clientX + 12, window.innerWidth - 270);
        const y = Math.min(e.clientY + 12, window.innerHeight - 100);
        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
    });

    document.addEventListener("mouseout", (e) => {
        const item = e.target.closest("[data-tooltip]");
        if (item) tooltip.classList.remove("visible");
    });
}
