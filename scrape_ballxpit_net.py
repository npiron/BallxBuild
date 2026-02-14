#!/usr/bin/env python3
"""
Scrape all game data from ballxpit.net (React SPA).
Extracts data embedded in the Vite/React JS bundle.
Source: https://ballxpit.net
"""

import re
import json
import sys
import requests

BUNDLE_URL = "https://ballxpit.net/assets/index-e415fed5.js"
HEADERS = {"User-Agent": "BallxBuild-Scraper/2.0 (educational project)"}
DATA_DIR = "docs/data"


def fetch_bundle():
    """Download the JS bundle from ballxpit.net."""
    print("📥 Téléchargement du bundle JS de ballxpit.net...")
    r = requests.get(BUNDLE_URL, headers=HEADERS, timeout=30)
    r.raise_for_status()
    print(f"   ✅ Bundle téléchargé ({len(r.text):,} caractères)")
    return r.text


def js_obj_to_json(js_str):
    """Convert JS object notation to valid JSON.
    Handles: unquoted keys, single quotes, trailing commas, etc.
    """
    s = js_str
    # Add quotes around unquoted keys: word: -> "word":
    s = re.sub(r'(?<=[{,\[])\s*(\w+)\s*:', r'"\1":', s)
    # Fix remaining unquoted keys after newlines
    s = re.sub(r'\n\s*(\w+)\s*:', r'"\1":', s)
    # Remove trailing commas before } or ]
    s = re.sub(r',\s*([}\]])', r'\1', s)
    return s


def extract_array(content, marker, max_len=60000):
    """Extract a JS array starting before the marker text."""
    idx = content.find(marker)
    if idx < 0:
        print(f"   ⚠️ Marqueur non trouvé: {marker[:50]}")
        return None

    # Find the [ that starts this array
    search_start = max(0, idx - 500)
    arr_start = content.rfind('[{', search_start, idx)
    if arr_start < 0:
        arr_start = content.rfind('[', search_start, idx)
    if arr_start < 0:
        return None

    # Find matching ]
    depth = 0
    end = arr_start
    for i in range(arr_start, min(arr_start + max_len, len(content))):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
        if depth == 0:
            end = i + 1
            break

    raw = content[arr_start:end]
    json_str = js_obj_to_json(raw)
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"   ⚠️ Erreur JSON parse: {e}")
        # Try a more aggressive cleanup
        # Sometimes emoji or special chars cause issues
        json_str2 = json_str.encode('utf-8', errors='replace').decode('utf-8')
        try:
            return json.loads(json_str2)
        except:
            print(f"   ❌ Impossible de parser le JSON (longueur: {len(raw)})")
            # Save for debugging
            with open('/tmp/debug_extract.txt', 'w') as f:
                f.write(json_str)
            return None


def extract_balls(content):
    """Extract all balls data."""
    print("\n🎱 Extraction des Balles...")
    data = extract_array(content, 'name:"Basic Ball",category:"Basic"')
    if data:
        print(f"   ✅ {len(data)} balles extraites")
        for b in data[:3]:
            print(f"      - {b.get('name')} ({b.get('rarity')})")
    return data


def extract_evolutions(content):
    """Extract all evolution/fusion recipes from multiple category arrays."""
    print("\n🔬 Extraction des Évolutions...")

    all_evos = []
    categories = ['basic', 'advanced', 'double', 'triple', 'elemental']

    for cat in categories:
        marker = f'category:"{cat}"'
        idx = content.find(marker)
        if idx < 0:
            continue

        # Find the [ that starts this array
        for offset in range(2000):
            check = idx - offset
            if check < 0:
                break
            if content[check] == '[' and content[check + 1] == '{':
                depth = 0
                end = check
                for i in range(check, min(check + 30000, len(content))):
                    if content[i] == '[':
                        depth += 1
                    elif content[i] == ']':
                        depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
                raw = content[check:end]
                json_str = js_obj_to_json(raw)
                try:
                    arr = json.loads(json_str)
                    all_evos.extend(arr)
                    print(f"   📂 Catégorie '{cat}': {len(arr)} évolutions")
                except json.JSONDecodeError:
                    print(f"   ⚠️ Erreur parse catégorie '{cat}'")
                break

    if all_evos:
        print(f"   ✅ {len(all_evos)} évolutions extraites au total")
        for e in all_evos[:3]:
            print(f"      - {e.get('name')}: {e.get('recipe')} → Tier {e.get('tier')}")
    return all_evos


