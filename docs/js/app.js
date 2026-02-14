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
    selectedCharacter: null,
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
        <div class="entity-item ${state.selectedCharacter === c.name ? "selected" : ""}"
             data-name="${c.name}" data-type="character"
             data-tooltip="${c.name}|${c.ability || "Aucune capacité"}|Balle: ${c.starting_ball} · Tier ${c.tier}">
            ${imgTag(c.image, c.name, "🎮")}
            <span class="entity-name">${c.name.replace("The ", "")}</span>
            <span class="tier-badge tier-${c.tier.toLowerCase()}">${c.tier}</span>
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
    // Character
    $("#character-grid").addEventListener("click", (e) => {
        const item = e.target.closest(".entity-item");
        if (!item) return;
        const name = item.dataset.name;
        state.selectedCharacter = state.selectedCharacter === name ? null : name;
        renderCharacters();
        if (state.selectedCharacter) {
            const char = state.characters.find((c) => c.name === name);
            if (char && !state.selectedBalls.includes(char.starting_ball)) {
                state.selectedBalls.push(char.starting_ball);
                renderBalls();
                updateSelectedBalls();
            }
        }
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
        state.selectedCharacter = null;
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

// ═══ SUGGESTION ENGINE (client-side) ═══

function suggest() {
    const btn = $("#btn-suggest");
    btn.classList.add("loading");
    btn.innerHTML = '<span class="spinner"></span> Analyse en cours...';

    // Small delay for UX feedback
    setTimeout(() => {
        const result = computeSuggestions();
        renderResults(result);
        btn.classList.remove("loading");
        btn.innerHTML = '<span class="btn-icon">🔮</span> Analyser & Suggérer';
    }, 150);
}

function computeSuggestions() {
    let currentBalls = [...state.selectedBalls];
    const currentPassives = [...state.selectedPassives];
    const character = state.selectedCharacter;
    const preferStyle = state.selectedStyle;

    // Step 1: Character info
    let charInfo = null;
    if (character) {
        charInfo = state.characters.find((c) => c.name === character);
        if (charInfo && !currentBalls.includes(charInfo.starting_ball)) {
            currentBalls = [charInfo.starting_ball, ...currentBalls];
        }
    }

    // Step 2: Possible evolutions from current balls
    let possibleEvolutions = [];
    const seen = new Set();
    for (const ball of currentBalls) {
        const evos = state.evolutions.filter(
            (e) => e.ingredient_1 === ball || e.ingredient_2 === ball
        );
        for (const evo of evos) {
            if (seen.has(evo.result_ball)) continue;
            seen.add(evo.result_ball);
            const otherIng = evo.ingredient_1 === ball ? evo.ingredient_2 : evo.ingredient_1;
            possibleEvolutions.push({
                ...evo,
                from_ball: ball,
                needs_ball: otherIng,
                have_both: currentBalls.includes(otherIng),
            });
        }
    }

    const tierOrder = { S: 0, A: 1, B: 2, C: 3 };
    possibleEvolutions.sort(
        (a, b) => (a.have_both ? 0 : 1) - (b.have_both ? 0 : 1) || (tierOrder[a.tier] || 9) - (tierOrder[b.tier] || 9)
    );

    // Step 3: Score and recommend builds
    const styleMap = {
        aoe: "AOE Status", status: "AOE Status",
        sustain: "Sustain", tank: "Sustain",
        control: "Control", freeze: "Control",
        boss: "Boss Killer", dps: "Boss Killer",
        minion: "Minion Swarm", swarm: "Minion Swarm",
        hybrid: "Hybrid", laser: "Hybrid",
    };

    const scoredBuilds = state.builds.map((build) => {
        const b = { ...build };
        let score = 0;
        const reasons = [];

        // Tier score
        const tierScore = { S: 30, A: 20, B: 10 };
        score += tierScore[b.tier] || 0;

        // Character match
        if (character && (b.recommended_characters || "").includes(character)) {
            score += 40;
            reasons.push(`Recommandé pour ${character}`);
        }

        // Style match
        if (preferStyle) {
            const mapped = styleMap[preferStyle.toLowerCase()];
            if (mapped && mapped === b.archetype) {
                score += 35;
                reasons.push(`Style ${mapped} demandé`);
            }
        }

        // Ball synergy
        const buildBalls = b.core_balls.split(",").map((s) => s.trim());
        for (const cb of currentBalls) {
            if (buildBalls.includes(cb)) {
                score += 15;
                reasons.push(`Balle ${cb} dans le build`);
            }
            for (const evo of possibleEvolutions) {
                if (evo.from_ball === cb && buildBalls.includes(evo.result_ball)) {
                    score += 10;
                    reasons.push(`${cb} → ${evo.result_ball}`);
                }
            }
        }

        // Passive synergy
        const buildPassives = (b.core_passives || "").split(",").map((s) => s.trim());
        for (const cp of currentPassives) {
            if (buildPassives.includes(cp)) {
                score += 10;
                reasons.push(`Passif ${cp} dans le build`);
            }
        }

        // Roadmap
        const roadmap = buildBalls.map((targetBall) => {
            if (currentBalls.includes(targetBall)) {
                return {
                    ball: targetBall,
                    status: "owned",
                    image: getImagePath("balls", targetBall),
                };
            }
            const recipe = state.evolutions.find((e) => e.result_ball === targetBall);
            if (recipe) {
                const have1 = currentBalls.includes(recipe.ingredient_1);
                const have2 = currentBalls.includes(recipe.ingredient_2);
                const status = have1 && have2 ? "ready" : have1 || have2 ? "partial" : "missing";
                return {
                    ball: targetBall,
                    status,
                    ingredient_1: recipe.ingredient_1,
                    ingredient_2: recipe.ingredient_2,
                    have_1: have1,
                    have_2: have2,
                    image: getImagePath("balls", targetBall),
                    ing1_image: getImagePath("balls", recipe.ingredient_1),
                    ing2_image: getImagePath("balls", recipe.ingredient_2),
                };
            }
            return {
                ball: targetBall,
                status: "pickup",
                image: getImagePath("balls", targetBall),
            };
        });

        b.score = score;
        b.reasons = reasons;
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

    // Step 4: Passive evolutions
    const passiveEvos = state.passives.filter((p) => p.is_evolution);

    return {
        character: charInfo,
        current_balls: currentBalls,
        current_passives: currentPassives,
        possible_evolutions: possibleEvolutions.slice(0, 10),
        recommended_builds: scoredBuilds.slice(0, 5),
        passive_evolutions: passiveEvos,
    };
}

// ═══ RENDER RESULTS ═══

function renderResults(data) {
    const resultsPanel = $("#results");
    resultsPanel.classList.remove("hidden");

    // Evolutions
    const quickEvos = $("#quick-evos");
    const evoCards = $("#evo-cards");

    if (data.possible_evolutions && data.possible_evolutions.length > 0) {
        quickEvos.classList.remove("hidden");
        evoCards.innerHTML = data.possible_evolutions
            .map((evo) => {
                const readyClass = evo.have_both ? "ready" : "";
                return `
                <div class="evo-card ${readyClass}">
                    <div class="evo-ingredient ${state.selectedBalls.includes(evo.ingredient_1) ? "owned" : "missing"}">
                        ${imgTag(evo.ingredient_1_image, evo.ingredient_1, "⚪")}
                        <span class="evo-label">${evo.ingredient_1}</span>
                    </div>
                    <span class="evo-plus">+</span>
                    <div class="evo-ingredient ${state.selectedBalls.includes(evo.ingredient_2) ? "owned" : "missing"}">
                        ${imgTag(evo.ingredient_2_image, evo.ingredient_2, "⚪")}
                        <span class="evo-label">${evo.ingredient_2}</span>
                    </div>
                    <span class="evo-arrow">→</span>
                    ${imgTag(evo.result_image, evo.result_ball, "✨")}
                    <span class="evo-label" style="font-weight:700;color:var(--text-primary)">${evo.result_ball}</span>
                    <span class="evo-tier tier-${evo.tier.toLowerCase()}">${evo.tier}</span>
                </div>`;
            })
            .join("");
    } else {
        quickEvos.classList.add("hidden");
    }

    // Builds
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

function renderBuildCard(build, idx) {
    const tierClass = `tier-${build.tier.toLowerCase()}-card`;
    const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

    // Roadmap
    let roadmapHTML = "";
    if (build.roadmap && build.roadmap.length > 0) {
        roadmapHTML = `
        <div class="build-section">
            <span class="build-section-label">Roadmap</span>
            <div class="build-section-content">
                <div class="roadmap">
                    ${build.roadmap
                        .map((step, i) => {
                            let recipeHTML = "";
                            if (step.ingredient_1) {
                                recipeHTML = `<div class="roadmap-recipe">
                                    ${imgTag(step.ing1_image, step.ingredient_1, "⚪")}
                                    <span class="${step.have_1 ? "have" : "need"}">${step.ingredient_1}</span>
                                    +
                                    ${imgTag(step.ing2_image, step.ingredient_2, "⚪")}
                                    <span class="${step.have_2 ? "have" : "need"}">${step.ingredient_2}</span>
                                </div>`;
                            }
                            return `
                            ${i > 0 ? '<span class="roadmap-arrow">→</span>' : ""}
                            <div class="roadmap-step ${step.status}">
                                ${imgTag(step.image, step.ball, "⚪")}
                                <span class="step-name">${step.ball}</span>
                                <span class="roadmap-status ${step.status}">${statusLabel(step.status)}</span>
                                ${recipeHTML}
                            </div>`;
                        })
                        .join("")}
                </div>
            </div>
        </div>`;
    }

    // Balls
    const ballsHTML = build.core_balls_list
        .map((name) => {
            const img = build.balls_images[name];
            return `<span class="build-item">${imgTag(img, name, "⚪")} ${name}</span>`;
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

    return `
    <div class="build-card ${tierClass}">
        <div class="build-header">
            <span class="build-rank">${rankEmojis[idx] || ""}</span>
            <span class="build-name">${build.name}</span>
            <span class="build-archetype">${build.archetype}</span>
            <span class="build-tier-badge tier-${build.tier.toLowerCase()}">Tier ${build.tier}</span>
            <span class="build-score">Score: <strong>${build.score}</strong></span>
        </div>

        ${reasonsHTML}

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

            <div class="build-section">
                <span class="build-section-label">📋 Stratégie</span>
                <div class="build-section-content">
                    <div class="build-strategy">${build.strategy || ""}</div>
                </div>
            </div>

            <div class="build-pros-cons">
                <div class="build-pro">✅ ${build.strengths || "N/A"}</div>
                <div class="build-con">❌ ${build.weaknesses || "N/A"}</div>
            </div>
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
