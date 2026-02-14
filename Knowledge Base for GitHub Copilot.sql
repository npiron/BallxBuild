-- ============================================
-- BALL x PIT — Knowledge Base Schema
-- Base de données relationnelle pour le wiki
-- ============================================

-- ==========================================
-- TABLE: characters
-- ==========================================
CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    starting_ball TEXT NOT NULL,
    ability TEXT,
    unlock_method TEXT,
    unlock_building TEXT,
    blueprint_location TEXT,
    tier TEXT CHECK(tier IN ('S', 'A', 'B', 'C', 'D')),
    notes TEXT
);

INSERT INTO characters (name, starting_ball, ability, unlock_method, unlock_building, blueprint_location, tier) VALUES
('The Warrior', 'Bleed', NULL, 'Default starter', NULL, NULL, 'B'),
('The Itchy Finger', 'Burn', 'Double shot speed, continuous autofire, full speed movement while firing, scattered aim', 'Build Sheriff''s Office', 'Sheriff''s Office', 'BONExYARD', 'S'),
('The Repentant', 'Freeze', 'Ball deals 5% more damage per bounce; pierces on return after hitting back wall', 'Build Haunted House', 'Haunted House', 'BONExYARD', 'S'),
('The Cohabitants', 'Brood Mother', 'Fires two mirrored balls per shot, each deals half damage', 'Build Cozy Home', 'Cozy Home', 'BONExYARD', 'A'),
('The Embedded', 'Poison', 'All balls pierce enemies until hitting side walls', 'Build Veteran''s Hut', 'Veteran''s Hut', 'SNOWYxSHORES', 'A'),
('The Cogitator', 'Laser (Vertical)', 'Auto-pilot: character chooses all upgrades, balls, and evolutions automatically', 'Build Villa', 'Villa', 'SNOWYxSHORES', 'B'),
('The Shade', 'Dark', 'Balls launch from back of field; +10% base critical chance', 'Build associated housing', NULL, 'LIMINALxDESERT', 'A'),
('The Empty Nester', 'Ghost', 'Shoots multiple special balls per shot; no baby ball mechanic', 'Build Single Family Home', 'Single Family Home', 'SNOWYxSHORES', 'B'),
('The Shieldbearer', 'Iron', 'Large shield; balls bounced off shield gain +100% damage', 'Build associated housing', NULL, 'FUNGALxFOREST', 'S'),
('The Spendthrift', 'Vampire', 'Fires all balls at once in a wide arc (AOE)', 'Build associated housing', NULL, 'FUNGALxFOREST', 'A'),
('The Flagellant', 'Egg Sac', 'Balls interact with bottom of screen like a normal bounce', 'Build associated housing', NULL, 'GORYxGRASSLANDS', 'B'),
('The Juggler', 'Lightning', 'Balls lobbed in an arc, only bounce after hitting ground', 'Build associated housing', NULL, 'GORYxGRASSLANDS', 'B'),
('The Tactician', 'Iron', 'Converts combat to turn-based sequences', 'Build associated housing', NULL, 'SMOLDERINGxDEPTHS', 'B'),
('The Radical', 'Wind', 'Fully automatic play and upgrades', 'Build Campground', 'Campground', 'SMOLDERINGxDEPTHS', 'B'),
('The Physicist', 'Light', 'Balls affected by gravity, curving toward back of screen', 'Build associated housing', NULL, 'HEAVENLYxGATES', 'B'),
('The False Messiah', 'Unknown', 'Twitch integration exclusive abilities', 'Activate Twitch extension', NULL, NULL, 'C');

-- ==========================================
-- TABLE: balls
-- ==========================================
CREATE TABLE balls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    rarity TEXT CHECK(rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary')),
    base_damage INTEGER,
    speed TEXT CHECK(speed IN ('Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast')),
    effect TEXT,
    is_base_ball BOOLEAN DEFAULT 0,
    is_evolution BOOLEAN DEFAULT 0,
    notes TEXT
);

