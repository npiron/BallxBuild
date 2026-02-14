<script setup lang="ts">
import type { PassiveEvolution } from '@/types'
import EntityImage from '@/components/shared/EntityImage.vue'

defineProps<{
  evolutions: PassiveEvolution[]
}>()

const visibleEvos = (evos: PassiveEvolution[]) => evos.filter(p => p.progress > 0)
</script>

<template>
  <div v-if="visibleEvos(evolutions).length" class="passive-evos-section">
    <h3 class="section-subtitle"><span class="icon">🛡️</span> Évolutions de Passifs</h3>
    <div class="passive-evo-grid">
      <div
        v-for="pe in visibleEvos(evolutions)"
        :key="pe.name"
        class="passive-evo-card"
        :class="{ ready: pe.ready }"
      >
        <EntityImage :src="pe.image" :alt="pe.name" fallback-emoji="🛡️" />
        <div class="passive-evo-info">
          <span class="passive-evo-name">{{ pe.name }}</span>
          <div class="passive-evo-recipe">
            <span
              v-for="ing in pe.ingredients"
              :key="ing"
              :class="pe.owned_ingredients.includes(ing) ? 'have' : 'need'"
            >
              {{ ing }}
            </span>
          </div>
          <div class="passive-evo-bar">
            <div
              class="passive-evo-fill"
              :style="{ width: `${pe.progress * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.section-subtitle { @include section-title; }

.passive-evo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.passive-evo-card {
  @include card-style;
  display: flex;
  gap: 10px;
  padding: 10px;

  &.ready {
    border-color: var(--success);
    animation: readyPulse 2s infinite;
  }
}

.passive-evo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.passive-evo-name {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--text-primary);
}

.passive-evo-recipe {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.65rem;

  .have {
    color: var(--success);
    font-weight: 600;
  }

  .need {
    color: var(--danger);
    opacity: 0.7;
  }

  span + span::before {
    content: ' + ';
    color: var(--text-muted);
  }
}

.passive-evo-bar {
  height: 4px;
  background: var(--bg-input);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.passive-evo-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--success));
  border-radius: 2px;
  transition: width 0.3s;
}
</style>
