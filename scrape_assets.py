#!/usr/bin/env python3
"""
Scrape all game images from ballxpit.wiki.gg
Downloads characters, balls, biomes, passives icons.
"""

import os
import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote

BASE_URL = "https://ballxpit.wiki.gg"
HEADERS = {"User-Agent": "BallxBuild-Scraper/1.0 (educational project)"}
IMG_DIR = "web/static/img"

os.makedirs(f"{IMG_DIR}/characters", exist_ok=True)
os.makedirs(f"{IMG_DIR}/balls", exist_ok=True)
os.makedirs(f"{IMG_DIR}/biomes", exist_ok=True)
os.makedirs(f"{IMG_DIR}/passives", exist_ok=True)
os.makedirs(f"{IMG_DIR}/ui", exist_ok=True)


def download_image(url, path):
    """Download an image if it doesn't already exist."""
    if os.path.exists(path):
        return False
    try:
        full_url = urljoin(BASE_URL, url)
        r = requests.get(full_url, headers=HEADERS, timeout=15)
        if r.status_code == 200 and len(r.content) > 100:
            with open(path, "wb") as f:
                f.write(r.content)
            return True
    except Exception as e:
        print(f"  ⚠️ Error downloading {url}: {e}")
    return False


def get_full_size_url(thumb_url):
    """Convert thumbnail URL to full-size URL.
    /images/thumb/Name.png/115px-Name.png -> /images/Name.png
    """
    # Remove query string
    url = thumb_url.split("?")[0]
    match = re.match(r"(/images/)thumb/(.+?)/\d+px-.+", url)
    if match:
        return f"{match.group(1)}{match.group(2)}"
    return url


def sanitize_filename(name):
    """Convert a name to a safe filename."""
    name = unquote(name)
    name = re.sub(r'[^\w\s\-\(\)]', '', name)
    name = name.strip().replace(' ', '_')
    return name.lower()


