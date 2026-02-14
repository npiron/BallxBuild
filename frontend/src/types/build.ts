import type { Tier, Difficulty } from './character'

export interface BuildTimeline {
  early: string
  mid: string
  late: string
}

export interface Build {
  id: number
  name: string
  subtitle: string
  archetype: string
  tier: Tier
  difficulty: Difficulty
  dps_rating: number
  survival_rating: number
  skill_cap: number
  core_balls: string
  core_passives: string
  core_buildings: string
  timeline: BuildTimeline
  recommended_characters: string
  strengths: string
  weaknesses: string
  pros: string[]
  cons: string[]
  strategy: string
}
