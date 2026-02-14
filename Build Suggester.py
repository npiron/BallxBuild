#!/usr/bin/env python3
"""
BALL x PIT — Build Suggester
Interroge la base SQLite pour recommander des builds
basés sur le personnage, le style de jeu, ou le biome ciblé.
"""

import sqlite3
import sys
from pathlib import Path

DB_PATH = Path("ballxpit_knowledge_base.db")


def init_db():
    """Initialize the database from the SQL schema."""
    if not DB_PATH.exists():
        print("⚠️  Base de données non trouvée. Lancez d'abord:")
        print("   sqlite3 ballxpit_knowledge_base.db < ballxpit_knowledge_base.sql")
        sys.exit(1)
    return sqlite3.connect(str(DB_PATH))


def suggest_builds_for_character(conn, character_name: str):
    """Suggest builds for a specific character."""
    cursor = conn.cursor()

    # Find character info
    cursor.execute(
        "SELECT name, starting_ball, ability, tier FROM characters WHERE name LIKE ?",
        (f"%{character_name}%",),
    )
    char = cursor.fetchone()
    if not char:
        print(f"❌ Personnage '{character_name}' non trouvé.")
        print("\nPersonnages disponibles:")
        cursor.execute("SELECT name FROM characters ORDER BY name")
        for row in cursor.fetchall():
            print(f"  • {row[0]}")
        return

    name, starting_ball, ability, tier = char
    print(f"\n{'='*60}")
    print(f"🎮 {name} (Tier {tier})")
    print(f"{'='*60}")
    print(f"📌 Balle de départ: {starting_ball}")
    print(f"⚡ Capacité: {ability or 'Aucune'}")

    # Find recommended builds
    cursor.execute(
        "SELECT name, archetype, tier, core_balls, core_passives, strategy, strengths, weaknesses "
        "FROM builds WHERE recommended_characters LIKE ? ORDER BY "
        "CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 END",
        (f"%{name}%",),
    )
    builds = cursor.fetchall()

    if builds:
        print(f"\n🏆 BUILDS RECOMMANDÉS ({len(builds)} trouvés):")
        for b in builds:
            bname, archetype, btier, balls, passives, strat, strengths, weaknesses = b
            print(f"\n  ┌─ {bname} [{archetype}] (Tier {btier})")
            print(f"  │  🎱 Balles: {balls}")
            print(f"  │  🛡️  Passifs: {passives}")
            print(f"  │  📋 Stratégie: {strat}")
            print(f"  │  ✅ Forces: {strengths}")
            print(f"  │  ❌ Faiblesses: {weaknesses}")
            print(f"  └{'─'*50}")
    else:
        print("\n⚠️  Aucun build spécifique trouvé. Builds universels:")
        cursor.execute(
            "SELECT name, archetype, tier, core_balls, strategy FROM builds "
            "ORDER BY CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 END LIMIT 3"
        )
        for b in cursor.fetchall():
            print(f"  • {b[0]} [{b[1]}] (Tier {b[2]}): {b[3]}")

    # Suggest evolutions from starting ball
    print(f"\n🔬 ÉVOLUTIONS POSSIBLES depuis {starting_ball}:")
    cursor.execute(
        "SELECT result_ball, ingredient_1, ingredient_2, tier "
        "FROM evolutions WHERE ingredient_1 = ? OR ingredient_2 = ? "
        "ORDER BY CASE tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 END",
        (starting_ball, starting_ball),
    )
    evos = cursor.fetchall()
    for e in evos:
        result, ing1, ing2, etier = e
        other = ing2 if ing1 == starting_ball else ing1
        print(f"  [{etier}] {starting_ball} + {other} → {result}")


def suggest_build_by_style(conn, style: str):
    """Suggest builds by playstyle archetype."""
    cursor = conn.cursor()
    style_map = {
        "aoe": "AOE Status",
        "status": "AOE Status",
        "sustain": "Sustain",
        "tank": "Sustain",
        "control": "Control",
        "freeze": "Control",
        "boss": "Boss Killer",
        "dps": "Boss Killer",
        "minion": "Minion Swarm",
        "swarm": "Minion Swarm",
        "hybrid": "Hybrid",
        "laser": "Hybrid",
    }

    archetype = style_map.get(style.lower())
    if not archetype:
        print(f"❌ Style '{style}' non reconnu.")
        print(f"   Styles disponibles: {', '.join(sorted(set(style_map.keys())))}")
        return

    cursor.execute(
        "SELECT name, tier, recommended_characters, core_balls, core_passives, strategy "
        "FROM builds WHERE archetype = ?",
        (archetype,),
    )
    builds = cursor.fetchall()

    print(f"\n{'='*60}")
    print(f"🎯 Builds style: {archetype}")
    print(f"{'='*60}")

    for b in builds:
        bname, btier, chars, balls, passives, strat = b
        print(f"\n  🏆 {bname} (Tier {btier})")
        print(f"  👤 Personnages: {chars}")
        print(f"  🎱 Balles: {balls}")
        print(f"  🛡️  Passifs: {passives}")
        print(f"  📋 {strat}")