def extract_characters(content):
    """Extract all character data."""
    print("\n🎮 Extraction des Personnages...")
    data = extract_array(content, 'name:"The Pitling",tier:')
    if data:
        print(f"   ✅ {len(data)} personnages extraits")
        for c in data[:3]:
            print(f"      - {c.get('name')} (Tier {c.get('tier')}, Ball: {c.get('startingBall')})")
    return data


def extract_passives(content):
    """Extract all passive items data."""
    print("\n🛡️ Extraction des Passifs...")
    data = extract_array(content, 'name:"Soul Reaver",tier:"S"')
    if data:
        print(f"   ✅ {len(data)} passifs extraits")
        for p in data[:3]:
            print(f"      - {p.get('name')} (Tier {p.get('tier')}, {p.get('effect')})")
    return data


def extract_builds(content):
    """Extract all build recommendations."""
    print("\n🏆 Extraction des Builds...")
    data = extract_array(content, 'name:"Murder Build",subtitle:')
    if data:
        print(f"   ✅ {len(data)} builds extraits")
        for b in data[:3]:
            print(f"      - {b.get('name')} (Tier {b.get('tier')}, {b.get('category')})")
    return data


def extract_biomes(content):
    """Extract all biome data."""
    print("\n🌍 Extraction des Biomes...")
    data = extract_array(content, 'name:"The Pit",subtitle:"Tutorial Grounds"')
    if data:
        print(f"   ✅ {len(data)} biomes extraits")
        for b in data[:3]:
            print(f"      - {b.get('name')} (Difficulté: {b.get('difficulty')})")
    return data


# ─── TRANSFORMERS: Convert ballxpit.net format → our JSON format ───

def transform_balls(net_balls, existing_balls):
    """Merge ballxpit.net ball data with existing data."""
    existing_map = {b['name'].lower().replace(' ball', ''): b for b in existing_balls}

    result = []
    for i, nb in enumerate(net_balls, 1):
        name = nb['name'].replace(' Ball', '')  # "Fire Ball" → "Fire"
        name_key = name.lower()

        # Map ballxpit.net names to our existing names
        name_map = {
            'basic': 'Bleed',  # closest equivalent
            'fire': 'Burn',
            'ice': 'Freeze',
            'money': 'Money',
            'harvest': 'Harvest',
            'sun': 'The Sun',
            'void leviathan': 'Void Leviathan',
            'empty nester': 'Empty Nester',
        }

        display_name = name_map.get(name_key, name)
        existing = existing_map.get(display_name.lower(), existing_map.get(name_key, None))

        ball = {
            'id': existing['id'] if existing else 100 + i,
            'name': display_name,
            'rarity': nb.get('rarity', 'Common'),
            'base_damage': int(nb.get('damage', 0)) if nb.get('damage', '').isdigit() else 0,
            'speed': nb.get('speed', 'Medium'),
            'effect': nb.get('special', ''),
            'category': nb.get('category', ''),
            'unlock': nb.get('unlock', ''),
            'evolution_hint': nb.get('evolution', ''),
            'is_base_ball': 1 if nb.get('category') in ('Basic', 'Elemental', 'Dark', 'Special', 'Utility', 'Beast') else 0,
            'is_evolution': 1 if nb.get('category') in ('Evolved', 'Ultimate', 'Demon') else 0,
            'image': existing.get('image') if existing else None,
        }
        result.append(ball)

    # Add balls from existing data that aren't in new data
    new_names = {b['name'].lower() for b in result}
    for eb in existing_balls:
        if eb['name'].lower() not in new_names:
            eb['source'] = 'wiki_only'
            result.append(eb)

    return sorted(result, key=lambda x: (
        {'Common': 0, 'Uncommon': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4}.get(x.get('rarity', ''), 5),
        x.get('name', '')
    ))


