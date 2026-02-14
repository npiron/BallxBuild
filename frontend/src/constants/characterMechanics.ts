export interface BallPrefs {
  speed?: string[]
  effect?: string[]
  category?: string[]
}

export interface CharacterMechanic {
  desc: string
  ballPrefs: BallPrefs
  bonus: number
  reason: string
  antiSynergy: BallPrefs
  antiReason: string
}

export const CHARACTER_MECHANICS: Record<string, CharacterMechanic> = {
  'The Itchy Finger': {
    desc: 'Tire 2x plus vite, aim dispersé, bouge à pleine vitesse',
    ballPrefs: { speed: ['Fast', 'Very Fast'], effect: ['Burn', 'Poison', 'Bleed'] },
    bonus: 20,
    reason: 'Cadence 2x → les DoT stack rapidement',
    antiSynergy: { speed: ['Slow', 'Very Slow'] },
    antiReason: 'Balles lentes sous-optimales avec tir rapide',
  },
  'The Physicist': {
    desc: 'Gravité attire les balles vers le fond',
    ballPrefs: { effect: ['Burn', 'Poison', 'Earthquake'], category: ['Elemental'] },
    bonus: 15,
    reason: 'La gravité concentre les AoE au fond',
    antiSynergy: {},
    antiReason: '',
  },
  'The Shieldbearer': {
    desc: 'Bouclier qui renvoie les balles',
    ballPrefs: { speed: ['Slow'], effect: ['Iron'] },
    bonus: 18,
    reason: 'Les balles rebondissent sur le bouclier pour +dmg',
    antiSynergy: {},
    antiReason: '',
  },
  'The Cohabitants': {
    desc: 'Chaque tir est dupliqué en miroir, dégâts divisés par 2',
    ballPrefs: { effect: ['Burn', 'Poison', 'Bleed', 'Charm', 'Freeze'] },
    bonus: 18,
    reason: 'Tir miroir double l\'application des effets de statut',
    antiSynergy: {},
    antiReason: '',
  },
  'The Empty Nester': {
    desc: 'Pas de baby balls — tire plusieurs instances d\'une balle spéciale',
    ballPrefs: { speed: ['Fast', 'Very Fast'] },
    bonus: 20,
    reason: 'Multi-instances = stack massif d\'effets',
    antiSynergy: { effect: ['Baby Ball Spawn'] },
    antiReason: 'Pas de baby balls → synergies baby inutiles',
  },
  'The Flagellant': {
    desc: 'Balles rebondissent normalement en bas',
    ballPrefs: {},
    bonus: 8,
    reason: 'Rebonds supplémentaires',
    antiSynergy: {},
    antiReason: '',
  },
  'The Spendthrift': {
    desc: 'Tire toutes les balles en même temps en arc',
    ballPrefs: { effect: ['Burn', 'Poison', 'Bleed', 'Freeze'] },
    bonus: 18,
    reason: 'Salve = couverture AoE massive, bon avec DoT',
    antiSynergy: {},
    antiReason: '',
  },
  'The Juggler': {
    desc: 'Lobe les balles en l\'air vers une position cible',
    ballPrefs: { effect: ['Earthquake', 'Burn'], speed: ['Slow'] },
    bonus: 15,
    reason: 'Ciblage précis → burst sur une zone',
    antiSynergy: {},
    antiReason: '',
  },
  'The Makeshift Sisyphus': {
    desc: 'Pas de dmg direct, mais AoE et status ×4. Pas de baby balls',
    ballPrefs: { effect: ['Burn', 'Poison', 'Bleed', 'Freeze', 'Earthquake'] },
    bonus: 25,
    reason: '×4 dégâts de statut → tous les DoT dominent',
    antiSynergy: { effect: ['Baby Ball Spawn', 'N/A'], category: ['Basic'] },
    antiReason: 'Pas de dmg direct → balles sans effet de statut inutiles',
  },
  'The Shade': {
    desc: 'Balles tirées depuis l\'arrière, 10% crit de base',
    ballPrefs: { speed: ['Fast', 'Very Fast'] },
    bonus: 15,
    reason: 'Crit 10% de base → DPS brut élevé',
    antiSynergy: {},
    antiReason: '',
  },
  'The Embedded': {
    desc: 'Balles percent les ennemis jusqu\'au mur',
    ballPrefs: { effect: ['Burn', 'Poison', 'Bleed'] },
    bonus: 20,
    reason: 'Pierce = chaque balle touche TOUS les ennemis sur son passage',
    antiSynergy: {},
    antiReason: '',
  },
  'The Repentant': {
    desc: '+5% dmg par rebond, retour au joueur au mur arrière',
    ballPrefs: { speed: ['Slow', 'Medium'] },
    bonus: 20,
    reason: '+5%/rebond → les balles lentes multi-rebonds explosent',
    antiSynergy: { speed: ['Very Fast'] },
    antiReason: 'Balles trop rapides = moins de rebonds',
  },
  'The Tactician': {
    desc: 'Combat au tour par tour',
    ballPrefs: { effect: ['Freeze', 'Charm'] },
    bonus: 12,
    reason: 'Tour par tour → le contrôle est roi',
    antiSynergy: {},
    antiReason: '',
  },
}
