import type {
  Character,
  Ball,
  Evolution,
  Build,
  Passive,
  SuggestionResult,
  PossibleEvolution,
  StatusProfile,
  ScoredBuild,
  PassiveEvolution,
  NextPickup,
  EvolutionPathNode,
  PassiveBallSynergy,
  EvolutionChainNode,
  CharacterHint,
  BiomeSynergyResult,
  StatusAnalysis,
  EvolutionGraphData,
  GraphNode,
  GraphEdge,
} from '@/types'
import { BIOME_SYNERGIES, STYLE_MAP, CHARACTER_MECHANICS, PASSIVE_BALL_SYNERGIES } from '@/constants'
import { getImagePath, getStatusEffects } from './helpers'

// ────────────────────────────────────────────
// Indexes type (from data store getters)
// ────────────────────────────────────────────
interface DataIndexes {
  ballsByName: Record<string, Ball>
  passivesByName: Record<string, Passive>
  evosByResult: Record<string, Evolution>
  evosByIngredient: Record<string, Evolution[]>
}

interface RunInput {
  selectedCharacters: string[]
  selectedBiome: string | null
  selectedBalls: string[]
  selectedPassives: string[]
  selectedStyle: string | null
}

interface DataInput {
  characters: Character[]
  balls: Ball[]
  passives: Passive[]
  evolutions: Evolution[]
  builds: Build[]
  indexes: DataIndexes
}

// ────────────────────────────────────────────
// Evolution chain tracing (recursive)
// ────────────────────────────────────────────
function getEvolutionChain(
  targetBall: string,
  currentBalls: string[],
  indexes: DataIndexes,
  depth = 0,
): EvolutionChainNode | null {
  if (depth > 5) return null
  if (currentBalls.includes(targetBall)) {
    return { ball: targetBall, status: 'owned', image: getImagePath('balls', targetBall) }
  }
  const recipe = indexes.evosByResult[targetBall]
  if (!recipe) {
    return { ball: targetBall, status: 'pickup', image: getImagePath('balls', targetBall) }
  }

  const ingredients = [recipe.ingredient_1, recipe.ingredient_2]
  if (recipe.ingredient_3) ingredients.push(recipe.ingredient_3)

  const altIngredients: Record<string, string> = {}
  if (recipe.ingredient_1_alt) altIngredients[recipe.ingredient_1] = recipe.ingredient_1_alt
  if (recipe.ingredient_2_alt) altIngredients[recipe.ingredient_2] = recipe.ingredient_2_alt

  const children: EvolutionChainNode[] = ingredients.map(ing => {
    const alt = altIngredients[ing]
    if (currentBalls.includes(ing)) {
      return { ball: ing, status: 'owned' as const, image: getImagePath('balls', ing) }
    }
    if (alt && currentBalls.includes(alt)) {
      return { ball: alt, status: 'owned' as const, image: getImagePath('balls', alt), replaces: ing }
    }
    const subChain = getEvolutionChain(ing, currentBalls, indexes, depth + 1)
    if (subChain) return subChain
    return { ball: ing, status: 'pickup' as const, image: getImagePath('balls', ing), alt: alt || null }
  })

  const allOwned = children.every(c => c.status === 'owned')
  const someOwned = children.some(c => c.status === 'owned')
  const status = allOwned ? 'ready' : someOwned ? 'partial' : 'missing'

  return {
    ball: targetBall,
    status,
    image: getImagePath('balls', targetBall),
    children,
    tier: recipe.tier,
    tips: recipe.tips || recipe.wiki_description || null,
  }
}

