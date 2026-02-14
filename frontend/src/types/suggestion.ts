import type { Tier } from './character'

export interface EvolutionChainNode {
  ball: string
  status: 'owned' | 'ready' | 'partial' | 'missing' | 'pickup'
  image: string
  children?: EvolutionChainNode[]
  tier?: Tier | null
  tips?: string | null
  replaces?: string
  alt?: string | null
}

export interface PossibleEvolution {
  id: number
  result_ball: string
  recipe: string
  tier: Tier
  tips: string
  result_image: string
  ingredient_1: string
  ingredient_2: string
  ingredient_3?: string
  ingredient_1_alt?: string
  ingredient_2_alt?: string
  wiki_description: string
  from_ball: string
  needs_ball: string
  have_both: boolean
  match_count: number
  total_ingredients: number
}

export interface StatusProfile {
  [effect: string]: number
}

export interface StatusAnalysis {
  profile: StatusProfile
  dominant: string[]
  suggestion: string | null
  enhancing_evolutions?: string[]
}

export interface BiomeSynergyResult {
  strong: string[]
  weak: string[]
  desc: string
}

export interface ScoredBuild {
  id: number
  name: string
  subtitle: string
  archetype: string
  tier: Tier
  difficulty: string
  dps_rating: number
  survival_rating: number
  skill_cap: number
  core_balls: string
  core_passives: string
  timeline: { early: string; mid: string; late: string }
  recommended_characters: string
  strengths: string
  weaknesses: string
  pros: string[]
  cons: string[]
  strategy: string
  score: number
  reasons: string[]
  roadmap: (EvolutionChainNode | null)[]
  core_balls_list: string[]
  core_passives_list: string[]
  balls_images: Record<string, string>
  passives_images: Record<string, string>
}

export interface PassiveEvolution {
  id: number
  name: string
  effect: string
  image: string
  combination: string
  ingredients: string[]
  owned_ingredients: string[]
  missing_ingredients: string[]
  ready: boolean
  progress: number
}

export interface NextPickup {
  ball: string
  score: number
  image: string
  rarity: string | null
  effect: string | null
  unlocks: string[]
}

export interface EvolutionPathNode {
  ball: string
  tier: Tier | null
  status: 'owned' | 'pickup' | 'ready' | 'reachable'
  missing: string[]
  steps: EvolutionPathNode[]
  depth: number
  tips?: string | null
  difficulty?: string | null
  ingredients?: string[]
  altMap?: Record<string, string>
}

export interface PassiveBallSynergy {
  reason: string
  tier: string
  ownedPassives: string[]
  matchedBalls: string[]
  suggestedBalls: string[]
  suggestedPassives: string[]
  power: number
  active: boolean
}

export type GraphNodeStatus = 'owned' | 'ready' | 'one-away' | 'partial' | 'needed' | 'unreachable'

export interface GraphNode {
  id: string
  label: string
  status: GraphNodeStatus
  image: string
  isEvo: boolean
  tier: Tier | null
  missing?: string[]
}

export interface GraphEdge {
  from: string
  to: string
  owned: boolean
}

export interface EvolutionGraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface CharacterHint {
  name: string
  desc: string
  goodBalls: string[]
  badBalls: string[]
  idealBalls: string[]
  antiReason: string
}

export interface SuggestionResult {
  characters: import('./character').Character[]
  current_balls: string[]
  current_passives: string[]
  possible_evolutions: PossibleEvolution[]
  recommended_builds: ScoredBuild[]
  passive_evolutions: PassiveEvolution[]
  next_pickups: NextPickup[]
  status_analysis: StatusAnalysis
  biome_synergy: BiomeSynergyResult | null
  evolution_paths: EvolutionPathNode[]
  passive_ball_synergies: PassiveBallSynergy[]
  evolution_graph: EvolutionGraphData
  character_hints: CharacterHint[]
}