-- Base balls
INSERT INTO balls (name, rarity, base_damage, speed, effect, is_base_ball) VALUES
('Bleed', 'Common', 10, 'Medium', 'Applies bleed stacks dealing damage over time', 1),
('Burn', 'Common', 15, 'Fast', 'Burn DoT (5 dmg/sec)', 1),
('Freeze', 'Common', 12, 'Slow', '4% chance to freeze for 5s; frozen enemies take +25% damage', 1),
('Poison', 'Common', 10, 'Medium', 'Applies poison stacks dealing periodic damage', 1),
('Iron', 'Common', 20, 'Slow', 'High base damage, slower speed', 1),
('Wind', 'Common', 8, 'Very Fast', 'Knockback effect on hit', 1),
('Lightning', 'Uncommon', 25, 'Fast', 'Chain damage to 3 nearby targets', 1),
('Dark', 'Uncommon', 18, 'Medium', 'Applies curse stacks; cursed enemies take bonus damage', 1),
('Ghost', 'Uncommon', 18, 'Fast', 'Phases through walls and obstacles', 1),
('Vampire', 'Rare', 20, 'Medium', 'Lifesteal 15% of damage dealt', 1),
('Charm', 'Rare', 5, 'Slow', 'Chance to convert enemies to fight for you', 1),
('Light', 'Uncommon', 15, 'Fast', 'Blinds enemies reducing their accuracy', 1),
('Brood Mother', 'Uncommon', 12, 'Medium', '25% chance to spawn a baby ball on hit', 1),
('Egg Sac', 'Uncommon', 8, 'Medium', 'Explodes into baby balls on hit', 1),
('Earthquake', 'Uncommon', 20, 'Slow', 'Ground AOE damage on impact', 1),
('Laser (Vertical)', 'Uncommon', 15, 'Fast', 'Deals damage to all enemies in a column', 1),
('Laser (Horizontal)', 'Uncommon', 15, 'Fast', 'Deals damage to all enemies in a row', 1);

-- Evolved balls
INSERT INTO balls (name, rarity, base_damage, speed, effect, is_evolution) VALUES
('Vampire Lord', 'Rare', 30, 'Medium', 'Each hit applies 3 bleed stacks; at 10+ stacks consumes them to heal 1 HP', 1),
('Leech', 'Rare', 25, 'Medium', 'Attaches leeches adding 2 bleed stacks/sec (up to 24 stacks)', 1),
('Virus', 'Rare', 20, 'Fast', 'Applies disease that deals damage and spreads to nearby enemies', 1),
('Berserk', 'Rare', 15, 'Medium', '30% chance to make enemies berserk for 6s, attacking adjacent units', 1),
('Sacrifice', 'Rare', 20, 'Medium', 'Inflicts 4 bleed stacks and curses; cursed enemies take bonus damage', 1),
('Haemorrhage', 'Epic', 25, 'Medium', 'Inflicts 3 bleed stacks; at 12+ consumes all for 20% target HP damage', 1),
('Bomb', 'Epic', 40, 'Slow', 'Explodes on impact for 150-300 AOE damage; 3s cooldown', 1),
('Magma', 'Epic', 40, 'Slow', 'Spawns lava pools dealing burn and DOT', 1),
('Frozen Flame', 'Epic', 35, 'Medium', 'Stacks burn and freeze DOTs (frostburn)', 1),
('Inferno', 'Epic', 30, 'Medium', 'Burns all enemies in 2-tile radius each second', 1),
('Incubus', 'Epic', 35, 'Medium', 'Chance to charm; charmed enemies curse others for massive damage', 1),
('Succubus', 'Epic', 30, 'Medium', 'Chance to charm and heal on hitting charmed enemies', 1),
('Black Hole', 'Epic', 60, 'Very Slow', 'Instantly kills first non-boss enemy then destroys itself', 1),
('Nuclear Bomb', 'Legendary', 500, 'Very Slow', 'Screen-wide explosion with residual poison', 1),
('Satan', 'Legendary', 200, 'Fast', 'Multi-stage ultra DPS final evolution', 1),
('Nosferatu', 'Legendary', 150, 'Medium', 'Complex multi-stage evolution with enormous effects', 1),
('Sandstorm', 'Rare', 30, 'Fast', 'Wide multi-hit pass-through; blinds enemies', 1),
('Blizzard', 'Rare', 25, 'Medium', 'Large AOE freeze for control', 1),
('Holy Laser', 'Epic', 40, 'Fast', 'Widest coverage with consistent on-hit synergy', 1),
('The Sun', 'Epic', 45, 'Medium', 'Radial AOE burn damage', 1),
('Mosquito King', 'Epic', 35, 'Medium', 'Health-draining swarms; huge sustain', 1),
('Spider Queen', 'Epic', 30, 'Medium', 'Minion spawn for field control', 1),
('Lightning Rod', 'Rare', 30, 'Fast', 'Passive multi-directional zapping', 1),
('Steel', 'Rare', 40, 'Slow', 'Double damage but slower; damage stacks per hit', 1),
('Swamp', 'Rare', 20, 'Medium', 'Tar blobs that slow and poison enemies', 1);