// ────────────────────────────────────────────
// Pathfinding: optimal routes to S+/S evolutions
// ────────────────────────────────────────────
function traceEvolutionPath(
  target: string,
  currentBalls: string[],
  visited: Set<string>,
  depth: number,
  indexes: DataIndexes,
): EvolutionPathNode | null {
  if (depth > 6) return null
  if (visited.has(target)) return null
  visited.add(target)

  if (currentBalls.includes(target)) {
    return { ball: target, tier: null, status: 'owned', missing: [], steps: [], depth: 0 }
  }

  const recipe = indexes.evosByResult[target]
  if (!recipe) {
    return { ball: target, tier: null, status: 'pickup', missing: [target], steps: [], depth: 0 }
  }

  const ingredients = [recipe.ingredient_1, recipe.ingredient_2]
  if (recipe.ingredient_3) ingredients.push(recipe.ingredient_3)

  const altMap: Record<string, string> = {}
  if (recipe.ingredient_1_alt) altMap[recipe.ingredient_1] = recipe.ingredient_1_alt
  if (recipe.ingredient_2_alt) altMap[recipe.ingredient_2] = recipe.ingredient_2_alt

  let totalMissing: string[] = []
  const steps: EvolutionPathNode[] = []

  for (const ing of ingredients) {
    const alt = altMap[ing]
    const useAlt = alt && !currentBalls.includes(ing) && currentBalls.includes(alt)
    const actualIng = useAlt ? alt : ing

    const sub = traceEvolutionPath(actualIng, currentBalls, new Set(visited), depth + 1, indexes)
    if (!sub) return null
    totalMissing.push(...sub.missing)
    if (sub.status !== 'owned') {
      steps.push(sub)
    }
  }

  totalMissing = [...new Set(totalMissing)]

  return {
    ball: target,
    tier: recipe.tier,
    status: totalMissing.length === 0 ? 'ready' : 'reachable',
    missing: totalMissing,
    steps,
    depth: depth + 1,
    tips: recipe.tips || null,
    difficulty: recipe.difficulty || null,
    ingredients,
    altMap,
  }
}

function findEvolutionPaths(
  currentBalls: string[],
  evolutions: Evolution[],
  indexes: DataIndexes,
): EvolutionPathNode[] {
  const paths: EvolutionPathNode[] = []
  const highTierEvos = evolutions.filter(e => e.tier === 'S+' || e.tier === 'S')

  for (const evo of highTierEvos) {
    const path = traceEvolutionPath(evo.result_ball, currentBalls, new Set(), 0, indexes)
    if (path) paths.push(path)
  }

  paths.sort((a, b) => a.missing.length - b.missing.length || a.depth - b.depth)
  return paths
}

// ────────────────────────────────────────────
// Passive↔Ball synergy analyzer
// ────────────────────────────────────────────
function analyzePassiveBallSynergies(
  currentBalls: string[],
  currentPassives: string[],
  indexes: DataIndexes,
): PassiveBallSynergy[] {
  const activeSynergies: PassiveBallSynergy[] = []

  for (const syn of PASSIVE_BALL_SYNERGIES) {
    const ownedPassives = syn.passives.filter(p => currentPassives.includes(p))
    if (ownedPassives.length === 0) continue

    let matchedBalls: string[] = []
    if (syn.anyBall) {
      matchedBalls = currentBalls.slice(0, 3)
    } else {
      matchedBalls = currentBalls.filter(b => syn.balls.includes(b))
      if (syn.effects.length > 0) {
        for (const b of currentBalls) {
          if (matchedBalls.includes(b)) continue
          const effs = getStatusEffects(b, indexes.ballsByName)
          if (effs.some(e => syn.effects.includes(e))) matchedBalls.push(b)
        }
      }
    }

    const power = ownedPassives.length * (matchedBalls.length > 0 ? 2 : 0.5)
    const suggestedBalls = syn.balls.filter(b => !currentBalls.includes(b)).slice(0, 3)
    const suggestedPassives = syn.passives.filter(p => !currentPassives.includes(p)).slice(0, 2)

    activeSynergies.push({
      reason: syn.reason,
      tier: syn.tier,
      ownedPassives,
      matchedBalls,
      suggestedBalls,
      suggestedPassives,
      power,
      active: matchedBalls.length > 0,
    })
  }

  activeSynergies.sort((a, b) => b.power - a.power)
  return activeSynergies.filter(s => s.power > 0)
}

// ────────────────────────────────────────────
// Character dynamic scoring
// ────────────────────────────────────────────
interface CharacterBallBonus {
  bonus: number
  reason: string | null
  anti: boolean
  antiReason: string | null
}

