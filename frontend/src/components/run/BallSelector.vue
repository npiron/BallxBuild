<script setup lang="ts">
import { ref } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { useRunState } from '@/stores/useRunState'
import EntityImage from '@/components/shared/EntityImage.vue'
import { vTooltip } from '@/directives/vTooltip'

const dataStore = useDataStore()
const runState = useRunState()
const expanded = ref(false)

function toggleGrid(): void {
  expanded.value = !expanded.value
}

function tooltipText(b: { name: string; effect: string; rarity: string; base_damage: number; speed: string }): string {
  return `${b.name}|${b.effect || ''}|${b.rarity} · ${b.base_damage} dmg · ${b.speed}`
}

function rarityClass(rarity: string): string {
  return rarity ? `rarity-${rarity.toLowerCase()}` : ''
}
</script>

<template>
  <div class="input-group">
    <label class="input-label">
      <span class="icon">🎱</span> Balles actuelles
      <span class="hint">(clique pour ajouter/retirer)</span>
    </label>
    <div class="balls-section">
      <div class="selected-items" @click="toggleGrid">
        <span v-if="runState.selectedBalls.length === 0" class="placeholder">
          Aucune balle sélectionnée — clique ici pour déplier
        </span>
        <span
          v-for="name in runState.selectedBalls"
          :key="name"
          class="selected-tag"
        >
          <img
            v-if="dataStore.ballsByName[name]?.image"
            :src="dataStore.ballsByName[name]?.image"
            :alt="name"
          />
          {{ name }}
          <span
            class="remove"
            @click.stop="runState.removeBall(name)"
          >✕</span>
        </span>
      </div>
      <div class="entity-grid ball-grid" :class="{ expanded }">
        <div class="section-label">BALLES DE BASE</div>
        <div
          v-for="b in dataStore.baseBalls"
          :key="b.id"
          class="entity-item"
          :class="[
            { selected: runState.selectedBalls.includes(b.name) },
            rarityClass(b.rarity),
          ]"
          v-tooltip="tooltipText(b)"
          @click="runState.toggleBall(b.name)"
        >
          <EntityImage :src="b.image" :alt="b.name" fallback-emoji="⚪" />
          <span class="entity-name">{{ b.name }}</span>
        </div>
        <div class="section-label">ÉVOLUTIONS</div>
        <div
          v-for="b in dataStore.evoBalls"
          :key="b.id"
          class="entity-item"
          :class="[
            { selected: runState.selectedBalls.includes(b.name) },
            rarityClass(b.rarity),
          ]"
          v-tooltip="tooltipText(b)"
          @click="runState.toggleBall(b.name)"
        >
          <EntityImage :src="b.image" :alt="b.name" fallback-emoji="⚪" />
          <span class="entity-name">{{ b.name }}</span>
        </div>
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

  .hint {
    font-family: $font-body;
    font-size: 0.7rem;
    color: var(--text-muted);
  }
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: $radius-sm;
  min-height: 40px;
  cursor: pointer;
  transition: border-color $transition;

  &:hover {
    border-color: var(--border-glow);
  }
}

.placeholder {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-style: italic;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--bg-selected);
  border: 1px solid var(--accent-primary);
  border-radius: 20px;
  font-size: 0.7rem;
  color: var(--text-primary);

  img {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }

  .remove {
    cursor: pointer;
    color: var(--text-muted);
    margin-left: 2px;
    font-size: 0.6rem;

    &:hover {
      color: var(--danger);
    }
  }
}

.entity-grid {
  @include entity-grid;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.expanded {
    max-height: 2000px;
    padding: 8px 0;
  }
}

.section-label {
  width: 100%;
  font-size: 0.6rem;
  color: var(--text-muted);
  margin: 4px 0;
  font-weight: 600;
}

.entity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all $transition;
  min-width: 70px;
  max-width: 90px;

  &:hover {
    border-color: var(--border-glow);
    background: var(--bg-card-hover);
  }

  &.selected {
    border-color: var(--accent-primary);
    background: var(--bg-selected);
    box-shadow: 0 0 8px var(--accent-glow);
  }

  &.rarity-common { border-left: 2px solid var(--rarity-common); }
  &.rarity-uncommon { border-left: 2px solid var(--rarity-uncommon); }
  &.rarity-rare { border-left: 2px solid var(--rarity-rare); }
  &.rarity-epic { border-left: 2px solid var(--rarity-epic); }
  &.rarity-legendary { border-left: 2px solid var(--rarity-legendary); }
}

.entity-name {
  font-size: 0.55rem;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.2;
}
</style>
