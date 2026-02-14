<script setup lang="ts">
import { useDataStore } from '@/stores/useDataStore'
import { useRunState } from '@/stores/useRunState'
import EntityImage from '@/components/shared/EntityImage.vue'
import TierBadge from '@/components/shared/TierBadge.vue'
import { vTooltip } from '@/directives/vTooltip'

const dataStore = useDataStore()
const runState = useRunState()

function tooltipText(c: { name: string; ability: string; starting_ball: string; tier: string }): string {
  return `${c.name}|${c.ability || 'Aucune capacité'}|Balle: ${c.starting_ball} · Tier ${c.tier}`
}
</script>

<template>
  <div class="input-group">
    <label class="input-label">
      <span class="icon">🎮</span> Personnages <span class="max-hint">(max 2)</span>
    </label>
    <div class="entity-grid character-grid">
      <div
        v-for="c in dataStore.characters"
        :key="c.id"
        class="entity-item"
        :class="{ selected: runState.selectedCharacters.includes(c.name) }"
        v-tooltip="tooltipText(c)"
        @click="runState.toggleCharacter(c.name)"
      >
        <EntityImage :src="c.image" :alt="c.name" fallback-emoji="🎮" />
        <span class="entity-name">{{ c.name.replace('The ', '') }}</span>
        <TierBadge :tier="c.tier" />
        <span
          v-if="runState.selectedCharacters.indexOf(c.name) >= 0"
          class="char-slot-badge"
        >
          {{ runState.selectedCharacters.indexOf(c.name) + 1 }}
        </span>
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

  .icon {
    font-size: 1rem;
  }

  .max-hint {
    font-family: $font-body;
    font-size: 0.7rem;
    color: var(--text-muted);
  }
}

.entity-grid {
  @include entity-grid;
}

.character-grid {
  gap: 8px;
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
  position: relative;
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
  font-size: 0.6rem;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.2;
  word-break: break-word;
}

.char-slot-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