def transform_evolutions(net_evos, existing_evos):
    """Merge evolution data."""
    result = []
    seen = set()

    for i, ne in enumerate(net_evos, 1):
        name = ne.get('name', '')
        if name.lower() in seen:
            continue
        seen.add(name.lower())

        # Parse ingredients from recipe
        recipe = ne.get('recipe', '')
        ingredients = ne.get('ingredients', [])
        # Clean emoji from ingredient names
        clean_ingredients = []
        for ing in ingredients:
            clean = re.sub(r'[^\w\s\+\-\(\)]', '', ing).strip()
            clean_ingredients.append(clean)

        # Match to existing evolution
        existing = None
        for ee in existing_evos:
            if ee.get('result_ball', '').lower() == name.lower():
                existing = ee
                break

        evo = {
            'id': existing['id'] if existing else 100 + i,
            'result_ball': name,
            'recipe': recipe,
            'ingredients': clean_ingredients,
            'tier': ne.get('tier', 'B'),
            'difficulty': ne.get('difficulty', 'Medium'),
            'tips': ne.get('tips', ''),
            'category': ne.get('category', 'basic'),
            'result_image': existing.get('result_image') if existing else None,
        }

        # Try to extract ingredient_1 and ingredient_2 from recipe
        parts = recipe.split(' + ')
        if len(parts) >= 2:
            evo['ingredient_1'] = parts[0].strip()
            evo['ingredient_2'] = parts[1].strip()
            if len(parts) >= 3:
                evo['ingredient_3'] = parts[2].strip()

        result.append(evo)

    return sorted(result, key=lambda x: (
        {'S+': 0, 'S': 1, 'A': 2, 'B': 3, 'C': 4}.get(x.get('tier', ''), 5),
        x.get('result_ball', '')
    ))


def transform_characters(net_chars, existing_chars):
    """Merge character data."""
    existing_map = {c['name'].lower(): c for c in existing_chars}

    result = []
    for i, nc in enumerate(net_chars, 1):
        name = nc.get('name', '')
        existing = existing_map.get(name.lower())

        char = {
            'id': existing['id'] if existing else 100 + i,
            'name': name,
            'starting_ball': nc.get('startingBall', 'Unknown'),
            'ability': nc.get('playstyle', ''),
            'tier': nc.get('tier', 'B'),
            'difficulty': nc.get('difficulty', 'Medium'),
            'unlock': nc.get('unlock', ''),
            'rating': nc.get('rating', 0),
            'strengths': nc.get('strengths', []),
            'weaknesses': nc.get('weaknesses', []),
            'best_balls': nc.get('bestBalls', []),
            'playstyle': nc.get('playstyle', ''),
            'image': existing.get('image') if existing else None,
            'image_mini': existing.get('image_mini') if existing else None,
            'starting_ball_image': existing.get('starting_ball_image') if existing else None,
        }
        result.append(char)

    return sorted(result, key=lambda x: (
        {'S': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4}.get(x.get('tier', ''), 5),
        -x.get('rating', 0)
    ))


def transform_passives(net_passives, existing_passives):
    """Merge passive data."""
    existing_map = {p['name'].lower(): p for p in existing_passives}

    result = []
    # First add all from ballxpit.net
    for i, np_ in enumerate(net_passives, 1):
        name = np_.get('name', '')
        existing = existing_map.get(name.lower())

        passive = {
            'id': existing['id'] if existing else 100 + i,
            'name': name,
            'tier': np_.get('tier', 'C'),
            'icon': np_.get('icon', ''),
            'effect': np_.get('effect', ''),
            'value': np_.get('value', ''),
            'unlock': np_.get('unlock', ''),
            'priority': np_.get('priority', 5),
            'synergy': np_.get('synergy', []),
            'description': np_.get('description', ''),
            'best_for': np_.get('bestFor', ''),
            'rating': np_.get('rating', 0),
            'is_evolution': 0,
            'image': existing.get('image') if existing else None,
        }
        result.append(passive)

    # Add passives from existing data not in new source
    new_names = {p['name'].lower() for p in result}
    for ep in existing_passives:
        if ep['name'].lower() not in new_names:
            ep['source'] = 'wiki_only'
            result.append(ep)

    return sorted(result, key=lambda x: (
        {'S': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4}.get(x.get('tier', ''), 5),
        x.get('name', '')
    ))


def transform_builds(net_builds, existing_builds):
    """Merge build recommendation data."""
    result = []
    for i, nb in enumerate(net_builds, 1):
        cores = nb.get('cores', {})
        build = {
            'id': nb.get('id', i),
            'name': nb.get('name', ''),
            'subtitle': nb.get('subtitle', ''),
            'archetype': nb.get('category', ''),
            'tier': nb.get('tier', 'A'),
            'difficulty': nb.get('difficulty', 'Medium'),
            'dps_rating': nb.get('dps', 5),
            'survival_rating': nb.get('survival', 5),
            'skill_cap': nb.get('skillCap', 5),
            'core_balls': ', '.join(cores.get('balls', [])),
            'core_passives': ', '.join(cores.get('passives', [])),
            'core_buildings': ', '.join(cores.get('buildings', [])),
            'timeline': nb.get('timeline', {}),
            'recommended_characters': ', '.join(nb.get('characters', [])),
            'strengths': ', '.join(nb.get('strengths', [])),
            'weaknesses': ', '.join(nb.get('weaknesses', [])),
            'pros': nb.get('pros', []),
            'cons': nb.get('cons', []),
            'strategy': nb.get('timeline', {}).get('late', ''),
        }
        result.append(build)

    return sorted(result, key=lambda x: (
        {'S+': 0, 'S': 1, 'A+': 2, 'A': 3, 'B': 4, 'C': 5}.get(x.get('tier', ''), 6),
        x.get('name', '')
    ))


