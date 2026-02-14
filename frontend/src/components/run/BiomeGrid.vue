<script setup lang="ts">
import { useDataStore } from '@/stores/useDataStore'
import { useRunState } from '@/stores/useRunState'
import EntityImage from '@/components/shared/EntityImage.vue'
import { vTooltip } from '@/directives/vTooltip'

const dataStore = useDataStore()
const runState = useRunState()

function tooltipText(b: { name: string; boss_name: string; unlock_requirement?: string }): string {
  return `${b.name}|Boss: ${b.boss_name}|${b.unlock_requirement || ''}`
}
</script>

<template>
  <div class="input-group">
    <label class="input-label">
      <span class="icon">🌍</span> Biome actuel
    </label>
    <div class="entity-grid biome-grid">
      <div
        v-for="b in dataStore.biomes"
        :key="b.id"
        class="entity-item"
        :class="{ selected: runState.selectedBiome === b.name }"
        v-tooltip="tooltipText(b)"
        @click="runState.toggleBiome(b.name)"
      >
        <EntityImage :src="b.image" :alt="b.name" fallback-emoji="🌍" />
        <span class="entity-name">{{ b.name }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: $font-display;
  font-size: 0.6rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  letter-spacing: 1px;

  .icon { font-size: 1rem; }
}

.entity-grid {
  @include entity-grid;
}

.entity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all $transition;
  min-width: 80px;
  max-width: 100px;

  &:hover {
    border-color: var(--border-glow);
    background: var(--bg-card-hover);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: var(--accent-primary);
    background: var(--bg-selected);
    box-shadow: 0 0 12px var(--accent-glow);
  }
}

.entity-name {
  font-size: 0.55rem;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.2;
}
</style>
