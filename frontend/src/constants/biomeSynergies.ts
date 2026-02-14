export interface BiomeSynergyDef {
  strong: string[]
  weak: string[]
  desc: string
}

export const BIOME_SYNERGIES: Record<string, BiomeSynergyDef> = {
  'BONExYARD': { strong: ['Burn', 'Light', 'Bleed'], weak: ['Dark'], desc: 'Les ennemis squelettes sont faibles au feu et à la lumière' },
  'SNOWYxSHORES': { strong: ['Burn', 'Earthquake', 'Wind'], weak: ['Freeze'], desc: 'Les ennemis de glace résistent au gel mais fondent au feu' },
  'LIMINALxDESERT': { strong: ['Freeze', 'Poison', 'Wind'], weak: ['Burn'], desc: 'Le désert résiste au feu, le gel et le vent sont efficaces' },
  'FUNGALxFOREST': { strong: ['Burn', 'Freeze', 'Lightning'], weak: ['Poison'], desc: 'Les champignons résistent au poison mais brûlent bien' },
  'GORYxGRASSLANDS': { strong: ['Burn', 'Poison', 'Dark'], weak: [], desc: 'Terrain ouvert — les AoE et DoT excellent' },
  'SMOLDERINGxDEPTHS': { strong: ['Freeze', 'Iron', 'Ghost'], weak: ['Burn'], desc: 'Les créatures de feu résistent au burn, le gel les stoppe' },
  'HEAVENLYxGATES': { strong: ['Dark', 'Poison', 'Bleed'], weak: ['Light'], desc: 'Les ennemis divins résistent à la lumière, le dark excelle' },
  'VASTxVOID': { strong: ['Light', 'Lightning', 'Iron'], weak: [], desc: 'Zone finale — les dégâts bruts et la lumière percent le vide' },
}