def show_evolution_tree(conn, ball_name: str):
    """Show the full evolution tree for a ball."""
    cursor = conn.cursor()

    print(f"\n{'='*60}")
    print(f"🔬 Arbre d'évolution: {ball_name}")
    print(f"{'='*60}")

    # What can this ball become?
    cursor.execute(
        "SELECT result_ball, ingredient_1, ingredient_2, tier FROM evolutions "
        "WHERE ingredient_1 LIKE ? OR ingredient_2 LIKE ?",
        (f"%{ball_name}%", f"%{ball_name}%"),
    )
    evos = cursor.fetchall()

    if evos:
        print(f"\n  📤 {ball_name} peut évoluer en:")
        for result, ing1, ing2, tier in evos:
            other = ing2 if ball_name.lower() in ing1.lower() else ing1
            cursor.execute(
                "SELECT effect FROM balls WHERE name = ?", (result,)
            )
            effect_row = cursor.fetchone()
            effect = effect_row[0] if effect_row else "?"
            print(f"    [{tier}] + {other} → {result}")
            print(f"         └ {effect}")
    else:
        print(f"  Aucune évolution trouvée pour '{ball_name}'")

    # Is this ball itself an evolution result?
    cursor.execute(
        "SELECT ingredient_1, ingredient_2, tier FROM evolutions WHERE result_ball LIKE ?",
        (f"%{ball_name}%",),
    )
    recipe = cursor.fetchone()
    if recipe:
        print(f"\n  📥 Recette pour obtenir {ball_name}:")
        print(f"    {recipe[0]} + {recipe[1]} (Tier {recipe[2]})")


def list_all(conn, entity: str):
    """List all entities of a given type."""
    cursor = conn.cursor()
    tables = {
        "characters": ("characters", "name, starting_ball, tier"),
        "balls": ("balls", "name, rarity, base_damage, effect"),
        "evolutions": ("evolutions", "result_ball, ingredient_1, ingredient_2, tier"),
        "passives": ("passives", "name, effect, is_evolution"),
        "biomes": ("biomes", "name, boss_name, unlock_requirement"),
        "buildings": ("buildings", "name, category, effect"),
        "builds": ("builds", "name, archetype, tier, recommended_characters"),
    }

    if entity not in tables:
        print(f"❌ Type '{entity}' inconnu. Disponibles: {', '.join(tables.keys())}")
        return

    table, cols = tables[entity]
    cursor.execute(f"SELECT {cols} FROM {table} ORDER BY 1")
    rows = cursor.fetchall()

    print(f"\n{'='*60}")
    print(f"📋 Tous les {entity} ({len(rows)} entrées)")
    print(f"{'='*60}")

    col_names = [c.strip() for c in cols.split(",")]
    for row in rows:
        parts = [f"{col_names[i]}: {row[i]}" for i in range(len(row))]
        print(f"  • {' | '.join(parts)}")


def interactive_menu():
    """Main interactive menu."""
    conn = init_db()

    print("""
╔══════════════════════════════════════════════╗
║   🎱 BALL x PIT — Build Suggester v1.0      ║
║   Base de connaissances & aide aux builds    ║
╚══════════════════════════════════════════════╝
    """)

    while True:
        print("\n📌 COMMANDES:")
        print("  1. build <personnage>  — Builds recommandés pour un personnage")
        print("  2. style <style>       — Builds par style (aoe/sustain/control/boss/minion)")
        print("  3. evo <balle>         — Arbre d'évolution d'une balle")
        print("  4. list <type>         — Lister (characters/balls/evolutions/passives/biomes/buildings/builds)")
        print("  5. quit                — Quitter")

        try:
            raw = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not raw:
            continue

        parts = raw.split(maxsplit=1)
        cmd = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""

        if cmd in ("quit", "exit", "q"):
            print("👋 À plus dans le Pit!")
            break
        elif cmd == "build":
            suggest_builds_for_character(conn, arg)
        elif cmd == "style":
            suggest_build_by_style(conn, arg)
        elif cmd == "evo":
            show_evolution_tree(conn, arg)
        elif cmd == "list":
            list_all(conn, arg)
        else:
            print(f"❓ Commande inconnue: {cmd}")

    conn.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI mode: python build_suggester.py build "Itchy Finger"
        conn = init_db()
        cmd = sys.argv[1].lower()
        arg = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""

        if cmd == "build":
            suggest_builds_for_character(conn, arg)
        elif cmd == "style":
            suggest_build_by_style(conn, arg)
        elif cmd == "evo":
            show_evolution_tree(conn, arg)
        elif cmd == "list":
            list_all(conn, arg)
        conn.close()
    else:
        interactive_menu()