def transform_biomes(net_biomes, existing_biomes):
    """Merge biome data."""
    existing_map = {b['name'].lower(): b for b in existing_biomes}

    result = []
    for i, nb in enumerate(net_biomes, 1):
        name = nb.get('name', '')
        existing = existing_map.get(name.lower())

        boss_data = nb.get('boss', {})
        env_data = nb.get('environment', {})

        biome = {
            'id': nb.get('id', i),
            'name': name,
            'subtitle': nb.get('subtitle', ''),
            'difficulty': nb.get('difficulty', 1),
            'avg_time': nb.get('avgTime', ''),
            'recommended_level': nb.get('recommendedLevel', ''),
            'description': env_data.get('description', ''),
            'hazards': env_data.get('hazards', []),
            'advantages': env_data.get('advantages', []),
            'enemies': nb.get('enemies', []),
            'boss_name': boss_data.get('name', ''),
            'boss_hp': boss_data.get('hp', ''),
            'boss_phases': boss_data.get('phases', 1),
            'boss_description': boss_data.get('description', ''),
            'boss_attacks': boss_data.get('attacks', []),
            'boss_strategy': boss_data.get('strategy', ''),
            'boss_weaknesses': boss_data.get('weaknesses', []),
            'boss_rewards': boss_data.get('rewards', []),
            'recommended_builds': nb.get('builds', []),
            'tips': nb.get('tips', []),
            'image': existing.get('image') if existing else None,
        }
        result.append(biome)

    return sorted(result, key=lambda x: x.get('id', 0))


def save_json(data, filename):
    """Save data to JSON file."""
    path = f"{DATA_DIR}/{filename}"
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"   💾 Sauvegardé: {path} ({len(data)} entrées)")


def load_existing(filename):
    """Load existing JSON data."""
    path = f"{DATA_DIR}/{filename}"
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def main():
    print("=" * 60)
    print("🎱 BALL x PIT — Scraper ballxpit.net")
    print("=" * 60)

    # Fetch the bundle
    content = fetch_bundle()

    # Extract raw data from bundle
    raw_balls = extract_balls(content)
    raw_evos = extract_evolutions(content)
    raw_chars = extract_characters(content)
    raw_passives = extract_passives(content)
    raw_builds = extract_builds(content)
    raw_biomes = extract_biomes(content)

    # Load existing data
    print("\n📂 Chargement des données existantes...")
    ex_balls = load_existing('balls.json')
    ex_evos = load_existing('evolutions.json')
    ex_chars = load_existing('characters.json')
    ex_passives = load_existing('passives.json')
    ex_builds = load_existing('builds.json')
    ex_biomes = load_existing('biomes.json')

    # Transform and merge
    print("\n🔄 Fusion et enrichissement des données...")

    if raw_balls:
        balls = transform_balls(raw_balls, ex_balls)
        save_json(balls, 'balls.json')

    if raw_evos:
        evos = transform_evolutions(raw_evos, ex_evos)
        save_json(evos, 'evolutions.json')

    if raw_chars:
        chars = transform_characters(raw_chars, ex_chars)
        save_json(chars, 'characters.json')

    if raw_passives:
        passives = transform_passives(raw_passives, ex_passives)
        save_json(passives, 'passives.json')

    if raw_builds:
        builds = transform_builds(raw_builds, ex_builds)
        save_json(builds, 'builds.json')

    if raw_biomes:
        biomes = transform_biomes(raw_biomes, ex_biomes)
        save_json(biomes, 'biomes.json')

    # Summary
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DU SCRAPING:")
    print(f"   Source: ballxpit.net")
    for fname in ['balls.json', 'evolutions.json', 'characters.json',
                   'passives.json', 'builds.json', 'biomes.json']:
        data = load_existing(fname)
        print(f"   {fname}: {len(data)} entrées")
    print("=" * 60)


if __name__ == "__main__":
    main()
