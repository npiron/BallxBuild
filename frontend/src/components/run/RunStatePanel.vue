<script setup lang="ts">
import CharacterGrid from './CharacterGrid.vue'
import BiomeGrid from './BiomeGrid.vue'
import BallSelector from './BallSelector.vue'
import PassiveSelector from './PassiveSelector.vue'
import StyleButtons from './StyleButtons.vue'
import ActionBar from './ActionBar.vue'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  suggest: []
  reset: []
}>()
</script>

<template>
  <section class="panel run-state">
    <h2 class="panel-title">
      <span class="icon">⚙️</span> État de ta Run
    </h2>
    <CharacterGrid />
    <BiomeGrid />
    <BallSelector />
    <PassiveSelector />
    <StyleButtons />
    <ActionBar
      :loading="loading"
      @suggest="emit('suggest')"
      @reset="emit('reset')"
    />
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.panel {
  @include card-style;
  margin-bottom: 24px;
  padding: 24px;
}

.panel-title {
  @include section-title;
  font-size: 0.8rem;
  margin-bottom: 24px;
}
</style>