function getCharacterBallBonus(
  charName: string,
  ballName: string,
  indexes: DataIndexes,
): CharacterBallBonus {
  const mech = CHARACTER_MECHANICS[charName]
  if (!mech) return { bonus: 0, reason: null, anti: false, antiReason: null }

  const ball = indexes.ballsByName[ballName]
  if (!ball) return { bonus: 0, reason: null, anti: false, antiReason: null }

  let bonus = 0
  let reason: string | null = null
  let anti = false
  let antiReason: string | null = null

  const prefs = mech.ballPrefs
  if (prefs.speed?.includes(ball.speed)) {
    bonus += mech.bonus
    reason = mech.reason
  }
  if (prefs.effect) {
    const ballEffects = getStatusEffects(ballName, indexes.ballsByName)
    if (prefs.effect.some(e => ballEffects.includes(e) || ball.name === e)) {
      bonus += Math.round(mech.bonus * 0.8)
      reason = reason || mech.reason
    }
  }
  if (prefs.category?.includes(ball.category || '')) {
    bonus += Math.round(mech.bonus * 0.5)
    reason = reason || mech.reason
  }

  const antiPrefs = mech.antiSynergy
  if (antiPrefs.speed?.includes(ball.speed)) {
    anti = true
    antiReason = mech.antiReason
  }
  if (antiPrefs.effect) {
    const ballEffects = getStatusEffects(ballName, indexes.ballsByName)
    if (antiPrefs.effect.some(e => ballEffects.includes(e))) {
      anti = true
      antiReason = mech.antiReason
    }
  }

  return { bonus, reason, anti, antiReason }
}

// ────────────────────────────────────────────
// Evolution graph builder
// ────────────────────────────────────────────
function buildEvolutionGraph(
  currentBalls: string[],
  indexes: DataIndexes,
): EvolutionGraphData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeSet = new Set<string>()

  for (const b of currentBalls) {
    if (!nodeSet.has(b)) {
      nodeSet.add(b)
      const ball = indexes.ballsByName[b]
      nodes.push({
        id: b,
        label: b,
        status: 'owned',
        image: ball ? ball.image : getImagePath('balls', b),
        isEvo: ball ? !!ball.is_evolution : false,
        tier: null,
      })
    }
  }

  const processedEvos = new Set<string>()

  function addEvoNodes(ballName: string, depth: number): void {
    if (depth > 3) return
    const evos = indexes.evosByIngredient[ballName] || []
    for (const evo of evos) {
      if (processedEvos.has(evo.result_ball)) continue
      processedEvos.add(evo.result_ball)

      const ings = [evo.ingredient_1, evo.ingredient_2]
      if (evo.ingredient_3) ings.push(evo.ingredient_3)

      const ownedIngs = ings.filter(i => currentBalls.includes(i))
      const missingIngs = ings.filter(i => !currentBalls.includes(i))

      let status: GraphNode['status'] = 'unreachable'
      if (missingIngs.length === 0) status = 'ready'
      else if (missingIngs.length === 1) status = 'one-away'
      else if (ownedIngs.length > 0) status = 'partial'

      if (!nodeSet.has(evo.result_ball)) {
        nodeSet.add(evo.result_ball)
        const resultBall = indexes.ballsByName[evo.result_ball]
        nodes.push({
          id: evo.result_ball,
          label: evo.result_ball,
          status,
          image: evo.result_image || (resultBall ? resultBall.image : getImagePath('balls', evo.result_ball)),
          isEvo: true,
          tier: evo.tier,
          missing: missingIngs,
        })
      }

      for (const ing of missingIngs) {
        if (!nodeSet.has(ing)) {
          nodeSet.add(ing)
          const ingBall = indexes.ballsByName[ing]
          nodes.push({
            id: ing,
            label: ing,
            status: 'needed',
            image: ingBall ? ingBall.image : getImagePath('balls', ing),
            isEvo: ingBall ? !!ingBall.is_evolution : false,
            tier: null,
          })
        }
      }

      for (const ing of ings) {
        edges.push({ from: ing, to: evo.result_ball, owned: currentBalls.includes(ing) })
      }

      addEvoNodes(evo.result_ball, depth + 1)
    }
  }

  for (const b of currentBalls) addEvoNodes(b, 0)

  return { nodes, edges }
}

