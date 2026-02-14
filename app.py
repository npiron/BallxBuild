#!/usr/bin/env python3
"""
BALL x PIT — Build Suggester Web App
Flask backend serving the build suggestion API and web interface.
"""

import sqlite3
import os
import json
from flask import Flask, render_template, jsonify, request, send_from_directory
from pathlib import Path

app = Flask(
    __name__,
    template_folder="web/templates",
    static_folder="web/static"
)

DB_PATH = Path("ballxpit_knowledge_base.db")


def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def get_image_path(entity_type, name):
    """Resolve the image path for an entity (character, ball, passive, biome)."""
    safe_name = name.lower().replace(" ", "_").replace("'", "").replace("(", "").replace(")", "")
    # For biomes, add 'the_' prefix
    if entity_type == "biomes":
        if not safe_name.startswith("the_"):
            safe_name = "the_" + safe_name

    path = f"img/{entity_type}/{safe_name}.png"
    full_path = os.path.join("web/static", path)
    if os.path.exists(full_path):
        return path
    return None


# ─── Routes ───────────────────────────────────────────────


@app.route("/")
def index():
    """Main page."""
    return render_template("index.html")


@app.route("/api/characters")
def api_characters():
    """Get all characters."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, starting_ball, ability, tier, blueprint_location "
        "FROM characters ORDER BY "
        "CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 WHEN 'C' THEN 4 END, name"
    ).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["image"] = get_image_path("characters", d["name"])
        d["image_mini"] = get_image_path("characters", d["name"] + "_mini")
        d["starting_ball_image"] = get_image_path("balls", d["starting_ball"])
        result.append(d)
    conn.close()
    return jsonify(result)


@app.route("/api/balls")
def api_balls():
    """Get all balls."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, rarity, base_damage, speed, effect, is_base_ball, is_evolution "
        "FROM balls ORDER BY "
        "CASE rarity WHEN 'Legendary' THEN 1 WHEN 'Epic' THEN 2 WHEN 'Rare' THEN 3 "
        "WHEN 'Uncommon' THEN 4 WHEN 'Common' THEN 5 END, name"
    ).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["image"] = get_image_path("balls", d["name"])
        result.append(d)
    conn.close()
    return jsonify(result)


@app.route("/api/passives")
def api_passives():
    """Get all passives."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, effect, is_evolution FROM passives ORDER BY name"
    ).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["image"] = get_image_path("passives", d["name"])
        result.append(d)
    conn.close()
    return jsonify(result)


@app.route("/api/biomes")
def api_biomes():
    """Get all biomes."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, unlock_order, unlock_requirement, boss_name "
        "FROM biomes ORDER BY unlock_order"
    ).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["image"] = get_image_path("biomes", d["name"])
        result.append(d)
    conn.close()
    return jsonify(result)


@app.route("/api/evolutions")
def api_evolutions():
    """Get all evolutions."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, result_ball, ingredient_1, ingredient_2, tier FROM evolutions "
        "ORDER BY CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 END"
    ).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["result_image"] = get_image_path("balls", d["result_ball"])
        d["ingredient_1_image"] = get_image_path("balls", d["ingredient_1"])
        d["ingredient_2_image"] = get_image_path("balls", d["ingredient_2"])
        result.append(d)
    conn.close()
    return jsonify(result)


@app.route("/api/builds")
def api_builds():
    """Get all predefined builds."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM builds ORDER BY "
        "CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 END"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/suggest", methods=["POST"])
