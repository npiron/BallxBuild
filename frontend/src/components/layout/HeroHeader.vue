<script setup lang="ts">
</script>

<template>
  <header class="hero">
    <div class="hero-bg" />
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="ball-emoji">🎱</span>
        BALL <span class="x">x</span> BUILD
      </h1>
      <p class="hero-subtitle">Suggérateur de Builds Intelligent</p>
      <p class="hero-desc">
        Renseigne l'état de ta run — personnage, biome, balles, passifs — et obtiens les meilleurs builds optimisés.
      </p>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.hero {
  position: relative;
  padding: 60px 20px 40px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.15), transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(99, 102, 241, 0.1), transparent 60%),
    linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-family: $font-display;
  font-size: clamp(1.5rem, 5vw, 2.8rem);
  color: var(--text-primary);
  margin-bottom: 12px;
  text-shadow: 0 0 30px var(--accent-glow);
  letter-spacing: 2px;

  .x {
    color: var(--accent-primary);
    text-shadow: 0 0 20px var(--accent-glow);
  }
}

.ball-emoji {
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
  margin-right: 8px;
}

.hero-subtitle {
  font-family: $font-display;
  font-size: clamp(0.5rem, 2vw, 0.7rem);
  color: var(--accent-secondary);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.hero-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  max-width: 500px;
  margin: 0 auto;
}

@include mobile {
  .hero {
    padding: 40px 16px 24px;
  }
}
</style>
