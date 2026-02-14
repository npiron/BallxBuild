export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
export type Speed = 'Very Slow' | 'Slow' | 'Medium' | 'Fast' | 'Very Fast'

export interface Ball {
  id: number
  name: string
  rarity: Rarity
  base_damage: number
  speed: Speed
  effect: string
  category?: string
  unlock?: string
  evolution_hint?: string
  is_base_ball: 0 | 1
  is_evolution: 0 | 1
  image: string
  wiki_description?: string
  wiki_image?: string
  status_effect?: string
  damage_type?: string
  source?: string
}
