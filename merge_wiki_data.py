#!/usr/bin/env python3
"""
merge_wiki_data.py – Merge wiki.gg scraped data into docs/data/*.json
and download missing images.

Sources:
  /tmp/wiki_base_balls.json   – 19 base balls
  /tmp/wiki_evo_balls.json    – 49 evo balls
  /tmp/wiki_characters.json   – 19 characters
  /tmp/wiki_passives.json     – 62 passives (52 base + 10 evolved)
  /tmp/wiki_levels.json       – 8 levels/biomes

Targets:
  docs/data/balls.json
  docs/data/evolutions.json
  docs/data/characters.json
  docs/data/passives.json
  docs/data/biomes.json
"""
import json, os, re, time, urllib.parse
import requests

WIKI_BASE = "https://ballxpit.wiki.gg"
DOCS = "docs"
DATA = f"{DOCS}/data"
IMG  = f"{DOCS}/img"

HEADERS = {"User-Agent": "BallxBuild-Scraper/2.0 (educational project)"}

# ────────────────────────────────────────────
# Utilities
# ────────────────────────────────────────────

def safe_filename(name):
    """Convert a display name to a safe filename slug."""
    return (name.lower()
            .replace("'", "")
            .replace("(", "").replace(")", "")
            .replace(" ", "_")
            .replace("+", "_plus"))

def download_image(wiki_path, local_path):
    """Download an image from wiki.gg if it doesn't already exist locally."""
    if not wiki_path:
        return False
    full_local = os.path.join(DOCS, local_path) if not local_path.startswith(DOCS) else local_path
    if os.path.exists(full_local):
        return True
    os.makedirs(os.path.dirname(full_local), exist_ok=True)
    url = f"{WIKI_BASE}{wiki_path}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code == 200 and len(r.content) > 100:
            with open(full_local, 'wb') as f:
                f.write(r.content)
            print(f"  ✓ Downloaded: {local_path}")
            time.sleep(0.2)  # polite delay
            return True
        else:
            print(f"  ✗ Failed ({r.status_code}): {url}")
            return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def load_json(path):
    with open(path) as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved {path}: {len(data)} items")

# ────────────────────────────────────────────
# Character name mapping (ballxpit.net → wiki)
# ────────────────────────────────────────────

# Based on starting ball and ability analysis
CHAR_NAME_MAP = {
    "The Pitling": "The Warrior",          # Default char, Bleed ball
    "Iron Fool": "The Shieldbearer",       # Iron ball, defensive
    "Lantern Knight": "The Physicist",     # Light ball
    "The Alchemist": "The Embedded",       # Poison ball
    "The Bard": "The Cohabitants",         # Brood Mother ball
    "The Gambler": "The Cogitator",        # Laser, auto-upgrades
    "The Greedy": "The Spendthrift",       # Vampire ball
    "The Itchy Finger": "The Itchy Finger",# Same name!
    "The Miner": "The Makeshift Sisyphus", # Earthquake ball
    "The Monk": "The Repentant",           # Freeze ball
    "The Necromancer": "The Shade",        # Dark ball
    "The Scholar": "The Tactician",        # Iron ball, turn-based
    "The Witch": "The Flagellant",         # Egg Sac ball
    "Vampire Hunter": "The Empty Nester",  # Ghost ball
    "Knight Captain": "The Juggler",       # Lightning ball
    "The Radical": "The Radical",          # Wind ball, same name!
}

# ────────────────────────────────────────────
# 1. MERGE BALLS
# ────────────────────────────────────────────

