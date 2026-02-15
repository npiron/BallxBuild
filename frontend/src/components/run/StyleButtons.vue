<script setup lang="ts">
import { useRunState } from '@/stores/useRunState'

const runState = useRunState()

interface StyleOption {
  key: string
  icon: string
  label: string
}

const styles: StyleOption[] = [
  { key: 'aoe', icon: '💥', label: 'AOE / Status' },
  { key: 'sustain', icon: '💚', label: 'Sustain / Tank' },
  { key: 'control', icon: '❄️', label: 'Control' },
  { key: 'boss', icon: '💀', label: 'Boss Killer' },
  { key: 'minion', icon: '🐛', label: 'Minion Swarm' },
  { key: 'hybrid', icon: '⚡', label: 'Hybrid / Laser' },
]
</script>

<template>
  <div class="input-group">
    <label class="input-label">
      <span class="icon">🎯</span> Style préféré
      <span class="hint">(optionnel)</span>
    </label>
    <div class="style-grid">
      <button
        v-for="s in styles"
        :key="s.key"
        class="style-btn"
        :class="{ selected: runState.selectedStyle === s.key }"
        @click="runState.setStyle(s.key)"
      >
        <span class="style-icon">{{ s.icon }}</span>
        <span>{{ s.label }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.input-group { @include input-group; }
.input-label { @include input-label; }

.style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.style-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: $radius-sm;
  color: var(--text-secondary);
  font-family: $font-body;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all $transition;

  &:hover {
    border-color: var(--border-glow);
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }

  &.selected {
    border-color: var(--accent-primary);
    background: var(--bg-selected);
    color: var(--accent-secondary);
    box-shadow: 0 0 12px var(--accent-glow);
  }

  .style-icon {
    font-size: 1.1rem;
  }
}
</style>
