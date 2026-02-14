<script setup lang="ts">
defineProps<{
  src?: string
  alt: string
  fallbackEmoji?: string
}>()

function onImageError(e: Event): void {
  const img = e.target as HTMLImageElement
  const fallback = img.dataset.fallback || '🎱'
  const span = document.createElement('span')
  span.className = 'img-placeholder'
  span.textContent = fallback
  img.replaceWith(span)
}
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt"
    loading="lazy"
    :data-fallback="fallbackEmoji ?? '🎱'"
    @error="onImageError"
  />
  <span v-else class="img-placeholder">{{ fallbackEmoji ?? '🎱' }}</span>
</template>

<style lang="scss" scoped>
img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 6px;
}
</style>