-- ==========================================
-- TABLE: evolutions (fusion recipes)
-- ==========================================
CREATE TABLE evolutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_ball TEXT NOT NULL,
    ingredient_1 TEXT NOT NULL,
    ingredient_2 TEXT NOT NULL,
    tier TEXT CHECK(tier IN ('S', 'A', 'B', 'C', 'D')),
    notes TEXT,
    FOREIGN KEY (result_ball) REFERENCES balls(name),
    FOREIGN KEY (ingredient_1) REFERENCES balls(name),
    FOREIGN KEY (ingredient_2) REFERENCES balls(name)
);

INSERT INTO evolutions (result_ball, ingredient_1, ingredient_2, tier, notes) VALUES
('Vampire Lord', 'Bleed', 'Vampire', 'A', 'Strong sustain option'),
('Leech', 'Bleed', 'Brood Mother', 'B', 'Sustained bleed stacking'),
('Virus', 'Bleed', 'Poison', 'B', 'Disease spreads to nearby enemies'),
('Berserk', 'Bleed', 'Charm', 'B', 'Crowd disruption'),
('Sacrifice', 'Bleed', 'Dark', 'A', 'Curse + bleed synergy'),
('Haemorrhage', 'Bleed', 'Iron', 'S', 'Supreme boss-killer: 20% HP on bleed consume'),
('Bomb', 'Burn', 'Iron', 'A', 'AOE explosion with cooldown'),
('Magma', 'Burn', 'Earthquake', 'S', 'Persistent ground DPS, snowballs with burn relics'),
('Frozen Flame', 'Burn', 'Freeze', 'S', 'Frostburn melts tanky enemies'),
('Inferno', 'Burn', 'Wind', 'A', 'Radial AOE burn'),
('Incubus', 'Charm', 'Dark', 'A', 'Charm into curse chain'),
('Succubus', 'Charm', 'Vampire', 'A', 'Charm + heal synergy'),
('Black Hole', 'Dark', 'The Sun', 'S', 'Instant kill for non-boss enemies'),
('Nuclear Bomb', 'Bomb', 'Poison', 'S', 'Screen-wide devastation'),
('Satan', 'Incubus', 'Succubus', 'S', 'Ultimate multi-stage evolution'),
('Nosferatu', 'Vampire Lord', 'Mosquito King', 'S', 'Requires Spider Queen — complex multi-stage'),
('Sandstorm', 'Earthquake', 'Wind', 'S', 'Wide AOE + blind'),
('Blizzard', 'Freeze', 'Wind', 'A', 'Large freeze AOE'),
('Holy Laser', 'Laser (Vertical)', 'Laser (Horizontal)', 'S', 'Widest coverage, on-hit synergies'),
('The Sun', 'Burn', 'Light', 'S', 'Core ingredient for Black Hole'),
('Mosquito King', 'Brood Mother', 'Vampire', 'S', 'Sustain swarm'),
('Spider Queen', 'Brood Mother', 'Egg Sac', 'A', 'Minion field control'),
('Lightning Rod', 'Iron', 'Lightning', 'A', 'Multi-directional zapping'),
('Steel', 'Iron', 'Earthquake', 'B', 'Slow but massive damage stacking'),
('Swamp', 'Earthquake', 'Poison', 'B', 'Slow + poison control');

