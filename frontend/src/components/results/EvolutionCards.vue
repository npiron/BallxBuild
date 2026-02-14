<script setup lang="ts">
import type { PossibleEvolution } from '@/types'
import { useRunState } from '@/stores/useRunState'
import EntityImage from '@/components/shared/EntityImage.vue'
import TierBadge from '@/components/shared/TierBadge.vue'
import { getImagePath } from '@/composables/helpers'

defineProps<{
  evolutions: PossibleEvolution[]
}>()

const runState = useRunState()
</script>

<template>
  <div v-if="evolutions.length" class="evolutions-section">
    <h3 class="section-subtitle"><span class="icon">🔬</span> Évolutions Disponibles</h3>
    <div class="evo-grid">
      <div
        v-for="evo in evolutions"
        :key="evo.result_ball"
        class="evo-card"
        :class="{ ready: evo.have_both }"
      >
        <div class="evo-recipe">
          <div
            class="evo-ingredient"
            :class="runState.selectedBalls.includes(evo.ingredient_1) ? 'owned' : 'missing'"
          >
            <EntityImage
              :src="getImagePath('balls', evo.ingredient_1)"
              :alt="evo.ingredient_1"
              fallback-emoji="⚪"
            />
            <span class="evo-label">{{ evo.ingredient_1 }}</span>
          </div>
          <span class="evo-plus">+</span>
          <div
            class="evo-ingredient"
            :class="runState.selectedBalls.includes(evo.ingredient_2) ? 'owned' : 'missing'"
          >
            <EntityImage
              :src="getImagePath('balls', evo.ingredient_2)"
              :alt="evo.ingredient_2"
              fallback-emoji="⚪"
            />
            <span class="evo-label">{{ evo.ingredient_2 }}</span>
          </div>
          <template v-if="evo.ingredient_3">
            <span class="evo-plus">+</span>
            <div
              class="evo-ingredient"
              :class="runState.selectedBalls.includes(evo.ingredient_3) ? 'owned' : 'missing'"
            >
              <EntityImage
                :src="getImagePath('balls', evo.ingredient_3)"
                :alt="evo.ingredient_3"
                fallback-emoji="⚪"
              />
              <span class="evo-label">{{ evo.ingredient_3 }}</span>
            </div>
          </template>
          <span class="evo-arrow">→</span>
          <EntityImage :src="evo.result_image" :alt="evo.result_ball" fallback-emoji="✨" />
          <span class="evo-result-name">{{ evo.result_ball }}</span>
          <TierBadge :tier="evo.tier" />
        </div>
        <div v-if="evo.ingredient_1_alt || evo.ingredient_2_alt" class="evo-alt">
          🔄
          <template v-if="evo.ingredient_1_alt">{{ evo.ingredient_1 }} remplaçable par {{ evo.ingredient_1_alt }}</template>
          <template v-if="evo.ingredient_1_alt && evo.ingredient_2_alt"> · </template>
          <template v-if="evo.ingredient_2_alt">{{ evo.ingredient_2 }} remplaçable par {{ evo.ingredient_2_alt }}</template>
        </div>
        <div v-if="evo.tips" class="evo-tips">💡 {{ evo.tips }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.section-subtitle { @include section-title; }

.evo-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.evo-card {
  @include card-style;
  padding: 12px 16px;

  &.ready {
    border-color: var(--success);
    animation: readyPulse 2s infinite;
  }
}

.evo-recipe {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.evo-ingredient {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: $radius-sm;
  border: 1px solid var(--border);

  &.owned {
    border-color: var(--success);
    background: rgba(52, 211, 153, 0.08);
  }
  &.missing {
    border-color: var(--danger);
    opacity: 0.7;
  }
}

.evo-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.evo-plus {
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 700;
}

.evo-arrow {
  color: var(--accent-primary);
  font-size: 1.2rem;
  font-weight: 700;
}

.evo-result-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.evo-alt {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 6px;
}

.evo-tips {
  font-size: 0.7rem;
  color: var(--warning);
  margin-top: 4px;
}
</style>
