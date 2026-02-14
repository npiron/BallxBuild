<script setup lang="ts">
import type { NextPickup } from '@/types'
import EntityImage from '@/components/shared/EntityImage.vue'

defineProps<{
  pickups: NextPickup[]
}>()
</script>

<template>
  <div v-if="pickups.length" class="next-pickups-section">
    <h3 class="section-subtitle"><span class="icon">🎯</span> Prochaine Balle à Trouver</h3>
    <p class="section-hint">Balles qui débloquent le plus d'évolutions si tu les trouves</p>
    <div class="pickup-grid">
      <div v-for="p in pickups" :key="p.ball" class="pickup-card">
        <EntityImage :src="p.image" :alt="p.ball" fallback-emoji="⚪" />
        <div class="pickup-info">
          <span class="pickup-name">{{ p.ball }}</span>
          <span
            v-if="p.rarity"
            class="pickup-rarity"
            :class="`rarity-${p.rarity.toLowerCase()}`"
          >
            {{ p.rarity }}
          </span>
          <span class="pickup-unlocks">
            Débloque :
            <strong v-for="(u, i) in p.unlocks" :key="u">
              {{ u }}{{ i < p.unlocks.length - 1 ? ', ' : '' }}
            </strong>
          </span>
        </div>
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

.pickup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.pickup-card {
  @include card-style;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
}

.pickup-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pickup-name {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--text-primary);
}

.pickup-rarity {
  font-size: 0.65rem;
  font-weight: 600;
  &.rarity-common { color: var(--rarity-common); }
  &.rarity-uncommon { color: var(--rarity-uncommon); }
  &.rarity-rare { color: var(--rarity-rare); }
  &.rarity-epic { color: var(--rarity-epic); }
  &.rarity-legendary { color: var(--rarity-legendary); }
}

.pickup-unlocks {
  font-size: 0.7rem;
  color: var(--text-muted);

  strong {
    color: var(--accent-secondary);
  }
}
</style>
