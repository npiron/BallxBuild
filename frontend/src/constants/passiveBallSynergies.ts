export interface PassiveBallSynergyDef {
  passives: string[]
  balls: string[]
  effects: string[]
  reason: string
  tier: string
  anyBall?: boolean
}

export const PASSIVE_BALL_SYNERGIES: PassiveBallSynergyDef[] = [
  {
    passives: ['Baby Rattle', 'War Horn', 'Iron Onesie', 'Cornucopia'],
    balls: ['Brood Mother', 'Egg Sac', 'Catapult', 'Shotgun', 'Maggot', 'Voluptuous Egg Sac', 'Spider Queen'],
    effects: ['Baby Ball Spawn'],
    reason: 'Synergie Baby Balls : plus de baby balls = plus de dégâts',
    tier: 'S',
  },
  {
    passives: ['Diamond Hilted Dagger', 'Sapphire Hilted Dagger', 'Ruby Hilted Dagger', 'Emerald Hilted Dagger', 'Deadeye\'s Amulet', 'Deadeye\'s Cross', 'Gracious Impaler', 'Deadeye\'s Impaler'],
    balls: [],
    effects: [],
    reason: 'Synergie Critique : stack les daggers pour Deadeye\'s Cross',
    tier: 'A',
    anyBall: true,
  },
  {
    passives: ['Cursed Elixir'],
    balls: ['Poison', 'Noxious', 'Brimstone', 'Swamp', 'Virus'],
    effects: ['Poison'],
    reason: 'Cursed Elixir : ennemis empoisonnés deviennent des zombies',
    tier: 'A',
  },
  {
    passives: ['Midnight Oil'],
    balls: ['Burn', 'Inferno', 'Magma', 'Sun', 'Brimstone', 'Fireworks', 'Frozen Flame'],
    effects: ['Burn'],
    reason: 'Midnight Oil : bonus +10-20 dmg feu sur ennemis en feu',
    tier: 'A',
  },
  {
    passives: ['Ethereal Cloak', 'Ghostly Corset', 'Phantom Regalia'],
    balls: ['Ghost', 'Phantom', 'Wraith', 'Assassin'],
    effects: [],
    reason: 'Synergie Phase : les balles traversent les ennemis avec bonus dmg',
    tier: 'A',
  },
  {
    passives: ['Vampiric Sword', 'Soul Reaver', 'Everflowing Goblet', 'Bandage Roll'],
    balls: ['Vampire', 'Vampire Lord', 'Leech', 'Nosferatu', 'Mosquito King', 'Mosquito Swarm', 'Soul Sucker'],
    effects: ['Heal', 'Lifesteal', 'Leech'],
    reason: 'Synergie Vampire : heal + vol de vie = immortalité',
    tier: 'S',
  },
  {
    passives: ['Kiss of Death', 'Lover\'s Quiver'],
    balls: ['Charm', 'Incubus', 'Succubus', 'Satan', 'Berserk', 'Lovestruck'],
    effects: ['Charm'],
    reason: 'Synergies Charme : chance d\'insta-kill les charmés',
    tier: 'A',
  },
  {
    passives: ['Frozen Spike'],
    balls: ['Freeze', 'Blizzard', 'Freeze Ray', 'Frozen Flame', 'Glacier', 'Wraith'],
    effects: ['Freeze', 'Frostburn'],
    reason: 'Frozen Spike : ennemis gelés émettent du froid → contrôle en chaîne',
    tier: 'S',
  },
  {
    passives: ['Magic Staff', 'Pressure Valve'],
    balls: ['Earthquake', 'Bomb', 'Nuclear Bomb', 'Magma', 'Landslide', 'Lightning'],
    effects: ['Earthquake'],
    reason: 'Magic Staff : +20% dmg AoE sur earthquake/laser/lightning',
    tier: 'A',
  },
  {
    passives: ['Rubber Headband', 'Wagon Wheel', 'Hourglass', 'Upturned Hatchet'],
    balls: [],
    effects: [],
    reason: 'Synergies Rebond : bonus de dégâts par rebond',
    tier: 'B',
    anyBall: true,
  },
  {
    passives: ['Archer\'s Effigy', 'Stone Effigy', 'Healer\'s Effigy', 'Artificial Heart', 'Traitor\'s Cowl', 'Golden Bull'],
    balls: [],
    effects: [],
    reason: 'Synergie Alliés : allies en pierre + buffs de santé',
    tier: 'B',
    anyBall: true,
  },
  {
    passives: ['Breastplate', 'Protective Charm', 'Eye of the Beholder', 'Odiferous Shell'],
    balls: ['Iron', 'Steel'],
    effects: [],
    reason: 'Synergie Défense : survie et réduction de dégâts',
    tier: 'B',
  },
]