-- ==========================================
-- TABLE: passives
-- ==========================================
CREATE TABLE passives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    max_level INTEGER DEFAULT 3,
    effect TEXT NOT NULL,
    is_evolution BOOLEAN DEFAULT 0,
    unlock_condition TEXT,
    notes TEXT
);

INSERT INTO passives (name, effect, is_evolution, unlock_condition) VALUES
('Archer''s Effigy', 'Every 7-12 rows, spawn a stone archer (160 HP) that shoots arrows dealing 10-20 damage', 0, NULL),
('Artificial Heart', 'Friendly pieces gain 100% more health', 0, NULL),
('Baby Rattle', 'Gain 1.5x baby balls but aim becomes scattered', 0, NULL),
('Bandage Roll', 'Shoot 1-2 baby balls each time you are healed', 0, NULL),
('Bottled Tornado', 'When catching a special ball, auto-shoot 1-3 baby balls randomly', 0, NULL),
('Breastplate', 'Decrease damage taken by 10%', 0, NULL),
('Crown of Thorns', 'Destroy the two nearest enemies when hit from close range', 0, NULL),
('Cursed Elixir', 'When a poisoned enemy dies, 10% chance to return as zombie', 0, NULL),
('Deadeye''s Amulet', 'Critical hits deal 10-15 bonus damage', 0, NULL),
('Diamond Hilted Dagger', 'Increase crit chance to 20% when hitting front enemies', 0, NULL),
('Dynamite', 'Every 5-10 rows, spawns an enemy with dynamite', 0, NULL),
('Emerald Hilted Dagger', 'Increase crit chance to 20% hitting enemies on their right', 0, NULL),
('Ethereal Cloak', 'Balls phase through enemies, +25% bonus damage until back wall', 0, NULL),
('Everflowing Goblet', 'Heal past max HP at 20% efficiency', 0, NULL),
('Eye of the Beholder', '10% chance to dodge incoming attacks', 0, NULL),
('Fleet Feet', '+10% movement speed, move at full speed while shooting', 0, NULL),
('Hourglass', 'Balls deal 150% damage but decay 30% per bounce', 0, NULL),
('Magnet', 'Increased pickup range for items and balls', 0, NULL),
('Radiant Feather', '+20% ball launch speed, minor knockback per shot', 0, NULL),
('Ruby Hilted Dagger', '15% crit chance when hitting back enemies', 0, NULL),
('Sapphire Hilted Dagger', '15% crit chance when hitting left enemies', 0, NULL),
('Turret', 'Companion turret shoots baby balls at enemies', 0, NULL),
('Upturned Hatchet', '+80% damage after hitting back wall, otherwise -20%', 0, NULL);

