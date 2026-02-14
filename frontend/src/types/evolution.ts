import type { Tier } from './character'

export interface Evolution {
  id: number
  result_ball: string
  recipe: string
  ingredients: string[]
  tier: Tier
  difficulty: string
  tips: string
  category: string
  result_image: string
  ingredient_1: string
  ingredient_2: string
  ingredient_3?: string
  ingredient_1_alt?: string
  ingredient_2_alt?: string
  wiki_combination: string
  wiki_description: string
}
