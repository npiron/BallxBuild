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

.input-group { @include input-group; }
.input-label { @include input-label; }
.entity-grid { @include entity-grid; }
.character-grid { gap: 8px; }

.entity-item {
  @include entity-item;
  position: relative;
}

.entity-name { @include entity-name; }

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
