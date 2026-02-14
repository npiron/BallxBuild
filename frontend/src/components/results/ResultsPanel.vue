<script setup lang="ts">
import type { SuggestionResult } from '@/types'
import AnalysisSummary from './AnalysisSummary.vue'
import NextPickups from './NextPickups.vue'
import EvolutionCards from './EvolutionCards.vue'
import PassiveEvolutions from './PassiveEvolutions.vue'
import EvolutionPaths from './EvolutionPaths.vue'
import EvolutionGraph from './EvolutionGraph.vue'
import BuildCard from './BuildCard.vue'

defineProps<{
  result: SuggestionResult
}>()
</script>

<template>
  <section id="results-panel" class="results-panel">
    <h2 class="results-title"><span class="icon">📊</span> Résultats d'Analyse</h2>

    <!-- Status Analysis + Biome + Character Hints + Synergies -->
    <AnalysisSummary
      :status-analysis="result.status_analysis"
      :biome-synergy="result.biome_synergy"
      :character-hints="result.character_hints"
      :passive-ball-synergies="result.passive_ball_synergies"
    />

    <!-- Next Pickups -->
    <NextPickups
      v-if="result.next_pickups.length"
      :pickups="result.next_pickups"
    />

    <!-- Possible Evolutions -->
    <EvolutionCards
      v-if="result.possible_evolutions.length"
      :evolutions="result.possible_evolutions"
    />

    <!-- Passive Evolutions -->
    <PassiveEvolutions
      v-if="result.passive_evolutions.length"
      :evolutions="result.passive_evolutions"
    />

    <!-- Evolution Paths -->
    <EvolutionPaths
      v-if="result.evolution_paths.length"
      :paths="result.evolution_paths"
    />

    <!-- Evolution Graph -->
    <EvolutionGraph
      v-if="result.evolution_graph.nodes.length"
      :graph="result.evolution_graph"
    />

    <!-- Recommended Builds -->
    <div v-if="result.recommended_builds.length" class="builds-section">
      <h3 class="section-subtitle"><span class="icon">🏗️</span> Builds Recommandés</h3>
      <div class="builds-grid">
        <BuildCard
          v-for="(build, idx) in result.recommended_builds"
          :key="build.id"
          :build="build"
          :rank="idx"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.results-panel {
  max-width: $container-max;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.3s ease;
}

.results-title {
  font-family: $font-display;
  font-size: 0.9rem;
  text-align: center;
  color: var(--accent-primary);
  margin-bottom: 8px;

  .icon { margin-right: 6px; }
}

.section-subtitle { @include section-title; }

.builds-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
