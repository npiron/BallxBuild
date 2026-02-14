<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { useRunState } from '@/stores/useRunState'
import { computeSuggestions } from '@/composables/useSuggestionEngine'
import type { SuggestionResult } from '@/types'
import HeroHeader from '@/components/layout/HeroHeader.vue'
import RunStatePanel from '@/components/run/RunStatePanel.vue'
import ResultsPanel from '@/components/results/ResultsPanel.vue'

const data = useDataStore()
const run = useRunState()

const loading = ref(false)
const result = ref<SuggestionResult | null>(null)

onMounted(async () => {
  await data.loadAll()
})

async function handleAnalyse(): Promise<void> {
  loading.value = true
  result.value = null

  // Micro-delay to let the UI show the spinner
  await new Promise(resolve => setTimeout(resolve, 50))

  try {
    result.value = computeSuggestions(
      {
        selectedCharacters: run.selectedCharacters,
        selectedBiome: run.selectedBiome,
        selectedBalls: run.selectedBalls,
        selectedPassives: run.selectedPassives,
        selectedStyle: run.selectedStyle,
      },
      {
        characters: data.characters,
        balls: data.balls,
        passives: data.passives,
        evolutions: data.evolutions,
        builds: data.builds,
        indexes: {
          ballsByName: data.ballsByName,
          passivesByName: data.passivesByName,
          evosByResult: data.evosByResult,
          evosByIngredient: data.evosByIngredient,
        },
      },
    )

    // Scroll to results
    await new Promise(resolve => setTimeout(resolve, 100))
    document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } finally {
    loading.value = false
  }
}

function handleReset(): void {
  run.resetAll()
  result.value = null
}
</script>

<template>
  <div class="app-shell">
    <HeroHeader />

    <main class="app-main" v-if="data.loaded">
      <RunStatePanel
        :loading="loading"
        @suggest="handleAnalyse"
        @reset="handleReset"
      />

      <ResultsPanel v-if="result" :result="result" />
    </main>

    <div v-else class="loading-screen">
      <div class="loader-spinner" />
      <p>Chargement des données…</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding-bottom: 40px;
}

.loading-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-muted);
  font-family: $font-display;
  font-size: 0.6rem;
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