def merge_balls():
    print("\n══════ MERGING BALLS ══════")
    current = load_json(f"{DATA}/balls.json")
    wiki_base = load_json("/tmp/wiki_base_balls.json")
    wiki_evo = load_json("/tmp/wiki_evo_balls.json")

    # Index current by name
    by_name = {b["name"]: b for b in current}

    next_id = max(b.get("id", 0) for b in current) + 1

    # ── Process wiki base balls ──
    for wb in wiki_base:
        name = wb["name"]
        local_img = f"img/balls/{safe_filename(name)}.png"

        if name in by_name:
            # Update existing: fill missing fields
            b = by_name[name]
            if not b.get("effect") or b["effect"] == "None":
                b["effect"] = wb.get("description", b.get("effect"))
            if not b.get("image"):
                b["image"] = local_img
            b["wiki_description"] = wb.get("description", "")
            b["wiki_image"] = wb.get("wiki_image")
            b["status_effect"] = wb.get("status_effect", "")
            b["damage_type"] = wb.get("damage_type", "")
        else:
            # New base ball
            new_ball = {
                "id": next_id,
                "name": name,
                "rarity": "Common",
                "base_damage": 10,
                "speed": "Medium",
                "effect": wb.get("description", ""),
                "is_base_ball": 1,
                "is_evolution": 0,
                "image": local_img,
                "wiki_description": wb.get("description", ""),
                "wiki_image": wb.get("wiki_image"),
                "status_effect": wb.get("status_effect", ""),
                "damage_type": wb.get("damage_type", ""),
                "source": "wiki"
            }
            by_name[name] = new_ball
            current.append(new_ball)
            next_id += 1
            print(f"  + New base ball: {name}")

        # Download image
        download_image(wb.get("wiki_image"), local_img)

    # ── Process wiki evo balls ──
    for we in wiki_evo:
        name = we["name"]
        local_img = f"img/balls/{safe_filename(name)}.png"

        if name in by_name:
            b = by_name[name]
            if not b.get("effect") or b["effect"] == "None":
                b["effect"] = we.get("description", b.get("effect"))
            if not b.get("image"):
                b["image"] = local_img
            b["wiki_description"] = we.get("description", "")
            b["wiki_image"] = we.get("wiki_image")
            b["status_effect"] = we.get("status_effect", "")
            b["damage_type"] = we.get("damage_type", "")
            b["combination"] = we.get("combination", "")
        else:
            new_ball = {
                "id": next_id,
                "name": name,
                "rarity": "Rare",
                "base_damage": 20,
                "speed": "Medium",
                "effect": we.get("description", ""),
                "is_base_ball": 0,
                "is_evolution": 1,
                "image": local_img,
                "wiki_description": we.get("description", ""),
                "wiki_image": we.get("wiki_image"),
                "status_effect": we.get("status_effect", ""),
                "damage_type": we.get("damage_type", ""),
                "combination": we.get("combination", ""),
                "source": "wiki"
            }
            by_name[name] = new_ball
            current.append(new_ball)
            next_id += 1
            print(f"  + New evo ball: {name}")

        download_image(we.get("wiki_image"), local_img)

    # ── Fix specific issues ──
    # "Haemorrhage" in current → "Hemorrhage" in wiki
    if "Haemorrhage" in by_name and "Hemorrhage" not in by_name:
        by_name["Haemorrhage"]["name"] = "Hemorrhage"
        print("  ~ Renamed Haemorrhage → Hemorrhage")

    # Remove base balls that are actually evolutions
    evo_names_wiki = {we["name"] for we in wiki_evo}
    for b in current:
        if b.get("name") in evo_names_wiki and b.get("is_base_ball"):
            # Check: is it also a base ball in wiki?
            base_names_wiki = {wb["name"] for wb in wiki_base}
            if b["name"] not in base_names_wiki:
                b["is_base_ball"] = 0
                b["is_evolution"] = 1
                print(f"  ~ Fixed {b['name']}: was marked as base, now evo")

    # Clean: remove "Empty Nester" from balls (it's a character)
    current = [b for b in current if b["name"] != "Empty Nester"]

    # Sort: base balls first, then evolutions, alphabetical within
    current.sort(key=lambda b: (0 if b.get("is_base_ball") else 1, b["name"]))

    save_json(f"{DATA}/balls.json", current)
    return current


# ────────────────────────────────────────────
# 2. MERGE EVOLUTIONS
# ────────────────────────────────────────────