-- Evolution passives
INSERT INTO passives (name, effect, is_evolution) VALUES
('Cornucopia', 'Baby Rattle + War Horn: Extra baby ball chance on spawn', 1),
('Deadeye''s Cross', 'All 4 Hilted Daggers combined: 60% crit chance', 1),
('Gracious Impaler', 'Deadeye''s Amulet + Reacher''s Spear: 5% chance to insta-kill on crit', 1),
('Odiferous Shell', 'Breastplate + Wretched Onion: Improved armor + debuff resistance', 1),
('Phantom Regalia', 'Ethereal Cloak + Ghostly Corset: Phase through enemies +50% damage', 1),
('Soul Reaver', 'Everflowing Goblet + Vampiric Sword: Kill heals including over max HP', 1),
('Tormentor''s Mask', 'Crown of Thorns + Spiked Collar: 10% chance enemies instantly die on detection', 1),
('Wings of the Anointed', 'Fleet Feet + Radiant Feather: +40% ball speed, +20% move speed, ground hazard immunity', 1);

-- ==========================================
-- TABLE: biomes (levels)
-- ==========================================
CREATE TABLE biomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    unlock_order INTEGER NOT NULL,
    unlock_requirement TEXT,
    boss_name TEXT,
    unique_blueprints TEXT,
    notes TEXT
);

INSERT INTO biomes (name, unlock_order, unlock_requirement, boss_name, notes) VALUES
('BONExYARD', 1, 'Complete tutorial', 'Skeleton King', 'First biome, basic enemies'),
('SNOWYxSHORES', 2, 'Complete BONExYARD with 2 different characters', 'Icebound Queen', 'Ice-themed enemies'),
('LIMINALxDESERT', 3, 'Complete SNOWYxSHORES with 2 new characters', 'Twisted Serpent', 'Desert hazards'),
('FUNGALxFOREST', 4, 'Complete LIMINALxDESERT with 2 new characters', 'Shroom Swarm', 'Mushroom enemies'),
('GORYxGRASSLANDS', 5, 'Complete FUNGALxFOREST with 3 different characters', 'Sabertooth', 'Open field combat'),
('SMOLDERINGxDEPTHS', 6, 'Complete GORYxGRASSLANDS with 4 new characters', 'Dragon Prince', 'Fire-themed deep levels'),
('HEAVENLYxGATES', 7, 'Complete SMOLDERINGxDEPTHS with 4 different characters', 'Lord of Owls', 'Divine enemies'),
('VASTxVOID', 8, 'Clear all previous biomes + collect sufficient gears', 'Final Boss', 'Ultimate challenge zone');

-- ==========================================
-- TABLE: buildings
-- ==========================================
CREATE TABLE buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT CHECK(category IN ('Resource', 'Utility', 'Training', 'Battle', 'Housing', 'Special')),
    effect TEXT,
    unlocks_character TEXT,
    resource_cost TEXT,
    blueprint_location TEXT,
    notes TEXT
);

