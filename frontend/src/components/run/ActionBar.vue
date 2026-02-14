<script setup lang="ts">
const emit = defineEmits<{
  suggest: []
  reset: []
}>()

defineProps<{
  loading: boolean
}>()
</script>

<template>
  <div class="action-bar">
    <button
      class="btn btn-primary"
      :class="{ loading }"
      :disabled="loading"
      @click="emit('suggest')"
    >
      <template v-if="loading">
        <span class="spinner" />
        Analyse en cours...
      </template>
      <template v-else>
        <span class="btn-icon">🔮</span>
        Analyser & Suggérer
      </template>
    </button>
    <button class="btn btn-secondary" @click="emit('reset')">
      <span class="btn-icon">🔄</span>
      Reset
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.action-bar {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: $radius;
  font-family: $font-display;
  font-size: 0.6rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all $transition;

  .btn-icon {
    font-size: 1.1rem;
  }
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), #6d28d9);
  color: white;
  box-shadow: 0 4px 16px var(--accent-glow);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px var(--accent-glow);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.loading {
    opacity: 0.8;
  }
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);

  &:hover {
    border-color: var(--border-glow);
    color: var(--text-primary);
  }
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@include mobile {
  .action-bar {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