def parse_combination(combo_text):
    """Parse wiki combination text like 'Iron+ (GhostorDark)' into ingredients."""
    if not combo_text:
        return []
    # Clean up
    combo = combo_text.strip()
    
    # Handle triple evolutions: "Vampire Lord+Spider Queen+Mosquito King"
    parts = re.split(r'\+', combo)
    
    ingredients = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        # Handle alternatives: "(GhostorDark)" or "(Laser (Horizontal)orLaser (Vertical))"
        alt_match = re.match(r'\((.+)\)', part)
        if alt_match:
            inner = alt_match.group(1)
            # Split on 'or' but not within parentheses
            alts = re.split(r'(?<!\()or(?!\))', inner)
            alt_names = [a.strip() for a in alts if a.strip()]
            ingredients.append(" or ".join(alt_names))
        else:
            # Check if part itself contains "or" alternatives
            if 'or' in part and '(' in part:
                # e.g. "(StoneorPoison)"
                inner = re.sub(r'[()]', '', part)
                alts = inner.split('or')
                ingredients.append(" or ".join(a.strip() for a in alts))
            else:
                ingredients.append(part.strip())
    
    return ingredients


def merge_evolutions():
    print("\n══════ MERGING EVOLUTIONS ══════")
    current = load_json(f"{DATA}/evolutions.json")
    wiki_evo = load_json("/tmp/wiki_evo_balls.json")

    by_name = {e["result_ball"]: e for e in current}
    next_id = max(e.get("id", 0) for e in current) + 1

    for we in wiki_evo:
        name = we["name"]
        combo = we.get("combination", "")
        ingredients = parse_combination(combo)
        
        local_img = f"img/balls/{safe_filename(name)}.png"

        if name in by_name:
            e = by_name[name]
            # Fill missing data
            if not e.get("result_image"):
                e["result_image"] = local_img
            e["wiki_combination"] = combo
            e["wiki_description"] = we.get("description", "")
            # Update ingredients from wiki if we have them
            if ingredients:
                e["ingredient_1"] = ingredients[0] if len(ingredients) > 0 else None
                e["ingredient_2"] = ingredients[1] if len(ingredients) > 1 else None
                if len(ingredients) > 2:
                    e["ingredient_3"] = ingredients[2]
                e["recipe"] = " + ".join(ingredients)
        elif name == "Hemorrhage" and "Haemorrhage" in by_name:
            # Handle renamed evolution
            e = by_name["Haemorrhage"]
            e["result_ball"] = "Hemorrhage"
            e["wiki_combination"] = combo
            e["wiki_description"] = we.get("description", "")
            if not e.get("result_image"):
                e["result_image"] = local_img
            if ingredients:
                e["ingredient_1"] = ingredients[0] if len(ingredients) > 0 else None
                e["ingredient_2"] = ingredients[1] if len(ingredients) > 1 else None
                e["recipe"] = " + ".join(ingredients)
            by_name["Hemorrhage"] = e
        else:
            # Determine category based on ingredients
            category = "basic"
            if len(ingredients) >= 3:
                category = "triple"
            elif any("+" in str(i) or " or " in str(i) for i in ingredients):
                category = "advanced"

            new_evo = {
                "id": next_id,
                "result_ball": name,
                "recipe": " + ".join(ingredients) if ingredients else combo,
                "ingredients": ingredients,
                "tier": "B",
                "difficulty": "Medium",
                "tips": we.get("description", ""),
                "category": category,
                "result_image": local_img,
                "ingredient_1": ingredients[0] if len(ingredients) > 0 else None,
                "ingredient_2": ingredients[1] if len(ingredients) > 1 else None,
                "wiki_combination": combo,
                "wiki_description": we.get("description", ""),
                "source": "wiki"
            }
            if len(ingredients) > 2:
                new_evo["ingredient_3"] = ingredients[2]

            by_name[name] = new_evo
            current.append(new_evo)
            next_id += 1
            print(f"  + New evolution: {name} ({combo})")

    # Sort by tier then name
    tier_order = {"S+": 0, "S": 1, "A+": 2, "A": 3, "B": 4, "C": 5}
    current.sort(key=lambda e: (tier_order.get(e.get("tier", "B"), 4), e["result_ball"]))

    save_json(f"{DATA}/evolutions.json", current)
    return current


# ────────────────────────────────────────────
# 3. MERGE CHARACTERS
# ────────────────────────────────────────────

