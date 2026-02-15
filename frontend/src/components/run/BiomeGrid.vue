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

.input-group { @include input-group; }
.input-label { @include input-label; }
.entity-grid { @include entity-grid; }
.entity-item { @include entity-item; }
.entity-name { @include entity-name; }
</style>
