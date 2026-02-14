export interface Character {
  id: number
  name: string
  starting_ball: string
  ability: string
  tier: Tier
  difficulty: Difficulty
  unlock: string
  rating: number
  strengths: string[]
  weaknesses: string[]
  best_balls: string[]
  playstyle: string
  image: string
  image_mini: string
  starting_ball_image: string
  ballxpit_net_name: string
  wiki_ability: string
}

export type Tier = 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C'
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard'
