# 🎱 BALL x PIT — Build Suggester

Moteur de suggestion de builds pour **Ball x Pit**, déployé en site statique sur GitHub Pages.

## 🌐 Site

Le site tourne 100 % côté client (pas de backend) et est déployé automatiquement depuis `docs/` via GitHub Pages.

**→ [Accéder au site](https://npiron.github.io/BallxBuild/)**

## 📁 Structure

```
docs/               ← Site statique (GitHub Pages)
  index.html
  css/style.css
  js/app.js         ← Moteur de suggestion (1800+ lignes)
  data/             ← Données JSON (balls, evolutions, characters, passives, builds, biomes)
  img/              ← Assets visuels

scrape_ballxpit_net.py   ← Scraper de données depuis ballxpit.net
scrape_assets.py         ← Scraper d'images depuis le wiki
merge_wiki_data.py       ← Fusion des données wiki → JSON
SOURCES.md               ← Liste des sources internet consultées
```

## 🌐 Sources de données

Les données proviennent principalement de **[ballxpit.net](https://ballxpit.net)** et **[ballxpit.wiki.gg](https://ballxpit.wiki.gg)**.
D'autres ressources communautaires (Steam, IGN, Dexerto, Game Rant…) sont référencées dans le fichier **[SOURCES.md](SOURCES.md)**.

## ⚙️ Fonctionnalités du moteur

- Sélection de **2 personnages** (max), biome, balles et passifs
- Scoring multi-critères des builds (10+ facteurs)
- Analyse des effets de statut et synergies de biome
- Pathfinding vers les évolutions S+/S
- Synergies passifs ↔ balles (12 familles)
- Scoring dynamique par personnage (mécaniques wiki)
- Graphe interactif d'évolutions
- Suggestions de prochaines balles à récupérer