INSERT INTO buildings (name, category, effect, unlocks_character, resource_cost, blueprint_location) VALUES
-- Resource buildings
('Farm', 'Resource', 'Harvest 1 Wheat from adjacent fields every 6 min', NULL, '100 Gold', NULL),
('Gatherer''s Hut', 'Resource', 'Harvest in a direction every 10 min', NULL, '50 Gold, 5 Wheat, 2 Wood', NULL),
('Gold Mine', 'Resource', 'Mine 1-2 Gold per bounce (up to 100/run)', NULL, '10 Wood, 12 Stone', NULL),
('Lumberyard', 'Resource', 'Harvest 1 Wood from adjacent forests every 9 min', NULL, '75 Gold, 5 Wheat', NULL),
('Stone Mine', 'Resource', 'Harvest 1 Stone from adjacent boulders every 10 min', NULL, '100 Gold, 5 Wheat', NULL),
('Market', 'Resource', 'Exchange Gold for other resources', NULL, '500 Gold', NULL),
-- Utility buildings
('Spa', 'Utility', 'Spend Gold to harvest multiple times instantly', NULL, '500 Gold, 10 Wheat, 2 Stone', NULL),
('Watch Tower', 'Utility', 'Increases harvest clock by 2 seconds', NULL, '20 Wheat, 10 Gold', NULL),
('Worker''s Guild', 'Utility', 'Workers gather for up to 24 hours offline (50% slower)', NULL, NULL, NULL),
-- Training buildings
('Abbey', 'Training', '+5% XP gain', NULL, '300 Gold, 10 Stone', NULL),
('Alchemist', 'Training', 'Increases Endurance scaling', NULL, '100 Gold, 15 Wood, 5 Stone', NULL),
('Archery Range', 'Training', 'Increases Dexterity scaling', NULL, '12 Wheat, 12 Wood', NULL),
('Barracks', 'Training', '+1 Strength to all characters', NULL, '2 Stone, 3 Wood', NULL),
('Clinic', 'Training', '+1 Endurance to all characters', NULL, '3 Stone, 2 Wheat', NULL),
('Gunsmith', 'Training', '+1 Dexterity', NULL, '2 Wheat, 2 Wood', NULL),
('Shoemaker', 'Training', '+1 Speed', NULL, '3 Wheat, 1 Gold', NULL),
('University', 'Training', 'Increases Intelligence scaling', NULL, '200 Gold, 20 Wheat, 5 Stone', NULL),
-- Battle buildings
('Antique Shop', 'Battle', 'Begin each battle with a passive choice', NULL, '1000 Gold, 40 Wood', NULL),
('Bag Maker', 'Battle', 'Adds 1 ball slot', NULL, '5000 Gold, 100 Wheat, 30 Stone', NULL),
('Bank', 'Battle', '+5% Gold found in battles', NULL, '20 Wood, 20 Stone', NULL),
('Exorcist', 'Battle', 'Banish upgrades when leveling (up to 2 times)', NULL, '50 Gold, 20 Stone', NULL),
('Gambler''s Den', 'Battle', '2 free level-up rerolls per battle', NULL, '50 Gold, 5 Stone', NULL),
('Relic Collector', 'Battle', 'New passives start at level 2', NULL, NULL, NULL),
-- Housing buildings
('Sheriff''s Office', 'Housing', 'Unlocks The Itchy Finger', 'The Itchy Finger', '5 Wood', 'BONExYARD'),
('Haunted House', 'Housing', 'Unlocks The Repentant', 'The Repentant', '5 Wood', 'BONExYARD'),
('Cozy Home', 'Housing', 'Unlocks The Cohabitants', 'The Cohabitants', '20 Wheat, 5 Wood', 'BONExYARD'),
('Veteran''s Hut', 'Housing', 'Unlocks The Embedded', 'The Embedded', NULL, 'SNOWYxSHORES'),
('Single Family Home', 'Housing', 'Unlocks The Empty Nester', 'The Empty Nester', '50 Gold, 30 Wood', 'SNOWYxSHORES'),
('Villa', 'Housing', 'Unlocks The Cogitator', 'The Cogitator', NULL, 'SNOWYxSHORES'),
('Campground', 'Housing', 'Unlocks The Radical', 'The Radical', '120 Wheat, 20 Wood', 'SMOLDERINGxDEPTHS');

-- ==========================================
-- TABLE: builds (recommended builds / meta)
-- ==========================================
CREATE TABLE builds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    archetype TEXT CHECK(archetype IN ('AOE Status', 'Sustain', 'Control', 'Boss Killer', 'Minion Swarm', 'Hybrid')),
    tier TEXT CHECK(tier IN ('S', 'A', 'B')),
    recommended_characters TEXT,
    core_balls TEXT NOT NULL,
    core_passives TEXT,
    strategy TEXT,
    strengths TEXT,
    weaknesses TEXT
);

