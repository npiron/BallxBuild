<script setup lang="ts">
import type { EvolutionPathNode } from '@/types'
import EntityImage from '@/components/shared/EntityImage.vue'
import TierBadge from '@/components/shared/TierBadge.vue'
import { getImagePath } from '@/composables/helpers'

defineProps<{
  paths: EvolutionPathNode[]
}>()

function statusClass(path: EvolutionPathNode): string {
  if (path.status === 'ready') return 'path-ready'
  if (path.missing.length <= 1) return 'path-close'
  return 'path-far'
}

function statusIcon(status: string): string {
  const map: Record<string, string> = {
    owned: '🟢',
    pickup: '🔴',
    ready: '⚡',
    reachable: '🟡',
  }
  return map[status] || '🟡'
}
</script>

<template>
  <div v-if="paths.length" class="evo-paths-section">
    <h3 class="section-subtitle"><span class="icon">🗺️</span> Chemins d'Évolution Optimaux</h3>
    <p class="section-hint">Routes les plus courtes vers les évolutions S+ et S depuis tes balles actuelles</p>
    <div class="evo-paths-grid">
      <div
        v-for="path in paths"
        :key="path.ball"
        class="path-card"
        :class="statusClass(path)"
      >
        <div class="path-header">
          <EntityImage :src="getImagePath('balls', path.ball)" :alt="path.ball" fallback-emoji="✨" />
          <span class="path-target">{{ path.ball }}</span>
          <TierBadge v-if="path.tier" :tier="path.tier" />
          <span
            v-if="path.difficulty"
            class="difficulty-badge"
            :class="`diff-${path.difficulty.toLowerCase().replace(/ /g, '-')}`"
          >
            {{ path.difficulty }}
          </span>
          <span class="path-cost">
            {{ path.missing.length === 0 ? 'Prêt!' : `${path.missing.length} balle(s) manquante(s)` }}
          </span>
        </div>
        <div v-if="path.missing.length > 0" class="path-missing">
          Manque :
          <span v-for="m in path.missing" :key="m" class="effect-tag weak">{{ m }}</span>
        </div>
        <div v-else class="path-ready-label">✅ Tous les ingrédients prêts !</div>
        <div v-if="path.steps.length" class="path-steps">
          <template v-for="(step, i) in path.steps" :key="step.ball">
            <span v-if="i > 0" class="path-step-arrow">→</span>
            <div class="path-step">
              <span class="path-step-icon">{{ statusIcon(step.status) }}</span>
              <span class="path-step-name">{{ step.ball }}</span>
              <span v-if="step.tier" class="path-step-tier">[{{ step.tier }}]</span>
            </div>
          </template>
        </div>
        <div v-if="path.tips" class="path-tips">💡 {{ path.tips }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.section-subtitle { @include section-title; }

.section-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.evo-paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.path-card {
  @include card-style;
  padding: 14px;

  &.path-ready { border-color: var(--success); }
  &.path-close { border-color: var(--warning); }
  &.path-far { border-color: var(--border); }
}

.path-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.path-target {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.path-cost {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-left: auto;
}

.path-missing {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.effect-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;

  &.weak {
    color: var(--danger);
    border: 1px solid var(--danger);
    background: rgba(239, 68, 68, 0.08);
  }
}

.path-ready-label {
  font-size: 0.8rem;
  color: var(--success);
  font-weight: 600;
  margin-bottom: 6px;
}

.path-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
}

.path-step-icon { font-size: 0.8rem; }
.path-step-name { color: var(--text-primary); }
.path-step-tier { color: var(--text-muted); font-size: 0.6rem; }
.path-step-arrow { color: var(--text-muted); font-size: 0.8rem; }

.path-tips {
  font-size: 0.7rem;
  color: var(--warning);
  margin-top: 6px;
}

.difficulty-badge {
  font-size: 0.55rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  &.diff-easy { color: var(--success); }
  &.diff-medium { color: var(--warning); }
  &.diff-hard { color: var(--danger); }
  &.diff-very-hard { color: var(--tier-s-plus); }
}
</style>