def api_suggest():
    """
    Intelligent build suggestion engine.
    Accepts current run state and returns optimal build paths.
    
    Input JSON:
    {
        "character": "The Itchy Finger" | null,
        "biome": "BONExYARD" | null,
        "current_balls": ["Burn", "Iron"] | [],
        "current_passives": ["Fleet Feet"] | [],
        "prefer_style": "aoe" | "sustain" | "control" | "boss" | "minion" | null
    }
    """
    data = request.get_json() or {}
    character = data.get("character")
    biome = data.get("biome")
    current_balls = data.get("current_balls", [])
    current_passives = data.get("current_passives", [])
    prefer_style = data.get("prefer_style")

    conn = get_db()
    suggestions = []

    # ─── Step 1: Find character info ───
    char_info = None
    if character:
        row = conn.execute(
            "SELECT * FROM characters WHERE name = ?", (character,)
        ).fetchone()
        if row:
            char_info = dict(row)
            # Add starting ball to current_balls if not there
            if char_info["starting_ball"] not in current_balls:
                current_balls = [char_info["starting_ball"]] + current_balls

    # ─── Step 2: Find possible evolutions from current balls ───
    possible_evolutions = []
    for ball in current_balls:
        evos = conn.execute(
            "SELECT e.*, b.effect as result_effect, b.rarity as result_rarity, "
            "b.base_damage as result_damage "
            "FROM evolutions e JOIN balls b ON b.name = e.result_ball "
            "WHERE e.ingredient_1 = ? OR e.ingredient_2 = ?",
            (ball, ball)
        ).fetchall()
        for evo in evos:
            evo_dict = dict(evo)
            other_ing = evo_dict["ingredient_2"] if evo_dict["ingredient_1"] == ball else evo_dict["ingredient_1"]
            evo_dict["from_ball"] = ball
            evo_dict["needs_ball"] = other_ing
            evo_dict["have_both"] = other_ing in current_balls
            evo_dict["result_image"] = get_image_path("balls", evo_dict["result_ball"])
            evo_dict["ingredient_1_image"] = get_image_path("balls", evo_dict["ingredient_1"])
            evo_dict["ingredient_2_image"] = get_image_path("balls", evo_dict["ingredient_2"])
            possible_evolutions.append(evo_dict)

    # Deduplicate
    seen = set()
    unique_evos = []
    for e in possible_evolutions:
        key = e["result_ball"]
        if key not in seen:
            seen.add(key)
            unique_evos.append(e)
    possible_evolutions = unique_evos

    # Sort: ready evolutions first, then by tier
    tier_order = {"S": 0, "A": 1, "B": 2, "C": 3}
    possible_evolutions.sort(
        key=lambda x: (0 if x["have_both"] else 1, tier_order.get(x["tier"], 9))
    )

    # ─── Step 3: Score and recommend builds ───
    builds = conn.execute("SELECT * FROM builds").fetchall()
    scored_builds = []

    style_map = {
        "aoe": "AOE Status", "status": "AOE Status",
        "sustain": "Sustain", "tank": "Sustain",
        "control": "Control", "freeze": "Control",
        "boss": "Boss Killer", "dps": "Boss Killer",
        "minion": "Minion Swarm", "swarm": "Minion Swarm",
        "hybrid": "Hybrid", "laser": "Hybrid"
    }

    for build in builds:
        b = dict(build)
        score = 0
        reasons = []

        # Tier score
        tier_score = {"S": 30, "A": 20, "B": 10}
        score += tier_score.get(b["tier"], 0)

        # Character match
        if character and character in (b["recommended_characters"] or ""):
            score += 40
            reasons.append(f"Recommandé pour {character}")

        # Style match
        if prefer_style:
            mapped = style_map.get(prefer_style.lower())
            if mapped and mapped == b["archetype"]:
                score += 35
                reasons.append(f"Style {mapped} demandé")

        # Ball synergy: check how many current balls align with the build
        build_balls = [x.strip() for x in b["core_balls"].split(",")]
        ball_matches = 0
        for cb in current_balls:
            # Direct match
            if cb in build_balls:
                ball_matches += 1
                score += 15
                reasons.append(f"Balle {cb} dans le build")
            # Check if current ball can evolve into a build ball
            for evo in possible_evolutions:
                if evo["from_ball"] == cb and evo["result_ball"] in build_balls:
                    score += 10
                    reasons.append(f"{cb} → {evo['result_ball']}")

        # Passive synergy
        build_passives = [x.strip() for x in (b["core_passives"] or "").split(",")]
        for cp in current_passives:
            if cp in build_passives:
                score += 10
                reasons.append(f"Passif {cp} dans le build")

        # Prepare evolution roadmap for this build
        roadmap = []
        for target_ball in build_balls:
            if target_ball in current_balls:
                roadmap.append({
                    "ball": target_ball,
                    "status": "owned",
                    "image": get_image_path("balls", target_ball)
                })
            else:
                # Check if we can evolve to it
                recipe = conn.execute(
                    "SELECT * FROM evolutions WHERE result_ball = ?",
                    (target_ball,)
                ).fetchone()
                if recipe:
                    recipe_dict = dict(recipe)
                    have_1 = recipe_dict["ingredient_1"] in current_balls
                    have_2 = recipe_dict["ingredient_2"] in current_balls
                    status = "ready" if (have_1 and have_2) else "partial" if (have_1 or have_2) else "missing"
                    roadmap.append({
                        "ball": target_ball,
                        "status": status,
                        "ingredient_1": recipe_dict["ingredient_1"],
                        "ingredient_2": recipe_dict["ingredient_2"],
                        "have_1": have_1,
                        "have_2": have_2,
                        "image": get_image_path("balls", target_ball),
                        "ing1_image": get_image_path("balls", recipe_dict["ingredient_1"]),
                        "ing2_image": get_image_path("balls", recipe_dict["ingredient_2"])
                    })
                else:
                    roadmap.append({
                        "ball": target_ball,
                        "status": "pickup",
                        "image": get_image_path("balls", target_ball)
                    })

        b["score"] = score
        b["reasons"] = reasons
        b["roadmap"] = roadmap
        b["core_balls_list"] = build_balls
        b["core_passives_list"] = build_passives

        # Add images for the build's balls and passives
        b["balls_images"] = {
            ball: get_image_path("balls", ball) for ball in build_balls
        }
        b["passives_images"] = {
            p: get_image_path("passives", p) for p in build_passives if p
        }

        scored_builds.append(b)

    # Sort by score
    scored_builds.sort(key=lambda x: x["score"], reverse=True)

    # ─── Step 4: Suggest passive evolutions ───
    passive_evos = []
    evo_passives = conn.execute(
        "SELECT * FROM passives WHERE is_evolution = 1"
    ).fetchall()
    for ep in evo_passives:
        ep_dict = dict(ep)
        ep_dict["image"] = get_image_path("passives", ep_dict["name"])
        passive_evos.append(ep_dict)

    conn.close()

    return jsonify({
        "character": char_info,
        "current_balls": current_balls,
        "current_passives": current_passives,
        "possible_evolutions": possible_evolutions[:10],
        "recommended_builds": scored_builds[:5],
        "passive_evolutions": passive_evos
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