def merge_characters():
    print("\n══════ MERGING CHARACTERS ══════")
    current = load_json(f"{DATA}/characters.json")
    wiki_chars = load_json("/tmp/wiki_characters.json")

    # Build wiki lookup by name
    wiki_by_name = {c["name"]: c for c in wiki_chars}

    # Update existing characters using the name map
    for c in current:
        old_name = c["name"]
        new_name = CHAR_NAME_MAP.get(old_name, old_name)
        
        if new_name in wiki_by_name:
            wc = wiki_by_name[new_name]
            
            # Update name to wiki official name
            c["name"] = new_name
            c["ballxpit_net_name"] = old_name  # preserve old name
            
            # Update fields from wiki
            c["starting_ball"] = wc["starting_ball"]
            c["wiki_ability"] = wc["ability"]
            c["unlock"] = wc["unlock"]
            
            # Download images
            img_slug = safe_filename(new_name)
            local_img = f"img/characters/{img_slug}.png"
            local_mini = f"img/characters/{img_slug}_mini.png"
            
            if download_image(wc.get("wiki_image"), local_img):
                c["image"] = local_img
            if download_image(wc.get("wiki_mini_image"), local_mini):
                c["image_mini"] = local_mini
            
            # Starting ball image
            ball_slug = safe_filename(c["starting_ball"])
            c["starting_ball_image"] = f"img/balls/{ball_slug}.png"
            
            # Mark as matched
            wiki_by_name[new_name]["_matched"] = True
            print(f"  ↔ Mapped: {old_name} → {new_name} (ball: {c['starting_ball']})")

    # Add new characters from wiki that weren't matched
    next_id = max(c.get("id", 0) for c in current) + 1
    for wc in wiki_chars:
        if wc.get("_matched"):
            continue
        name = wc["name"]
        
        img_slug = safe_filename(name)
        local_img = f"img/characters/{img_slug}.png"
        local_mini = f"img/characters/{img_slug}_mini.png"
        
        download_image(wc.get("wiki_image"), local_img)
        download_image(wc.get("wiki_mini_image"), local_mini)
        
        ball_slug = safe_filename(wc["starting_ball"])
        
        new_char = {
            "id": next_id,
            "name": name,
            "starting_ball": wc["starting_ball"],
            "ability": wc["ability"],
            "tier": "B",
            "difficulty": "Medium",
            "unlock": wc["unlock"],
            "rating": 7.0,
            "strengths": [],
            "weaknesses": [],
            "best_balls": [],
            "playstyle": wc["ability"],
            "image": local_img,
            "image_mini": local_mini,
            "starting_ball_image": f"img/balls/{ball_slug}.png",
            "source": "wiki"
        }
        current.append(new_char)
        next_id += 1
        print(f"  + New character: {name} (ball: {wc['starting_ball']})")

    # Sort by tier then name
    tier_order = {"S+": 0, "S": 1, "A+": 2, "A": 3, "B": 4, "C": 5}
    current.sort(key=lambda c: (tier_order.get(c.get("tier", "B"), 4), c["name"]))

    save_json(f"{DATA}/characters.json", current)
    return current


# ────────────────────────────────────────────
# 4. MERGE PASSIVES
# ────────────────────────────────────────────