INSERT INTO builds (name, archetype, tier, recommended_characters, core_balls, core_passives, strategy, strengths, weaknesses) VALUES
('Murder Build', 'AOE Status', 'S', 'The Itchy Finger, The Shieldbearer, The Repentant',
 'Magma, Black Hole, Mosquito King, Haemorrhage',
 'Crown of Thorns, Hourglass, Ethereal Cloak',
 'Stack AOE status effects to clear screens. Magma + Black Hole for wave clear, Haemorrhage for boss phases.',
 'Best overall clear speed, works on all biomes, scales infinitely',
 'Requires specific evolution paths, weak before first evolution'),

('Control Build', 'Control', 'S', 'The Repentant, The Shieldbearer',
 'Sandstorm, Frozen Flame, Blizzard',
 'Eye of the Beholder, Breastplate, Fleet Feet',
 'Lock down enemies with freeze/blind. Frozen Flame melts tanky targets while Sandstorm blinds crowds.',
 'Excellent survivability, great for learning, consistent',
 'Slower kill speed vs pure DPS builds'),

('Boss Melter', 'Boss Killer', 'S', 'The Itchy Finger, The Shade',
 'Haemorrhage, Nuclear Bomb, The Sun',
 'Deadeye''s Amulet, Diamond Hilted Dagger, Hourglass',
 'Stack bleed via Haemorrhage for 20% HP chunks on bosses. Nuclear Bomb as emergency clear. Sun for sustained AOE.',
 'Fastest boss kills in game, melts health bars',
 'Weak wave clear, needs team support passives for mobs'),

('Sustain Tank', 'Sustain', 'A', 'The Itchy Finger, The Spendthrift',
 'Mosquito King, Vampire Lord, Spider Queen',
 'Everflowing Goblet, Bandage Roll, Artificial Heart',
 'Never die. Mosquito King + Vampire Lord provide constant healing while Spider Queen adds minions.',
 'Nearly unkillable, excellent for deep/farming runs',
 'Kill speed can be slow, bad vs time-sensitive content'),

('Swarm Master', 'Minion Swarm', 'A', 'The Cohabitants, The Flagellant',
 'Spider Queen, Mosquito King, Nosferatu',
 'Baby Rattle, Turret, Archer''s Effigy',
 'Overwhelm the field with minions. Every hit spawns more allies. Nosferatu is the ultimate form.',
 'Incredible screen presence, auto-pilot friendly',
 'Requires late-game evolutions, weak early game'),

('Laser Grid', 'Hybrid', 'A', 'The Cogitator, The Repentant',
 'Holy Laser, Frozen Flame, The Sun',
 'Ethereal Cloak, Radiant Feather, Magnet',
 'Holy Laser covers the entire field. Add status effects for passive damage while lasers clean up.',
 'Full field coverage, consistent damage, good at all stages',
 'Less burst than specialized builds');

-- ==========================================
-- VIEWS for build suggestions
-- ==========================================

-- View: Find best builds for a given character
CREATE VIEW v_builds_by_character AS
SELECT
    b.name AS build_name,
    b.archetype,
    b.tier,
    b.recommended_characters,
    b.core_balls,
    b.core_passives,
    b.strategy
FROM builds b
ORDER BY
    CASE b.tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 END;

-- View: Find evolution path for a target ball
CREATE VIEW v_evolution_paths AS
SELECT
    e.result_ball,
    e.ingredient_1,
    e.ingredient_2,
    e.tier AS evolution_tier,
    b.rarity,
    b.effect AS result_effect
FROM evolutions e
JOIN balls b ON b.name = e.result_ball
ORDER BY
    CASE e.tier WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 WHEN 'C' THEN 4 END;

-- View: Character + their starting ball + recommended builds
CREATE VIEW v_character_builds AS
SELECT
    c.name AS character_name,
    c.starting_ball,
    c.ability,
    c.tier AS character_tier,
    b.name AS build_name,
    b.archetype,
    b.tier AS build_tier,
    b.core_balls,
    b.strategy
FROM characters c
LEFT JOIN builds b ON b.recommended_characters LIKE '%' || c.name || '%'
ORDER BY c.name;