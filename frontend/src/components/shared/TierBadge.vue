<script setup lang="ts">
defineProps<{
  tier: string
}>()

function tierClass(tier: string): string {
  return `tier-${tier.toLowerCase().replace('+', '-plus')}`
}
</script>

<template>
  <span class="tier-badge" :class="tierClass(tier)">{{ tier }}</span>
</template>

<style lang="scss" scoped>
.tier-badge {
  font-family: var(--font-display);
  font-size: 0.45rem;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid;
  line-height: 1;
  white-space: nowrap;

  &.tier-s-plus {
    color: var(--tier-s-plus);
    border-color: var(--tier-s-plus);
    background: rgba(255, 61, 0, 0.1);
  }
  &.tier-s {
    color: var(--tier-s);
    border-color: var(--tier-s);
    background: rgba(255, 107, 53, 0.1);
  }
  &.tier-a-plus, &.tier-a {
    color: var(--tier-a);
    border-color: var(--tier-a);
    background: rgba(251, 191, 36, 0.1);
  }
  &.tier-b {
    color: var(--tier-b);
    border-color: var(--tier-b);
    background: rgba(96, 165, 250, 0.1);
  }
  &.tier-c {
    color: var(--tier-c);
    border-color: var(--tier-c);
    background: rgba(156, 163, 175, 0.1);
  }
}
</style>