def scrape_characters():
    """Scrape character portraits."""
    print("\n🎮 Scraping Characters...")
    r = requests.get(f"{BASE_URL}/wiki/Characters", headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")

    count = 0
    for img in soup.select("img"):
        alt = img.get("alt", "")
        src = img.get("src", "") or img.get("data-src", "")
        if not src or "commons.wiki.gg" in src:
            continue

        # Character portraits (large icons)
        if alt.startswith("Icon for The "):
            char_name = alt.replace("Icon for ", "").replace(".png", "")
            filename = sanitize_filename(char_name) + ".png"
            full_url = get_full_size_url(src)
            if download_image(full_url, f"{IMG_DIR}/characters/{filename}"):
                print(f"  ✅ {char_name}")
                count += 1

        # Character mini icons
        elif "_mini" in alt.lower() or "mini.png" in alt.lower():
            char_name = alt.replace(" mini.png", "").replace("_mini.png", "")
            filename = sanitize_filename(char_name) + "_mini.png"
            full_url = get_full_size_url(src)
            if download_image(full_url, f"{IMG_DIR}/characters/{filename}"):
                print(f"  ✅ {char_name} (mini)")
                count += 1

    print(f"  📊 {count} character images downloaded")


def scrape_balls():
    """Scrape ball icons from the Balls page."""
    print("\n🎱 Scraping Balls...")
    r = requests.get(f"{BASE_URL}/wiki/Balls", headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")

    seen = set()
    count = 0
    for img in soup.select("img"):
        alt = img.get("alt", "")
        src = img.get("src", "") or img.get("data-src", "")
        if not src or "commons.wiki.gg" in src:
            continue

        # Ball icons - match .png in alt
        if alt.endswith(".png") and "mini" not in alt.lower():
            ball_name = alt.replace(".png", "")
            if ball_name in seen:
                continue
            seen.add(ball_name)
            filename = sanitize_filename(ball_name) + ".png"
            full_url = get_full_size_url(src)
            if download_image(full_url, f"{IMG_DIR}/balls/{filename}"):
                print(f"  ✅ {ball_name}")
                count += 1

    # Also try individual ball pages for higher quality
    ball_names = [
        "Bleed", "Burn", "Freeze", "Poison", "Iron", "Wind",
        "Lightning", "Dark", "Ghost", "Vampire", "Charm", "Light",
        "Brood_Mother", "Egg_Sac", "Earthquake", "Laser_(Vertical)", "Laser_(Horizontal)",
        "Haemorrhage", "Magma", "Frozen_Flame", "Black_Hole", "Nuclear_Bomb",
        "Satan", "Sandstorm", "Holy_Laser", "The_Sun", "Mosquito_King",
        "Vampire_Lord", "Sacrifice", "Bomb", "Inferno", "Incubus", "Succubus",
        "Spider_Queen", "Lightning_Rod", "Blizzard", "Nosferatu",
        "Leech", "Virus", "Berserk", "Steel", "Swamp"
    ]
    for bn in ball_names:
        filename = sanitize_filename(bn) + ".png"
        path = f"{IMG_DIR}/balls/{filename}"
        if not os.path.exists(path):
            url = f"/images/{bn}.png"
            if download_image(url, path):
                print(f"  ✅ {bn} (direct)")
                count += 1

    print(f"  📊 {count} ball images downloaded")


def scrape_passives():
    """Scrape passive icons from the Passives page."""
    print("\n🛡️ Scraping Passives...")
    r = requests.get(f"{BASE_URL}/wiki/Passives", headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")

    seen = set()
    count = 0
    for img in soup.select("img"):
        alt = img.get("alt", "")
        src = img.get("src", "") or img.get("data-src", "")
        if not src or "commons.wiki.gg" in src:
            continue
        if not alt or alt in seen:
            continue

        # Skip non-passive images
        if any(x in alt.lower() for x in ["icon for the", "mini.png", "menu"]):
            continue

        if alt.endswith(".png"):
            passive_name = alt.replace(".png", "")
            seen.add(alt)
            filename = sanitize_filename(passive_name) + ".png"
            full_url = get_full_size_url(src)
            if download_image(full_url, f"{IMG_DIR}/passives/{filename}"):
                print(f"  ✅ {passive_name}")
                count += 1

    print(f"  📊 {count} passive images downloaded")


def scrape_biomes():
    """Scrape biome images."""
    print("\n🌍 Scraping Biomes...")
    biome_names = [
        "The_BONExYARD", "The_SNOWYxSHORES", "The_LIMINALxDESERT",
        "The_FUNGALxFOREST", "The_GORYxGRASSLANDS", "The_SMOLDERINGxDEPTHS",
        "The_HEAVENLYxGATES", "The_VASTxVOID"
    ]
    count = 0
    for bn in biome_names:
        filename = sanitize_filename(bn) + ".png"
        # Try direct URL
        url = f"/images/{bn}.png"
        if download_image(url, f"{IMG_DIR}/biomes/{filename}"):
            print(f"  ✅ {bn}")
            count += 1

    # Also scrape from Characters page where biome icons appear
    r = requests.get(f"{BASE_URL}/wiki/Characters", headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")
    for img in soup.select("img"):
        alt = img.get("alt", "")
        src = img.get("src", "") or img.get("data-src", "")
        if "BONExYARD" in alt or "SHORES" in alt or "DESERT" in alt or \
           "FOREST" in alt or "GRASSLANDS" in alt or "DEPTHS" in alt or \
           "GATES" in alt or "VOID" in alt:
            biome_name = alt.replace(".png", "")
            filename = sanitize_filename(biome_name) + ".png"
            full_url = get_full_size_url(src)
            if download_image(full_url, f"{IMG_DIR}/biomes/{filename}"):
                print(f"  ✅ {biome_name}")
                count += 1

    print(f"  📊 {count} biome images downloaded")


def scrape_ui():
    """Scrape misc UI images (logo, backgrounds, etc.)."""
    print("\n🎨 Scraping UI assets...")
    r = requests.get(f"{BASE_URL}/wiki/BALL_x_PIT_Wiki", headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.text, "html.parser")

    count = 0
    for img in soup.select("img"):
        alt = img.get("alt", "")
        src = img.get("src", "") or img.get("data-src", "")
        if not src or "commons.wiki.gg" in src:
            continue
        if alt:
            filename = sanitize_filename(alt) + ".png"
            full_url = get_full_size_url(src)
            if download_image(full_url, f"{IMG_DIR}/ui/{filename}"):
                print(f"  ✅ {alt}")
                count += 1

    # Try to get the game logo
    for logo_try in ["BALL_x_PIT_logo.png", "Logo.png", "Game_logo.png", "Wiki-wordmark.png"]:
        if download_image(f"/images/{logo_try}", f"{IMG_DIR}/ui/{logo_try.lower()}"):
            print(f"  ✅ {logo_try}")

    print(f"  📊 {count} UI images downloaded")


if __name__ == "__main__":
    print("=" * 60)
    print("🎱 BALL x PIT — Asset Scraper")
    print("=" * 60)

    scrape_characters()
    time.sleep(0.5)
    scrape_balls()
    time.sleep(0.5)
    scrape_passives()
    time.sleep(0.5)
    scrape_biomes()
    time.sleep(0.5)
    scrape_ui()

    # Summary
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ:")
    for folder in ["characters", "balls", "biomes", "passives", "ui"]:
        path = f"{IMG_DIR}/{folder}"
        files = os.listdir(path) if os.path.exists(path) else []
        print(f"  {folder}: {len(files)} images")
    print("=" * 60)