// ════════════════════════════════════════════
// MAIN: computeSuggestions
// ════════════════════════════════════════════
export function computeSuggestions(run: RunInput, data: DataInput): SuggestionResult {
  let currentBalls = [...run.selectedBalls]
  const currentPassives = [...run.selectedPassives]
  const characters = [...run.selectedCharacters]
  const biome = run.selectedBiome
  const preferStyle = run.selectedStyle
  const { indexes } = data

  // ─── Step 1: Character enrichment ───
  const charInfos: Character[] = []
  for (const charName of characters) {
    const ci = data.characters.find(c => c.name === charName)
    if (ci) {
      charInfos.push(ci)
      if (!currentBalls.includes(ci.starting_ball)) {
        currentBalls = [ci.starting_ball, ...currentBalls]
      }
    }
  }

  // ─── Step 2: Possible evolutions ───
  let possibleEvolutions: PossibleEvolution[] = []
  const seen = new Set<string>()
  for (const ball of currentBalls) {
    const evos = indexes.evosByIngredient[ball] || []
    for (const evo of evos) {
      if (seen.has(evo.result_ball)) continue
      seen.add(evo.result_ball)

      if (evo.ingredient_3) {
        const have1 = currentBalls.includes(evo.ingredient_1)
        const have2 = currentBalls.includes(evo.ingredient_2)
        const have3 = currentBalls.includes(evo.ingredient_3)
        const needed: string[] = []
        if (!have1) needed.push(evo.ingredient_1)
        if (!have2) needed.push(evo.ingredient_2)
        if (!have3) needed.push(evo.ingredient_3)
        possibleEvolutions.push({
          ...evo,
          from_ball: ball,
          needs_ball: needed.join(' + '),
          have_both: have1 && have2 && have3,
          match_count: (have1 ? 1 : 0) + (have2 ? 1 : 0) + (have3 ? 1 : 0),
          total_ingredients: 3,
        })
      } else {
        const matchesIng1 = evo.ingredient_1 === ball || evo.ingredient_1_alt === ball
        const otherIng = matchesIng1 ? evo.ingredient_2 : evo.ingredient_1
        const otherIngAlt = matchesIng1 ? evo.ingredient_2_alt : evo.ingredient_1_alt
        const haveOther = currentBalls.includes(otherIng) || (!!otherIngAlt && currentBalls.includes(otherIngAlt))
        possibleEvolutions.push({
          ...evo,
          from_ball: ball,
          needs_ball: otherIngAlt ? `${otherIng} ou ${otherIngAlt}` : otherIng,
          have_both: haveOther,
          match_count: 1 + (haveOther ? 1 : 0),
          total_ingredients: 2,
        })
      }
    }
  }

  const tierOrder: Record<string, number> = { 'S+': 0, S: 1, A: 2, B: 3, C: 4 }
  possibleEvolutions.sort(
    (a, b) =>
      (a.have_both ? 0 : 1) - (b.have_both ? 0 : 1) ||
      (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9) ||
      b.match_count - a.match_count,
  )

  // ─── Step 3: Status effect profile ───
  const statusProfile: StatusProfile = {}
  for (const ballName of currentBalls) {
    for (const effect of getStatusEffects(ballName, indexes.ballsByName)) {
      statusProfile[effect] = (statusProfile[effect] || 0) + 1
    }
  }
  const dominantEffects = Object.entries(statusProfile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([eff]) => eff)

  // ─── Step 4: Biome analysis ───
  let biomeSynergy: BiomeSynergyResult | null = null
  if (biome && BIOME_SYNERGIES[biome]) {
    biomeSynergy = BIOME_SYNERGIES[biome]
  }

  // ─── Step 5: Score builds ───
  const scoredBuilds: ScoredBuild[] = data.builds.map(build => {
    const b = { ...build } as unknown as ScoredBuild
    let score = 0
    const reasons: string[] = []

    const tierScore: Record<string, number> = { 'S+': 45, S: 35, 'A+': 28, A: 22, B: 12 }
    score += tierScore[b.tier] || 0

    for (const ci of charInfos) {
      if ((b.recommended_characters || '').includes(ci.name)) {
        score += 45
        reasons.push(`Recommandé pour ${ci.name}`)
      }
      if (b.archetype) {
        const charStrengths = (ci.strengths || []).join(' ').toLowerCase()
        const charPlaystyle = (ci.playstyle || '').toLowerCase()
        const archLower = b.archetype.toLowerCase()
        if (charStrengths.includes('dps') && (archLower.includes('dps') || archLower.includes('boss'))) {
          score += 15
          reasons.push(`Synergie playstyle DPS (${ci.name.replace('The ', '')})`)
        }
        if (charStrengths.includes('defense') && (archLower.includes('sustain') || archLower.includes('survival'))) {
          score += 15
          reasons.push(`Synergie playstyle défensif (${ci.name.replace('The ', '')})`)
        }
        if (charPlaystyle.includes('speed') && archLower.includes('speed')) {
          score += 10
          reasons.push(`Synergie vitesse (${ci.name.replace('The ', '')})`)
        }
      }
      if (ci.best_balls) {
        const buildBallsRaw = b.core_balls.split(',').map(s => s.trim().toLowerCase())
        for (const bb of ci.best_balls) {
          const bbLower = bb.toLowerCase()
          if (buildBallsRaw.some(name => name.includes(bbLower) || bbLower.includes(name))) {
            score += 12
            reasons.push(`${bb} recommandé pour ${ci.name.replace('The ', '')}`)
            break
          }
        }
      }
    }

    if (preferStyle) {
      const matchedTypes = STYLE_MAP[preferStyle.toLowerCase()] || []
      if (matchedTypes.includes(b.archetype)) {
        score += 40
        reasons.push(`Style ${b.archetype} demandé`)
      } else if (matchedTypes.some(t => (b.archetype || '').toLowerCase().includes(t.toLowerCase()))) {
        score += 20
        reasons.push(`Style similaire à ${b.archetype}`)
      }
    }

    const buildBalls = b.core_balls.split(',').map(s => s.trim())
    let ballOverlap = 0
    for (const cb of currentBalls) {
      if (buildBalls.includes(cb)) {
        ballOverlap++
        score += 18
        reasons.push(`Balle ${cb} dans le build`)
      }
      for (const evo of possibleEvolutions) {
        if (evo.from_ball === cb && buildBalls.includes(evo.result_ball)) {
          score += evo.have_both ? 15 : 8
          reasons.push(`${cb} → ${evo.result_ball}${evo.have_both ? ' (prêt!)' : ''}`)
        }
      }
    }

    const buildEffects = new Set<string>()
    for (const bbName of buildBalls) {
      for (const eff of getStatusEffects(bbName, indexes.ballsByName)) buildEffects.add(eff)
    }
    for (const eff of dominantEffects) {
      if (buildEffects.has(eff)) {
        score += 12
        reasons.push(`Synergie effet ${eff}`)
      }
    }

    const buildPassives = (b.core_passives || '').split(',').map(s => s.trim())
    for (const cp of currentPassives) {
      if (buildPassives.includes(cp)) {
        score += 12
        reasons.push(`Passif ${cp} dans le build`)
      }
    }

    if (biomeSynergy) {
      let biomeBonus = 0
      for (const bbName of buildBalls) {
        const ball = indexes.ballsByName[bbName]
        if (!ball) continue
        const ballEffects = getStatusEffects(bbName, indexes.ballsByName)
        for (const strong of biomeSynergy.strong) {
          if (ball.name === strong || ballEffects.includes(strong)) {
            biomeBonus += 8
            break
          }
        }
        for (const weak of biomeSynergy.weak) {
          if (ball.name === weak || ballEffects.includes(weak)) {
            biomeBonus -= 5
            break
          }
        }
      }
      if (biomeBonus > 0) {
        score += biomeBonus
        reasons.push(`Efficace dans ${biome}`)
      } else if (biomeBonus < 0) {
        score += biomeBonus
        reasons.push(`⚠ Faible dans ${biome}`)
      }
    }

    for (const ci of charInfos) {
      for (const bbName of buildBalls) {
        const charBonus = getCharacterBallBonus(ci.name, bbName, indexes)
        if (charBonus.bonus > 0) {
          score += charBonus.bonus
          if (charBonus.reason) reasons.push(`🎮 ${charBonus.reason} (${ci.name.replace('The ', '')})`)
        }
        if (charBonus.anti) {
          score -= 10
          if (charBonus.antiReason) reasons.push(`⚠️ ${charBonus.antiReason} (${ci.name.replace('The ', '')})`)
        }
      }
    }

    if (b.difficulty) {
      const diffBonus: Record<string, number> = { Easy: 5, Medium: 3, Hard: 0, 'Very Hard': -3 }
      score += diffBonus[b.difficulty] || 0
    }

    const feasibilityRatio = currentBalls.length > 0 ? ballOverlap / buildBalls.length : 0
    if (feasibilityRatio >= 0.5) {
      score += 15
      reasons.push(`${Math.round(feasibilityRatio * 100)}% du build déjà en place`)
    }

    const roadmap: (EvolutionChainNode | null)[] = buildBalls.map(targetBall =>
      getEvolutionChain(targetBall, currentBalls, indexes),
    )

    b.score = score
    b.reasons = [...new Set(reasons)]
    b.roadmap = roadmap
    b.core_balls_list = buildBalls
    b.core_passives_list = buildPassives
    b.balls_images = {}
    b.passives_images = {}
    for (const name of buildBalls) b.balls_images[name] = getImagePath('balls', name)
    for (const name of buildPassives) if (name) b.passives_images[name] = getImagePath('passives', name)

    return b
  })

  scoredBuilds.sort((a, b) => b.score - a.score)

  // ─── Step 6: Passive evolutions ───
  const passiveEvos: PassiveEvolution[] = []
  const evoPassives = data.passives.filter(p => p.is_evolution && p.combination)
  for (const ep of evoPassives) {
    const ingredients = (ep.combination || '').split('+').map(s => s.trim())
    const owned = ingredients.filter(ing => currentPassives.includes(ing))
    const missing = ingredients.filter(ing => !currentPassives.includes(ing))
    passiveEvos.push({
      id: ep.id,
      name: ep.name,
      effect: ep.effect,
      image: ep.image,
      combination: ep.combination || '',
      ingredients,
      owned_ingredients: owned,
      missing_ingredients: missing,
      ready: missing.length === 0,
      progress: ingredients.length > 0 ? owned.length / ingredients.length : 0,
    })
  }
  passiveEvos.sort((a, b) => b.progress - a.progress || (a.ready ? 0 : 1) - (b.ready ? 0 : 1))

  // ─── Step 7: Next pickups ───
  const nextPickupScores: Record<string, number> = {}
  for (const evo of data.evolutions) {
    const ings = [evo.ingredient_1, evo.ingredient_2]
    if (evo.ingredient_3) ings.push(evo.ingredient_3)
    const alts: { orig: string; alt: string }[] = []
    if (evo.ingredient_1_alt) alts.push({ orig: evo.ingredient_1, alt: evo.ingredient_1_alt })
    if (evo.ingredient_2_alt) alts.push({ orig: evo.ingredient_2, alt: evo.ingredient_2_alt })

    for (const ing of ings) {
      if (currentBalls.includes(ing)) continue
      const others = ings.filter(i => i !== ing)
      const allOthersOwned = others.every(o => currentBalls.includes(o))
      if (allOthersOwned && others.length > 0) {
        const evoTierVal: Record<string, number> = { 'S+': 50, S: 40, A: 25, B: 12 }
        nextPickupScores[ing] = (nextPickupScores[ing] || 0) + (evoTierVal[evo.tier] || 10)
      }
    }
    for (const { orig, alt } of alts) {
      if (currentBalls.includes(alt)) continue
      const others = ings.filter(i => i !== orig)
      const allOthersOwned = others.every(o => currentBalls.includes(o))
      if (allOthersOwned && others.length > 0) {
        const evoTierVal: Record<string, number> = { 'S+': 50, S: 40, A: 25, B: 12 }
        nextPickupScores[alt] = (nextPickupScores[alt] || 0) + (evoTierVal[evo.tier] || 10)
      }
    }
  }

  const nextPickups: NextPickup[] = Object.entries(nextPickupScores)
    .map(([ball, pickupScore]) => {
      const ballData = indexes.ballsByName[ball]
      const unlocks = data.evolutions
        .filter(evo => {
          const ings = [evo.ingredient_1, evo.ingredient_2]
          if (evo.ingredient_3) ings.push(evo.ingredient_3)
          if (!ings.includes(ball)) {
            const isAlt = evo.ingredient_1_alt === ball || evo.ingredient_2_alt === ball
            if (!isAlt) return false
          }
          return true
        })
        .filter(evo => {
          const ings = [evo.ingredient_1, evo.ingredient_2]
          if (evo.ingredient_3) ings.push(evo.ingredient_3)
          const relevantIngs = ings.filter(i => i !== ball)
          return relevantIngs.every(o => currentBalls.includes(o))
        })
        .map(evo => evo.result_ball)
      return {
        ball,
        score: pickupScore,
        image: ballData ? ballData.image : getImagePath('balls', ball),
        rarity: ballData ? ballData.rarity : null,
        effect: ballData ? ballData.effect : null,
        unlocks,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  // ─── Step 8: Status analysis summary ───
  const statusAnalysis: StatusAnalysis = {
    profile: statusProfile,
    dominant: dominantEffects,
    suggestion: null,
  }
  if (dominantEffects.length > 0) {
    const enhancingEvos = possibleEvolutions
      .filter(evo => {
        const resultEffects = getStatusEffects(evo.result_ball, indexes.ballsByName)
        return resultEffects.some(e => dominantEffects.includes(e))
      })
      .slice(0, 3)
      .map(e => e.result_ball)
    statusAnalysis.enhancing_evolutions = enhancingEvos

    const suggestionMap: Record<string, string> = {
      Bleed: 'Build Bleed puissant : visez Haemorrhage ou Vampire Lord',
      Burn: 'Build Burn solide : Magma et Inferno amplifient massivement',
      Freeze: 'Build Control : Blizzard et Frozen Flame offrent un contrôle total',
      Charm: 'Build Charm : visez Incubus/Succubus et ultimement Satan',
      Poison: 'Build Poison : Virus propage les dégâts, Nuclear Bomb comme finisher',
      Lifesteal: 'Build Sustain : Nosferatu est l\'évolution ultime, unkillable',
      Heal: 'Build Sustain : Nosferatu est l\'évolution ultime, unkillable',
    }
    const topEffect = dominantEffects[0]
    if (topEffect) {
      statusAnalysis.suggestion = suggestionMap[topEffect] || null
    }
  }

  // ─── Step 9: Evolution paths ───
  const evolutionPaths = findEvolutionPaths(currentBalls, data.evolutions, indexes)

  // ─── Step 10: Passive↔Ball synergies ───
  const passiveBallSynergies = analyzePassiveBallSynergies(currentBalls, currentPassives, indexes)

  // ─── Step 11: Evolution graph ───
  const evolutionGraph = buildEvolutionGraph(currentBalls, indexes)

  // ─── Step 12: Character hints ───
  const characterHintsList: CharacterHint[] = []
  for (const ci of charInfos) {
    const mech = CHARACTER_MECHANICS[ci.name]
    if (!mech) continue
    const goodBalls = currentBalls.filter(b => getCharacterBallBonus(ci.name, b, indexes).bonus > 0)
    const badBalls = currentBalls.filter(b => getCharacterBallBonus(ci.name, b, indexes).anti)
    const idealBalls = (mech.ballPrefs.effect || [])
      .filter(e => !currentBalls.includes(e) && indexes.ballsByName[e])
      .slice(0, 4)
    characterHintsList.push({
      name: ci.name,
      desc: mech.desc,
      goodBalls,
      badBalls,
      idealBalls,
      antiReason: mech.antiReason,
    })
  }

  return {
    characters: charInfos,
    current_balls: currentBalls,
    current_passives: currentPassives,
    possible_evolutions: possibleEvolutions.slice(0, 15),
    recommended_builds: scoredBuilds.slice(0, 5),
    passive_evolutions: passiveEvos.slice(0, 6),
    next_pickups: nextPickups,
    status_analysis: statusAnalysis,
    biome_synergy: biomeSynergy,
    evolution_paths: evolutionPaths.slice(0, 8),
    passive_ball_synergies: passiveBallSynergies.slice(0, 6),
    evolution_graph: evolutionGraph,
    character_hints: characterHintsList,
  }
}