def merge_passives():
    print("\n══════ MERGING PASSIVES ══════")
    current = load_json(f"{DATA}/passives.json")
    wiki_passives = load_json("/tmp/wiki_passives.json")

    by_name = {p["name"]: p for p in current}
    next_id = max(p.get("id", 0) for p in current) + 1

    for wp in wiki_passives:
        name = wp.get("Name", wp.get("name", ""))
        if not name:
            continue

        desc = wp.get("Description", "")
        combo = wp.get("Combination", "")
        is_evo = 1 if combo else 0
        unlock = wp.get("Unlock Condition", wp.get("Appearance Requirement", ""))
        wiki_img = wp.get("wiki_image")

        img_slug = safe_filename(name)
        local_img = f"img/passives/{img_slug}.png"

        if name in by_name:
            p = by_name[name]
            # Update with wiki data
            if not p.get("image"):
                p["image"] = local_img
            p["wiki_description"] = desc
            if combo:
                p["combination"] = combo
                p["is_evolution"] = 1
            if not p.get("effect") or p["effect"] == "None":
                p["effect"] = desc
            # Ensure description exists too
            if not p.get("description"):
                p["description"] = desc
            download_image(wiki_img, local_img)
        else:
            # Handle slight name differences (Tormenters Mask vs Tormentor's Mask)
            alt_name = None
            if name == "Tormenters Mask" and "Tormentor's Mask" in by_name:
                alt_name = "Tormentor's Mask"
            
            if alt_name and alt_name in by_name:
                p = by_name[alt_name]
                p["wiki_description"] = desc
                if not p.get("image"):
                    p["image"] = local_img
                download_image(wiki_img, local_img)
            else:
                # New passive
                new_passive = {
                    "id": next_id,
                    "name": name,
                    "tier": "B",
                    "icon": "🔮",
                    "effect": desc,
                    "value": "",
                    "unlock": unlock,
                    "priority": 5,
                    "synergy": [],
                    "description": desc,
                    "best_for": "",
                    "rating": 6.0,
                    "is_evolution": is_evo,
                    "image": local_img,
                    "wiki_description": desc,
                    "source": "wiki"
                }
                if combo:
                    new_passive["combination"] = combo

                by_name[name] = new_passive
                current.append(new_passive)
                next_id += 1
                print(f"  + New passive: {name} {'(evo)' if is_evo else ''}")

        download_image(wiki_img, local_img)

    # Sort: non-evolution first, then evolutions, alphabetical within
    current.sort(key=lambda p: (1 if p.get("is_evolution") else 0, p["name"]))

    save_json(f"{DATA}/passives.json", current)
    return current


# ────────────────────────────────────────────
# 5. MERGE BIOMES
# ────────────────────────────────────────────

def merge_biomes():
    print("\n══════ MERGING BIOMES ══════")
    current = load_json(f"{DATA}/biomes.json")
    wiki_levels = load_json("/tmp/wiki_levels.json")

    # Keep existing detailed data, add new levels
    existing_names = {b["name"] for b in current}

    next_id = max(b.get("id", 0) for b in current) + 1

    for wl in wiki_levels:
        name = wl["name"]  # e.g. "The BONExYARD"
        
        # Check if we already have it
        if name in existing_names:
            continue
        
        img_slug = safe_filename(name)
        local_img = f"img/biomes/{img_slug}.png"
        download_image(wl.get("wiki_image"), local_img)
        
        new_biome = {
            "id": next_id,
            "name": name,
            "subtitle": f"Layer {wl.get('layer', '?')}",
            "difficulty": int(wl.get("layer", 1)),
            "avg_time": "10-20 minutes",
            "recommended_level": f"{int(wl.get('layer',1))*5}-{int(wl.get('layer',1))*5+10}",
            "description": f"Layer {wl.get('layer', '?')} of The Pit.",
            "hazards": [],
            "advantages": [],
            "enemies": [],
            "boss_name": "Unknown",
            "boss_hp": "???",
            "boss_phases": 1,
            "boss_description": "",
            "boss_attacks": [],
            "boss_strategy": "",
            "boss_weaknesses": [],
            "boss_rewards": [],
            "recommended_builds": [],
            "tips": [],
            "image": local_img,
            "gears_to_unlock": wl.get("gears_to_unlock", ""),
            "blueprints": wl.get("blueprints", ""),
            "total_blueprints": wl.get("total_blueprints", ""),
            "first_clear_unlocks": wl.get("first_clear_unlocks", ""),
            "source": "wiki"
        }
        current.append(new_biome)
        next_id += 1
        print(f"  + New biome: {name} (Layer {wl.get('layer')})")

    # Sort by difficulty / layer
    current.sort(key=lambda b: b.get("difficulty", 0))

    save_json(f"{DATA}/biomes.json", current)
    return current


# ────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────

if __name__ == "__main__":
    print("╔════════════════════════════════════════════╗")
    print("║  Wiki Data Merge — ballxpit.wiki.gg       ║")
    print("╚════════════════════════════════════════════╝")

    merge_balls()
    merge_evolutions()
    merge_characters()
    merge_passives()
    merge_biomes()

    print("\n✅ All data merged successfully!")
    
    # Summary
    for f in ['balls', 'evolutions', 'characters', 'passives', 'biomes']:
        data = load_json(f"{DATA}/{f}.json")
        print(f"  {f}: {len(data)} items")
